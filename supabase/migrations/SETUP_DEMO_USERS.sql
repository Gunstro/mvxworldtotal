-- ============================================================================
-- SETUP DEMO USERS - Gunstro Test Accounts
-- ============================================================================
-- Run this AFTER you've registered all 19 accounts via the UI
-- This will set up their profiles, VISA tiers, badges, and demo data
-- ============================================================================

-- Step 1: Update FOUNDER account
UPDATE profiles 
SET 
    visa_tier = 'gold_vip_founder',
    community_referrals = 100,
    total_earnings = 25000.00,
    consecutive_login_days = 365,
    bragging_title = 'Founding Visionary',
    display_name = 'Gunnar (Founder)',
    bio = 'MegaVX Founder & Visionary. Building the future of community-powered networking!'
WHERE email = 'founder@gunstro.com';

-- Step 2: Update POWER USERS (VIP Founder / Gold Premiere)
UPDATE profiles 
SET 
    visa_tier = 'vip_founder',
    community_referrals = 75,
    total_earnings = 15000.00,
    consecutive_login_days = 180,
    bragging_title = 'Power Builder',
    display_name = 'Alex PowerUser',
    bio = 'VIP Founder | Building massive communities | Earning big!'
WHERE email = 'poweruser@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'gold_premiere',
    community_referrals = 50,
    total_earnings = 8500.00,
    consecutive_login_days = 90,
    display_name = 'Sarah Elite',
    bio = 'Gold Premiere member | Community champion'
WHERE email = 'poweruser1@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'gold_premiere',
    community_referrals = 45,
    total_earnings = 7200.00,
    consecutive_login_days = 75,
    display_name = 'Mike Champion',
    bio = 'Building communities one connection at a time'
WHERE email = 'poweruser2@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'premiere',
    community_referrals = 35,
    total_earnings = 5000.00,
    consecutive_login_days = 60,
    display_name = 'Lisa Premier',
    bio = 'Premiere tier | Growing fast!'
WHERE email = 'poweruser3@gunstro.com';

-- Step 3: Update MID-TIER USERS (Executive / Ambassador)
UPDATE profiles 
SET 
    visa_tier = 'ambassador',
    community_referrals = 30,
    total_earnings = 3500.00,
    consecutive_login_days = 45,
    bragging_title = 'Ambassador',
    display_name = 'Tom Ambassador',
    bio = 'Ambassador tier | Building my community fabric'
WHERE email = 'midtier@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'executive',
    community_referrals = 25,
    total_earnings = 2800.00,
    consecutive_login_days = 35,
    display_name = 'Emma Executive',
    bio = 'Executive member | Focused on growth'
WHERE email = 'midtier1@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'executive',
    community_referrals = 20,
    total_earnings = 2200.00,
    consecutive_login_days = 30,
    display_name = 'James Leader',
    bio = 'On the executive path to success'
WHERE email = 'midtier2@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'city_patron',
    community_referrals = 15,
    total_earnings = 1500.00,
    consecutive_login_days = 25,
    display_name = 'Sophie Patron',
    bio = 'City Patron | Loving the MegaVX community'
WHERE email = 'midtier3@gunstro.com';

-- Step 4: Update NEWBIES (Free / Novice / City Dweller)
UPDATE profiles 
SET 
    visa_tier = 'city_dweller',
    community_referrals = 10,
    total_earnings = 850.00,
    consecutive_login_days = 15,
    display_name = 'Chris Newbie',
    bio = 'New to MegaVX but excited to grow!'
WHERE email = 'newbie@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'novice',
    community_referrals = 5,
    total_earnings = 350.00,
    consecutive_login_days = 10,
    display_name = 'Amy Starter',
    bio = 'Just getting started on my journey'
WHERE email = 'newbie1@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'novice',
    community_referrals = 4,
    total_earnings = 280.00,
    consecutive_login_days = 8,
    display_name = 'David New',
    bio = 'Learning the ropes!'
WHERE email = 'newbie2@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'free',
    community_referrals = 1,
    total_earnings = 45.00,
    consecutive_login_days = 3,
    display_name = 'Rachel Beginner',
    bio = 'Just joined MegaVX!'
