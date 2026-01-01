-- ============================================================================
-- FIXED COMMISSION DISTRIBUTION FUNCTION
-- ============================================================================
-- Distributes 40% of VISA purchase to upline (5 levels)
-- 60% goes to company, unclaimed commissions go to Poverty Fund
-- ============================================================================

DROP FUNCTION IF EXISTS distribute_visa_commission CASCADE;

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
    v_total_paid DECIMAL(10,2) := 0;
    v_username TEXT;
BEGIN
    -- Calculate splits
    v_company_amount := p_purchase_amount * 0.60;  -- 60% to company
    v_commission_pool := p_purchase_amount * 0.40;  -- 40% commission pool
    
    RAISE NOTICE 'Processing commission for purchase of AF %', p_purchase_amount;
    RAISE NOTICE 'Company receives: AF % (60%%)', v_company_amount;
    RAISE NOTICE 'Commission pool: AF % (40%%)', v_commission_pool;
    
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
                -- Get username (with explicit cast to TEXT)
                SELECT p.username::TEXT INTO v_username
                FROM profiles p WHERE p.id = v_upline.user_id;
                
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
                
                v_total_paid := v_total_paid + v_commission;
                
                RAISE NOTICE 'Level %: AF % (%%%) → %', 
                    v_upline.upline_level, v_commission, v_rate.commission_percentage, v_username;
                
                -- Return result
                RETURN QUERY SELECT 
                    v_upline.upline_level,
                    v_upline.user_id,
                    v_username,
                    v_commission,
                    v_rate.commission_percentage,
                    '✅ Paid to user'::TEXT;
                
            ELSE
                -- Upline is system/Poverty Relief → send to Poverty Fund
                v_poverty_fund_total := v_poverty_fund_total + v_commission;
                
                RAISE NOTICE 'Level %: AF % (%%%) → Poverty Fund (no user)', 
                    v_upline.upline_level, v_commission, v_rate.commission_percentage;
                
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
    
    -- Handle remaining unclaimed commissions (levels that don't have upline)
    -- This catches cases where the tree is shallow
    DECLARE
        v_unclaimed DECIMAL(10,2);
        v_expected_levels INTEGER := 5;
        v_actual_levels INTEGER;
    BEGIN
        SELECT COUNT(*) INTO v_actual_levels 
        FROM get_commission_upline(p_purchaser_user_id);
        
        -- If we have fewer than 5 levels of upline, remaining goes to poverty fund
        IF v_actual_levels < v_expected_levels THEN
            -- Calculate what wasn't distributed
            v_unclaimed := v_commission_pool - v_total_paid - v_poverty_fund_total;
            
            IF v_unclaimed > 0 THEN
                v_poverty_fund_total := v_poverty_fund_total + v_unclaimed;
                
                RAISE NOTICE 'Unclaimed from missing levels: AF %', v_unclaimed;
                
                RETURN QUERY SELECT 
                    0::INTEGER,
                    NULL::UUID,
                    'Poverty Fund (Unclaimed)'::TEXT,
                    v_unclaimed,
                    0::DECIMAL(5,2),
                    '💰 Unclaimed commission'::TEXT;
            END IF;
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
        
        RAISE NOTICE 'Total to Poverty Fund: AF %', v_poverty_fund_total;
    END IF;
    
    RAISE NOTICE '=== DISTRIBUTION COMPLETE ===';
    RAISE NOTICE 'Total paid to users: AF %', v_total_paid;
    RAISE NOTICE 'Total to Poverty Fund: AF %', v_poverty_fund_total;
    RAISE NOTICE 'Company revenue: AF %', v_company_amount;
    
END;
$$ LANGUAGE plpgsql;

SELECT '✅ distribute_visa_commission function recreated with type fixes' as status;
