-- ============================================================================
-- FIXED COMMISSION DISTRIBUTION FUNCTION V3
-- ============================================================================
-- Correctly distributes 40% across ALL 5 levels
-- Each level goes to either a real user OR Poverty Relief
-- 40% is ALWAYS fully distributed - no exceptions
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
    v_users_total DECIMAL(10,2) := 0;
    v_current_position_id UUID;
    v_parent_position_id UUID;
    v_parent_user_id UUID;
    v_rate RECORD;
    v_commission DECIMAL(10,2);
    v_username TEXT;
    v_level INTEGER;
BEGIN
    -- Calculate splits
    v_company_amount := p_purchase_amount * 0.60;  -- 60% to company
    v_commission_pool := p_purchase_amount * 0.40;  -- 40% commission pool
    
    -- Get purchaser's matrix position
    SELECT id INTO v_current_position_id
    FROM matrix_positions
    WHERE user_id = p_purchaser_user_id;
    
    IF v_current_position_id IS NULL THEN
        RAISE EXCEPTION 'Purchaser not found in matrix';
    END IF;
    
    -- Iterate through exactly 5 levels of upline
    FOR v_level IN 1..5 LOOP
        -- Get commission rate for this level
        SELECT * INTO v_rate 
        FROM commission_rates 
        WHERE upline_level = v_level
          AND is_active = TRUE;
        
        IF v_rate IS NULL THEN
            RAISE EXCEPTION 'Commission rate not found for level %', v_level;
        END IF;
        
        -- Calculate commission amount for this level
        v_commission := p_purchase_amount * (v_rate.commission_percentage / 100);
        
        -- Get parent position (sponsor)
        SELECT sponsor_id INTO v_parent_position_id
        FROM matrix_positions
        WHERE id = v_current_position_id;
        
        -- Get user_id of parent position (if exists)
        IF v_parent_position_id IS NOT NULL THEN
            SELECT user_id INTO v_parent_user_id
            FROM matrix_positions
            WHERE id = v_parent_position_id;
        ELSE
            v_parent_user_id := NULL;
        END IF;
        
        -- Check if parent is a real user (not system/Poverty Relief)
        IF v_parent_user_id IS NOT NULL THEN
            -- Real user found - credit them
            SELECT p.username::TEXT INTO v_username 
            FROM profiles p WHERE p.id = v_parent_user_id;
            
            -- Credit user's wallet
            UPDATE user_wallets
            SET 
                pending_balance = pending_balance + v_commission,
                total_earned = total_earned + v_commission,
                updated_at = NOW()
            WHERE user_id = v_parent_user_id;
            
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
                v_parent_user_id,
                p_purchaser_user_id,
                p_purchase_id,
                v_level,
                v_commission,
                v_rate.commission_percentage,
                'visa_purchase_commission',
                'pending',
                NOW()
            );
            
            v_users_total := v_users_total + v_commission;
            
            RETURN QUERY SELECT 
                v_level,
                v_parent_user_id,
                v_username,
                v_commission,
                v_rate.commission_percentage,
                '✅ Paid to user'::TEXT;
            
            -- Move up to next level
            v_current_position_id := v_parent_position_id;
        ELSE
            -- No real user at this level - goes to Poverty Relief
            v_poverty_fund_total := v_poverty_fund_total + v_commission;
            
            RETURN QUERY SELECT 
                v_level,
                NULL::UUID,
                'Poverty Relief'::TEXT,
                v_commission,
                v_rate.commission_percentage,
                '💰 To Poverty Fund'::TEXT;
            
            -- From here on, all remaining levels go to Poverty Relief
            -- (no more real users above this point)
            -- Continue to next level but with no position to trace
            v_current_position_id := NULL;
        END IF;
    END LOOP;
    
    -- Update poverty_fund table with total
    IF v_poverty_fund_total > 0 THEN
        UPDATE poverty_fund
        SET 
            total_balance = total_balance + v_poverty_fund_total,
            total_received = total_received + v_poverty_fund_total,
            updated_at = NOW()
        WHERE id = (SELECT id FROM poverty_fund LIMIT 1);
        
        -- If no poverty_fund record exists, create one
        IF NOT FOUND THEN
            INSERT INTO poverty_fund (total_balance, total_received)
            VALUES (v_poverty_fund_total, v_poverty_fund_total);
        END IF;
    END IF;
    
    -- Log summary
    RAISE NOTICE '=== COMMISSION DISTRIBUTION COMPLETE ===';
    RAISE NOTICE 'Purchase Amount: AF %', p_purchase_amount;
    RAISE NOTICE 'Users received: AF % (%.2f%%)', v_users_total, (v_users_total / p_purchase_amount * 100);
    RAISE NOTICE 'Poverty Fund received: AF % (%.2f%%)', v_poverty_fund_total, (v_poverty_fund_total / p_purchase_amount * 100);
    RAISE NOTICE 'Company receives: AF % (60%%)', v_company_amount;
    RAISE NOTICE 'Total distributed: AF % (should be 40%%)', v_users_total + v_poverty_fund_total;
    
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION: Check that all 5 levels have rates
-- ============================================================================
SELECT 
    upline_level as "Level",
    commission_percentage || '%' as "Rate",
    description
FROM commission_rates 
WHERE is_active = TRUE
ORDER BY upline_level;

SELECT '✅ distribute_visa_commission V3 created - always distributes all 40% across 5 levels' as status;