WHERE email = 'newbie3@gunstro.com';

-- Step 5: Update REGULAR USERS (Various tiers for matrix filling)
UPDATE profiles 
SET 
    visa_tier = 'city_dweller',
    community_referrals = 8,
    total_earnings = 650.00,
    consecutive_login_days = 12,
    display_name = 'Mark User',
    bio = 'Regular MegaVX member'
WHERE email = 'user@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'novice',
    community_referrals = 3,
    total_earnings = 220.00,
    consecutive_login_days = 7,
    display_name = 'Julia Member'
WHERE email = 'user1@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'novice',
    community_referrals = 2,
    total_earnings = 180.00,
    consecutive_login_days = 5,
    display_name = 'Robert User'
WHERE email = 'user2@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'free',
    community_referrals = 1,
    total_earnings = 65.00,
    consecutive_login_days = 4,
    display_name = 'Anna Member'
WHERE email = 'user3@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'free',
    community_referrals = 0,
    total_earnings = 0.00,
    consecutive_login_days = 2,
    display_name = 'Peter Newuser'
WHERE email = 'user4@gunstro.com';

UPDATE profiles 
SET 
    visa_tier = 'free',
    community_referrals = 0,
    total_earnings = 0.00,
    consecutive_login_days = 1,
    display_name = 'Linda User'
WHERE email = 'user5@gunstro.com';

-- Step 6: Grant badges based on achievements
-- (This would be automated by the check_and_award_badges function, 
-- but we'll manually insert some for demo purposes)

-- Award badges to founder (has 100 referrals)
INSERT INTO user_badges (user_id, badge_id, is_pinned)
SELECT 
    p.id as user_id,
    b.id as badge_id,
    true as is_pinned
FROM profiles p
CROSS JOIN badges b
WHERE p.email = 'founder@gunstro.com'
  AND b.badge_key IN ('first_recruit', 'team_of_10', 'team_of_25', 'first_1k')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Award badges to power users
INSERT INTO user_badges (user_id, badge_id)
SELECT 
    p.id as user_id,
    b.id as badge_id
FROM profiles p
CROSS JOIN badges b
WHERE p.email IN ('poweruser@gunstro.com', 'poweruser1@gunstro.com')
  AND b.badge_key IN ('first_recruit', 'team_of_10', 'team_of_25')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Award badges to mid-tier users
INSERT INTO user_badges (user_id, badge_id)
SELECT 
    p.id as user_id,
    b.id as badge_id
FROM profiles p
CROSS JOIN badges b
WHERE p.email IN ('midtier@gunstro.com', 'midtier1@gunstro.com')
  AND b.badge_key IN ('first_recruit', 'team_of_10')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Award basic badge to newbies
INSERT INTO user_badges (user_id, badge_id)
SELECT 
    p.id as user_id,
    b.id as badge_id
FROM profiles p
CROSS JOIN badges b
WHERE p.email IN ('newbie@gunstro.com', 'newbie1@gunstro.com')
  AND b.badge_key = 'first_recruit'
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all users were updated
SELECT 
    email,
    display_name,
    visa_tier,
    community_referrals,
    total_earnings,
    bragging_title
FROM profiles
WHERE email LIKE '%@gunstro.com'
ORDER BY 
    CASE visa_tier
        WHEN 'gold_vip_founder' THEN 1
        WHEN 'vip_founder' THEN 2
        WHEN 'gold_premiere' THEN 3
        WHEN 'premiere' THEN 4
        WHEN 'ambassador' THEN 5
        WHEN 'executive' THEN 6
        WHEN 'city_patron' THEN 7
        WHEN 'city_dweller' THEN 8
        WHEN 'novice' THEN 9
        ELSE 10
    END;

-- Check badge awards
SELECT 
    p.email,
    p.display_name,
    COUNT(ub.id) as badges_earned
FROM profiles p
LEFT JOIN user_badges ub ON p.id = ub.user_id
WHERE p.email LIKE '%@gunstro.com'
GROUP BY p.email, p.display_name
ORDER BY badges_earned DESC;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
SELECT 'Demo users setup complete! 🎉' as status;
