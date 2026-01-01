-- ============================================================================
-- MANUAL MLM PLACEMENT FOR 19 TEST USERS
-- ============================================================================
-- This script places all test users in a ternary (3-wide) matrix structure
-- 
-- STRUCTURE:
-- Level 1: Founder (1 user)
-- Level 2: poweruser, poweruser1, poweruser2 (3 users under founder)
-- Level 3: poweruser3, midtier, midtier1, midtier2, midtier3, newbie, newbie1, newbie2, newbie3 (9 users)
-- Level 4: user, user1, user2, user3, user4, user5 (6 users)
--
-- IMPORTANT: Run this AFTER all 19 users have registered!
-- ============================================================================

DO $$
DECLARE
    -- User IDs (will be fetched dynamically)
    v_founder_id UUID;
    v_poweruser_id UUID;
    v_poweruser1_id UUID;
    v_poweruser2_id UUID;
    v_poweruser3_id UUID;
    v_midtier_id UUID;
    v_midtier1_id UUID;
    v_midtier2_id UUID;
    v_midtier3_id UUID;
    v_newbie_id UUID;
    v_newbie1_id UUID;
    v_newbie2_id UUID;
    v_newbie3_id UUID;
    v_user_id UUID;
    v_user1_id UUID;
    v_user2_id UUID;
    v_user3_id UUID;
    v_user4_id UUID;
    v_user5_id UUID;
    
    -- VISA IDs
    v_gold_vip_founder_visa_id UUID;
    v_vip_founder_visa_id UUID;
    v_gold_premiere_visa_id UUID;
    v_premiere_visa_id UUID;
    v_ambassador_visa_id UUID;
    v_executive_visa_id UUID;
    v_city_patron_visa_id UUID;
    v_city_dweller_visa_id UUID;
    v_novice_visa_id UUID;
    v_free_visa_id UUID;
    
