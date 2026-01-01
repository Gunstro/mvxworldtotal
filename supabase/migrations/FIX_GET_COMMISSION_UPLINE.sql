-- ============================================================================
-- FIX: GET_COMMISSION_UPLINE FUNCTION
-- ============================================================================
-- Fixes the ambiguous column reference error
-- ============================================================================

CREATE OR REPLACE FUNCTION get_commission_upline(p_user_id UUID)
RETURNS TABLE (
    upline_level INTEGER,
    position_id UUID,
    user_id UUID
) AS $$
DECLARE
    v_current_position matrix_positions%ROWTYPE;
    v_level INTEGER := 0;
BEGIN
    -- Get user's position (explicit table reference)
    SELECT * INTO v_current_position
    FROM matrix_positions mp
    WHERE mp.user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Traverse up 5 levels
    WHILE v_level < 5 AND v_current_position.sponsor_id IS NOT NULL LOOP
        -- Move to sponsor
        SELECT * INTO v_current_position
        FROM matrix_positions mp
        WHERE mp.id = v_current_position.sponsor_id;
        
        IF NOT FOUND OR v_current_position.matrix_level = 0 THEN
            EXIT;  -- Stop at Poverty Relief
        END IF;
        
        v_level := v_level + 1;
        
        RETURN QUERY SELECT 
            v_level,
            v_current_position.id,
            v_current_position.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ get_commission_upline function fixed' as status;
