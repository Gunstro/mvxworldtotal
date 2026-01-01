-- ============================================================================
-- CREATE 47 CHECKUSERS FOR COMMISSION TESTING
-- ============================================================================
-- This script creates test users with proper matrix placement
-- RUN IN SUPABASE SQL EDITOR
-- ============================================================================

-- NOTE: We need to create entries in auth.users first, then profiles, then matrix_positions
-- Since we can't directly insert into auth.users via SQL, we'll use a workaround
-- by creating UUIDs and inserting into profiles with the assumption that
-- RLS is disabled for this test OR we're running as superuser.

-- ============================================================================
-- STEP 1: GENERATE UUIDs FOR ALL TEST USERS
-- ============================================================================
DO $$
DECLARE
    v_user_ids UUID[] := ARRAY[]::UUID[];
    v_position_ids UUID[] := ARRAY[]::UUID[];
    v_root_position_id UUID;
    v_visa_founder_id UUID;
    v_visa_premiere_id UUID;
    v_visa_standard_id UUID;
    i INTEGER;
BEGIN
    -- Get visa IDs for appropriate levels
    SELECT id INTO v_visa_founder_id FROM visas WHERE visa_type ILIKE '%founder%' AND is_active = true LIMIT 1;
    SELECT id INTO v_visa_premiere_id FROM visas WHERE visa_type ILIKE '%premiere%' AND is_active = true LIMIT 1;
    SELECT id INTO v_visa_standard_id FROM visas WHERE visa_type ILIKE '%executive%' OR visa_type ILIKE '%ambassador%' AND is_active = true LIMIT 1;
    
    -- Fallback if not found
    IF v_visa_standard_id IS NULL THEN
        SELECT id INTO v_visa_standard_id FROM visas WHERE is_active = true LIMIT 1;
    END IF;
    
    -- Get root position (0,1)
    SELECT id INTO v_root_position_id FROM matrix_positions WHERE readable_position = '0,1';
    
    IF v_root_position_id IS NULL THEN
        RAISE EXCEPTION 'Root position 0,1 not found. Please ensure matrix root exists.';
    END IF;
    
    -- Generate 47 UUIDs for users
    FOR i IN 1..47 LOOP
        v_user_ids := v_user_ids || gen_random_uuid();
        v_position_ids := v_position_ids || gen_random_uuid();
    END LOOP;
    
    -- ========================================================================
    -- STEP 2: INSERT PROFILES
    -- ========================================================================
    -- Using a temporary approach - insert directly into profiles
    -- In production, users would be created via auth.signUp
    
    FOR i IN 1..47 LOOP
        INSERT INTO profiles (id, username, display_name, email, created_at, updated_at)
        VALUES (
            v_user_ids[i],
            'checkuser' || i,
            'Checkuser' || i,
            'checkuser' || i || '@test.megavx.com',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created 47 profiles';
    
    -- ========================================================================
    -- STEP 3: INSERT MATRIX POSITIONS
    -- ========================================================================
    
    -- Level 1: Checkuser1 (1,1) under root
    INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
    VALUES (v_position_ids[1], v_user_ids[1], v_root_position_id, v_visa_founder_id, 1, 1, 1, 1, '1,1', 20, 20, true, NOW());
    
    -- Level 1: Checkuser2 (1,2) under root
    INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
    VALUES (v_position_ids[2], v_user_ids[2], v_root_position_id, v_visa_founder_id, 1, 1, 2, 2, '1,2', 0, 20, false, NOW());
    
    -- Level 2: Checkuser3-22 (2,1 to 2,20) under Checkuser1 (position_ids[1])
    FOR i IN 3..22 LOOP
        INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
        VALUES (
            v_position_ids[i], 
            v_user_ids[i], 
            v_position_ids[1],  -- Under Checkuser1
            v_visa_premiere_id, 
            2, 
            2, 
            i - 2,  -- Position 1-20
            i - 2, 
            '2,' || (i - 2), 
            CASE WHEN i = 3 THEN 10 ELSE 0 END,  -- Checkuser3 has children
            10, 
            CASE WHEN i = 3 THEN true ELSE false END,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created Level 1-2 positions';
    
    -- Level 3: Checkuser23-32 (3,1 to 3,10) under Checkuser3 (position_ids[3])
    FOR i IN 23..32 LOOP
        INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
        VALUES (
            v_position_ids[i], 
            v_user_ids[i], 
            v_position_ids[3],  -- Under Checkuser3
            v_visa_standard_id, 
            3, 
            3, 
            i - 22,  -- Position 1-10
            i - 22, 
            '3,' || (i - 22), 
            CASE WHEN i = 23 THEN 5 ELSE 0 END,  -- Checkuser23 has children
            5, 
            CASE WHEN i = 23 THEN true ELSE false END,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created Level 3 positions';
    
    -- Level 4: Checkuser33-37 (4,1 to 4,5) under Checkuser23 (position_ids[23])
    FOR i IN 33..37 LOOP
        INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
        VALUES (
            v_position_ids[i], 
            v_user_ids[i], 
            v_position_ids[23],  -- Under Checkuser23
            v_visa_standard_id, 
            3, 
            4, 
            i - 32,  -- Position 1-5
            i - 32, 
            '4,' || (i - 32), 
            CASE WHEN i = 33 THEN 5 ELSE 0 END,  -- Checkuser33 has children
            5, 
            CASE WHEN i = 33 THEN true ELSE false END,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created Level 4 positions';
    
    -- Level 5: Checkuser38-42 (5,1 to 5,5) under Checkuser33 (position_ids[33])
    -- NOTE: Adjusted to 5,1-5,5 instead of 5,5-5,9 for consistency
    FOR i IN 38..42 LOOP
        INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
        VALUES (
            v_position_ids[i], 
            v_user_ids[i], 
            v_position_ids[33],  -- Under Checkuser33
            v_visa_standard_id, 
            3, 
            5, 
            i - 37,  -- Position 1-5
            i - 37, 
            '5,' || (i - 37), 
            CASE WHEN i = 38 THEN 5 ELSE 0 END,  -- Checkuser38 has children
            5, 
            CASE WHEN i = 38 THEN true ELSE false END,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created Level 5 positions';
    
    -- Level 6: Checkuser43-47 (6,1 to 6,5) under Checkuser38 (position_ids[38])
    FOR i IN 43..47 LOOP
        INSERT INTO matrix_positions (id, user_id, sponsor_id, visa_id, matrix_level, level_depth, level_position, position_number, readable_position, children_count, max_children, is_full, created_at)
        VALUES (
            v_position_ids[i], 
            v_user_ids[i], 
            v_position_ids[38],  -- Under Checkuser38
            v_visa_standard_id, 
            3, 
            6, 
            i - 42,  -- Position 1-5
            i - 42, 
            '6,' || (i - 42), 
            0, 
            5, 
            false,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created Level 6 positions';
    
    -- ========================================================================
    -- STEP 4: CREATE WALLETS FOR ALL TEST USERS
    -- ========================================================================
    FOR i IN 1..47 LOOP
        INSERT INTO user_wallets (user_id, available_balance, pending_balance, total_earned)
        VALUES (v_user_ids[i], 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created 47 wallets';
    RAISE NOTICE '✅ All 47 Checkusers created successfully!';
    
END $$;

-- ============================================================================
-- STEP 5: VERIFY THE STRUCTURE
-- ============================================================================
SELECT 
    p.username,
    mp.readable_position,
    sponsor_mp.readable_position as upline_position,
    sponsor_p.username as upline_username,
    mp.level_depth
FROM matrix_positions mp
JOIN profiles p ON p.id = mp.user_id
LEFT JOIN matrix_positions sponsor_mp ON sponsor_mp.id = mp.sponsor_id
LEFT JOIN profiles sponsor_p ON sponsor_p.id = sponsor_mp.user_id
WHERE p.username LIKE 'checkuser%'
ORDER BY mp.level_depth, mp.level_position;