BEGIN
    -- ========================================================================
    -- STEP 1: Get all user IDs by email
    -- ========================================================================
    SELECT id INTO v_founder_id FROM profiles WHERE email = 'founder@gunstro.com';
    SELECT id INTO v_poweruser_id FROM profiles WHERE email = 'poweruser@gunstro.com';
    SELECT id INTO v_poweruser1_id FROM profiles WHERE email = 'poweruser1@gunstro.com';
    SELECT id INTO v_poweruser2_id FROM profiles WHERE email = 'poweruser2@gunstro.com';
    SELECT id INTO v_poweruser3_id FROM profiles WHERE email = 'poweruser3@gunstro.com';
    SELECT id INTO v_midtier_id FROM profiles WHERE email = 'midtier@gunstro.com';
    SELECT id INTO v_midtier1_id FROM profiles WHERE email = 'midtier1@gunstro.com';
    SELECT id INTO v_midtier2_id FROM profiles WHERE email = 'midtier2@gunstro.com';
    SELECT id INTO v_midtier3_id FROM profiles WHERE email = 'midtier3@gunstro.com';
    SELECT id INTO v_newbie_id FROM profiles WHERE email = 'newbie@gunstro.com';
    SELECT id INTO v_newbie1_id FROM profiles WHERE email = 'newbie1@gunstro.com';
    SELECT id INTO v_newbie2_id FROM profiles WHERE email = 'newbie2@gunstro.com';
    SELECT id INTO v_newbie3_id FROM profiles WHERE email = 'newbie3@gunstro.com';
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user@gunstro.com';
    SELECT id INTO v_user1_id FROM profiles WHERE email = 'user1@gunstro.com';
    SELECT id INTO v_user2_id FROM profiles WHERE email = 'user2@gunstro.com';
    SELECT id INTO v_user3_id FROM profiles WHERE email = 'user3@gunstro.com';
    SELECT id INTO v_user4_id FROM profiles WHERE email = 'user4@gunstro.com';
    SELECT id INTO v_user5_id FROM profiles WHERE email = 'user5@gunstro.com';
    
    -- ========================================================================
    -- STEP 2: Get VISA IDs
    -- ========================================================================
    SELECT id INTO v_gold_vip_founder_visa_id FROM visas WHERE visa_type = 'Gold VIP Founder';
    SELECT id INTO v_vip_founder_visa_id FROM visas WHERE visa_type = 'VIP Founder';
    SELECT id INTO v_gold_premiere_visa_id FROM visas WHERE visa_type = 'Gold Premiere';
    SELECT id INTO v_premiere_visa_id FROM visas WHERE visa_type = 'Premiere';
    SELECT id INTO v_ambassador_visa_id FROM visas WHERE visa_type = 'Ambassador';
    SELECT id INTO v_executive_visa_id FROM visas WHERE visa_type = 'Executive';
    SELECT id INTO v_city_patron_visa_id FROM visas WHERE visa_type = 'City Patron';
    SELECT id INTO v_city_dweller_visa_id FROM visas WHERE visa_type = 'City Dweller';
    SELECT id INTO v_novice_visa_id FROM visas WHERE visa_type = 'Novice';
    SELECT id INTO v_free_visa_id FROM visas WHERE visa_type = 'Free';
    
    -- ========================================================================
    -- STEP 3: Place users in matrix (TOP TO BOTTOM)
    -- ========================================================================
    
    RAISE NOTICE '🎯 Placing FOUNDER at the top...';
    -- Founder at top (no referrer)
    PERFORM place_user_in_matrix(v_founder_id, v_gold_vip_founder_visa_id, NULL);
    
    RAISE NOTICE '🎯 Placing LEVEL 2 users (3 under founder)...';
    -- Level 2: 3 power users under founder
    PERFORM place_user_in_matrix(v_poweruser_id, v_vip_founder_visa_id, v_founder_id);
    PERFORM place_user_in_matrix(v_poweruser1_id, v_gold_premiere_visa_id, v_founder_id);
    PERFORM place_user_in_matrix(v_poweruser2_id, v_gold_premiere_visa_id, v_founder_id);
    
    RAISE NOTICE '🎯 Placing LEVEL 3 users (under power users)...';
    -- Level 3: Under poweruser (first 3)
    PERFORM place_user_in_matrix(v_poweruser3_id, v_premiere_visa_id, v_poweruser_id);
    PERFORM place_user_in_matrix(v_midtier_id, v_ambassador_visa_id, v_poweruser_id);
    PERFORM place_user_in_matrix(v_midtier1_id, v_executive_visa_id, v_poweruser_id);
    
    -- Level 3: Under poweruser1 (next 3)
    PERFORM place_user_in_matrix(v_midtier2_id, v_executive_visa_id, v_poweruser1_id);
    PERFORM place_user_in_matrix(v_midtier3_id, v_city_patron_visa_id, v_poweruser1_id);
    PERFORM place_user_in_matrix(v_newbie_id, v_city_dweller_visa_id, v_poweruser1_id);
    
    -- Level 3: Under poweruser2 (last 3)
    PERFORM place_user_in_matrix(v_newbie1_id, v_novice_visa_id, v_poweruser2_id);
    PERFORM place_user_in_matrix(v_newbie2_id, v_novice_visa_id, v_poweruser2_id);
    PERFORM place_user_in_matrix(v_newbie3_id, v_free_visa_id, v_poweruser2_id);
    
    RAISE NOTICE '🎯 Placing LEVEL 4 users (under mid-tier)...';
    -- Level 4: Under poweruser3 (2 users)
    PERFORM place_user_in_matrix(v_user_id, v_executive_visa_id, v_poweruser3_id);
    PERFORM place_user_in_matrix(v_user1_id, v_city_patron_visa_id, v_poweruser3_id);
    
    -- Level 4: Under midtier (2 users)
    PERFORM place_user_in_matrix(v_user2_id, v_city_dweller_visa_id, v_midtier_id);
    PERFORM place_user_in_matrix(v_user3_id, v_novice_visa_id, v_midtier_id);
    
    -- Level 4: Under midtier1 (2 users)
    PERFORM place_user_in_matrix(v_user4_id, v_free_visa_id, v_midtier1_id);
    PERFORM place_user_in_matrix(v_user5_id, v_free_visa_id, v_midtier1_id);
    
    RAISE NOTICE '✅ MLM matrix placement complete!';
    
END $$;

-- ========================================================================
-- VERIFICATION: Check the matrix structure
-- ========================================================================
SELECT 
    p.username,
    p.email,
    v.visa_type,
    mp.depth,
    mp.position_number,
    mp.children_count,
    sponsor.username as sponsor_username
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN profiles sponsor ON mp.sponsor_id = (
    SELECT user_id FROM matrix_positions WHERE id = mp.sponsor_id
)
LEFT JOIN visas v ON mp.visa_id = v.id
ORDER BY mp.global_position;

-- Success message
SELECT '🎉 ALL 19 USERS PLACED IN MLM MATRIX!' as status;
