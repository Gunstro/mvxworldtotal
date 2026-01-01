-- ============================================================================
-- URGENT: PLACE ALL EXISTING USERS INTO MATRIX
-- ============================================================================
-- This script will place all current users who exist but are NOT in the matrix
-- Run this once to fix the "Users not placed" issue
-- ============================================================================

DO $$
DECLARE
    v_user RECORD;
    v_visa_id UUID;
    v_matrix_position_id UUID;
    v_poverty_relief_id UUID := '00000000-0000-0000-0000-000000000001';
    v_placed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🚀 Starting emergency matrix placement for existing users...';
    
    -- ========================================================================
    -- STEP 1: Verify Poverty Relief (Level 0) exists
    -- ========================================================================
    SELECT id INTO v_poverty_relief_id
    FROM matrix_positions
    WHERE matrix_level = 0 AND depth = 0
    LIMIT 1;
    
    IF v_poverty_relief_id IS NULL THEN
        RAISE NOTICE '⚠️  Creating Level 0 (Poverty Relief) position...';
        INSERT INTO matrix_positions (
            id,
            user_id,
            sponsor_id,
            matrix_level,
            position_number,
            global_position,
            depth,
            max_children,
            is_orphan,
            is_active
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            NULL,                     -- Level 0 has no user (system entity)
            NULL,                     -- No parent (root)
            0,                        -- Level 0
            1,                        -- Position 1
            1,                        -- Global position 1
            0,                        -- Depth 0 (root)
            20000,                    -- Can have 20,000 Founder children
            FALSE,
            TRUE
        ) ON CONFLICT (id) DO NOTHING;
        
        v_poverty_relief_id := '00000000-0000-0000-0000-000000000001';
        RAISE NOTICE '✅ Level 0 (Poverty Relief) created';
    ELSE
        RAISE NOTICE '✅ Level 0 (Poverty Relief) already exists: %', v_poverty_relief_id;
    END IF;
    
    -- ========================================================================
    -- STEP 2: Place ALL users who don't have a matrix position yet
    -- ========================================================================
    FOR v_user IN 
        SELECT 
            p.id as user_id,
            p.email,
            p.username,
            p.display_name,
            p.visa_id as current_visa_id
        FROM profiles p
        LEFT JOIN matrix_positions mp ON mp.user_id = p.id
        WHERE mp.id IS NULL  -- User NOT in matrix
        ORDER BY p.created_at ASC  -- Place oldest users first
    LOOP
        BEGIN
            -- Get user's visa (or use Free visa as default)
            v_visa_id := v_user.current_visa_id;
            
            IF v_visa_id IS NULL THEN
                -- User has no visa, assign 'Free' visa
                SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Free' LIMIT 1;
                
                IF v_visa_id IS NOT NULL THEN
                    -- Give them the Free visa
                    INSERT INTO user_visas (user_id, visa_id, is_active)
                    VALUES (v_user.user_id, v_visa_id, TRUE)
                    ON CONFLICT (user_id, visa_id) DO UPDATE SET is_active = TRUE;
                    
                    -- Update profile
                    UPDATE profiles SET visa_id = v_visa_id WHERE id = v_user.user_id;
                END IF;
            END IF;
            
            IF v_visa_id IS NOT NULL THEN
                -- Place user in matrix (as orphan - no referrer)
                v_matrix_position_id := place_user_in_matrix(
                    v_user.user_id,
                    v_visa_id,
                    NULL  -- No referrer (orphan placement)
                );
                
                v_placed_count := v_placed_count + 1;
                RAISE NOTICE '✅ [%] Placed user: % (%) VISA: % -> Position: %', 
                    v_placed_count,
                    COALESCE(v_user.display_name, v_user.username, 'Unknown'),
                    v_user.email,
                    v_visa_id,
                    v_matrix_position_id;
            ELSE
                RAISE WARNING '⚠️  Could not place user % - no visa available', v_user.email;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '❌ Error placing user %: %', v_user.email, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '🎉 PLACEMENT COMPLETE!';
    RAISE NOTICE '🎉 Total users placed: %', v_placed_count;
    RAISE NOTICE '🎉 ========================================';
    
END $$;

-- ========================================================================
-- VERIFICATION: Check results
-- ========================================================================
SELECT 
    depth,
    COUNT(*) as user_count
FROM matrix_positions
WHERE matrix_level > 0  -- Exclude Poverty Relief
GROUP BY depth
ORDER BY depth;

-- Show sample of placed users
SELECT 
    p.username,
   p.email,
    v.visa_type,
    mp.depth,
    mp.matrix_level,
    mp.position_number,
    mp.children_count
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN visas v ON mp.visa_id = v.id
WHERE mp.matrix_level > 0
ORDER BY mp.global_position
LIMIT 20;
