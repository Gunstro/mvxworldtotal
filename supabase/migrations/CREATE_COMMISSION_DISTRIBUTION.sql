-- ============================================================================
-- COMMISSION DISTRIBUTION FUNCTION
-- ============================================================================
-- Distributes 40% of VISA purchase to upline (5 levels)
-- 60% goes to company, unclaimed commissions go to Poverty Fund
-- ============================================================================

CREATE OR REPLACE FUNCTION distribute_visa_commission(
    p_purchaser_user_id UUID,
    p_purchase_amount DECIMAL(10,2),
    p_purchase_id UUID
)
RETURNS TABLE(
    level INTEGER,
    recipient_user_id UUID,
    recipient_username TEXT,
    commission_amount DECIMAL(10,2),
    commission_percentage DECIMAL(5,2),
    status TEXT
) AS $$
DECLARE
    v_company_amount DECIMAL(10,2);
    v_commission_pool DECIMAL(10,2);
    v_poverty_fund_total DECIMAL(10,2) := 0;
    v_upline RECORD;
    v_rate RECORD;
    v_commission DECIMAL(10,2);
BEGIN
    -- Calculate splits
    v_company_amount := p_purchase_amount * 0.60;  -- 60% to company
    v_commission_pool := p_purchase_amount * 0.40;  -- 40% commission pool
    
    -- Log company portion (optional - for tracking)
    RAISE NOTICE 'Company receives: £% (60%%)', v_company_amount;
    
    -- Get upline (5 levels up from purchaser)
    FOR v_upline IN 
        SELECT * FROM get_commission_upline(p_purchaser_user_id)
        ORDER BY upline_level
    LOOP
        -- Get commission rate for this level
        SELECT * INTO v_rate 
        FROM commission_rates 
        WHERE upline_level = v_upline.upline_level
          AND is_active = TRUE;
        
        IF v_rate IS NOT NULL THEN
            -- Calculate commission amount
            v_commission := p_purchase_amount * (v_rate.commission_percentage / 100);
            
            -- Check if upline is a real user (not Poverty Relief/system)
            IF v_upline.user_id IS NOT NULL THEN
                -- Credit to upline user's wallet (pending balance - 10 day hold)
                UPDATE user_wallets
                SET 
                    pending_balance = pending_balance + v_commission,
                    total_earned = total_earned + v_commission,
                    updated_at = NOW()
                WHERE user_id = v_upline.user_id;
                
                -- Create commission transaction record
                INSERT INTO commission_transactions (
                    user_id,
                    from_user_id,
                    purchase_id,
                    upline_level,
                    commission_amount,
                    commission_percentage,
                    transaction_type,
                    status,
                    created_at
                ) VALUES (
                    v_upline.user_id,
                    p_purchaser_user_id,
                    p_purchase_id,
                    v_upline.upline_level,
                    v_commission,
                    v_rate.commission_percentage,
                    'visa_purchase_commission',
                    'pending',
                    NOW()
                );
                
                -- Return result
                RETURN QUERY SELECT 
                    v_upline.upline_level,
                    v_upline.user_id,
                    (SELECT username FROM profiles WHERE id = v_upline.user_id),
                    v_commission,
                    v_rate.commission_percentage,
                    '✅ Paid to user'::TEXT;
                
            ELSE
                -- Upline is system/Poverty Relief → send to Poverty Fund
                v_poverty_fund_total := v_poverty_fund_total + v_commission;
                
                RETURN QUERY SELECT 
                    v_upline.upline_level,
                    NULL::UUID,
                    'Poverty Fund'::TEXT,
                    v_commission,
                    v_rate.commission_percentage,
                    '💰 To Poverty Fund'::TEXT;
            END IF;
        END IF;
    END LOOP;
    
    -- Handle remaining unclaimed commissions (levels that don't exist)
    -- Calculate total paid vs total available (40%)
    DECLARE
        v_total_paid DECIMAL(10,2);
        v_unclaimed DECIMAL(10,2);
    BEGIN
        SELECT COALESCE(SUM(commission_amount), 0) INTO v_total_paid
        FROM commission_transactions
        WHERE purchase_id = p_purchase_id;
        
        v_unclaimed := v_commission_pool - v_total_paid;
        
        IF v_unclaimed > 0 THEN
            v_poverty_fund_total := v_poverty_fund_total + v_unclaimed;
            
            RETURN QUERY SELECT 
                0::INTEGER,
                NULL::UUID,
                'Poverty Fund (Unclaimed)'::TEXT,
                v_unclaimed,
                0::DECIMAL(5,2),
                '💰 Unclaimed commission'::TEXT;
        END IF;
    END;
    
    -- Update poverty_fund table
    IF v_poverty_fund_total > 0 THEN
        UPDATE poverty_fund
        SET 
            current_balance = current_balance + v_poverty_fund_total,
            total_received = total_received + v_poverty_fund_total,
            updated_at = NOW()
        WHERE id = (SELECT id FROM poverty_fund LIMIT 1);
        
        -- If no poverty_fund record exists, create one
        IF NOT FOUND THEN
            INSERT INTO poverty_fund (current_balance, total_received)
            VALUES (v_poverty_fund_total, v_poverty_fund_total);
        END IF;
    END IF;
    
    RAISE NOTICE 'Total to Poverty Fund: £%', v_poverty_fund_total;
    
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================
-- When user purchases a VISA:
-- SELECT * FROM distribute_visa_commission(
--     '123e4567-e89b-12d3-a456-426614174000',  -- purchaser_user_id
--     100.00,                                    -- purchase_amount (£100)
--     '123e4567-e89b-12d3-a456-426614174001'   -- purchase_id
-- );
-- ============================================================================

SELECT '✅ Commission distribution function created' as status;
