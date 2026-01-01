-- ============================================================================
-- MANUALLY ASSIGN VISAS TO ALL 19 EXISTING USERS
-- ============================================================================
-- This bypasses RLS and directly inserts the correct VISA for each user
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_visa_id UUID;
BEGIN
    -- User 1: founder → Gold VIP Founder
    SELECT id INTO v_user_id FROM profiles WHERE email = 'founder@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Gold VIP Founder';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 2750.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 2: poweruser → VIP Founder
    SELECT id INTO v_user_id FROM profiles WHERE email = 'poweruser@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'VIP Founder';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 1950.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 3: poweruser1 → Gold Premiere
    SELECT id INTO v_user_id FROM profiles WHERE email = 'poweruser1@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Gold Premiere';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 895.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 4: poweruser2 → Gold Premiere
    SELECT id INTO v_user_id FROM profiles WHERE email = 'poweruser2@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Gold Premiere';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 895.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 5: poweruser3 → Premiere
    SELECT id INTO v_user_id FROM profiles WHERE email = 'poweruser3@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Premiere';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 795.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 6: midtier → Ambassador
    SELECT id INTO v_user_id FROM profiles WHERE email = 'midtier@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Ambassador';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 495.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 7: midtier1 → Executive
    SELECT id INTO v_user_id FROM profiles WHERE email = 'midtier1@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Executive';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 395.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 8: midtier2 → Executive
    SELECT id INTO v_user_id FROM profiles WHERE email = 'midtier2@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Executive';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 395.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 9: midtier3 → City Patron
    SELECT id INTO v_user_id FROM profiles WHERE email = 'midtier3@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'City Patron';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 295.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 10: newbie → City Dweller
    SELECT id INTO v_user_id FROM profiles WHERE email = 'newbie@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'City Dweller';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 195.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 11: newbie1 → Novice
    SELECT id INTO v_user_id FROM profiles WHERE email = 'newbie1@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Novice';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 95.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 12: newbie2 → Novice
    SELECT id INTO v_user_id FROM profiles WHERE email = 'newbie2@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Novice';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 95.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 13: newbie3 → Free
    SELECT id INTO v_user_id FROM profiles WHERE email = 'newbie3@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Free';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 0.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 14: user → Executive
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Executive';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 395.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 15: user1 → City Patron
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user1@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'City Patron';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 295.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 16: user2 → City Dweller
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user2@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'City Dweller';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 195.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 17: user3 → Novice
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user3@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Novice';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 95.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 18: user4 → Free
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user4@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Free';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 0.00) ON CONFLICT (user_id) DO NOTHING;
    
    -- User 19: user5 → Free
    SELECT id INTO v_user_id FROM profiles WHERE email = 'user5@gunstro.com';
    SELECT id INTO v_visa_id FROM visas WHERE visa_type = 'Free';
    INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid) 
    VALUES (v_user_id, v_visa_id, 'active', 0.00) ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE '✅ All 19 users assigned their VISAs!';
END $$;

-- Verify the assignments
SELECT 
    p.username,
    v.visa_type,
    uv.purchase_price_paid
FROM profiles p
JOIN user_visas uv ON p.id = uv.user_id
JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
ORDER BY v.v_no;

-- Success message
SELECT '🎉 VISA ASSIGNMENT COMPLETE!' as status;
