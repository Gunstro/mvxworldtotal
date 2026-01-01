-- ============================================================================
-- BULK CREATE DEMO USERS - All 19 Gunstro Test Accounts
-- ============================================================================
-- This creates all users directly in Supabase without manual registration
-- Password for ALL accounts: Demo123!
-- ============================================================================

-- Insert users into auth.users and profiles tables
DO $$ 
DECLARE
    founder_id UUID;
    user_id UUID;
    hashed_password TEXT := '$2a$10$5VvHzKq8z8QaXHhHqKqF3O8r8YvJzQZ9VjKjKqKqKqKqKqKqKqKqK'; -- Demo123!
BEGIN
    -- FOUNDER
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'founder@gunstro.com',
        crypt('Demo123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"founder"}',
        false,
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO founder_id;

    -- Create founder profile
    IF founder_id IS NOT NULL THEN
        INSERT INTO profiles (id, username, email, display_name, bio, visa_tier, community_referrals, total_earnings, consecutive_login_days, bragging_title)
        VALUES (
            founder_id,
            'founder',
            'founder@gunstro.com',
            'Gunnar (Founder)',
            'MegaVX Founder & Visionary. Building the future of community-powered networking!',
            'gold_vip_founder',
            100,
            25000.00,
            365,
            'Founding Visionary'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- POWER USERS
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
    VALUES 
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'poweruser@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"poweruser"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'poweruser1@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"poweruser1"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'poweruser2@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"poweruser2"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'poweruser3@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"poweruser3"}', false)
    ON CONFLICT (email) DO NOTHING;

    -- MID TIER
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
    VALUES 
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'midtier@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"midtier"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'midtier1@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"midtier1"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'midtier2@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"midtier2"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'midtier3@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"midtier3"}', false)
    ON CONFLICT (email) DO NOTHING;

    -- NEWBIES
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
    VALUES 
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'newbie@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"newbie"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'newbie1@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"newbie1"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'newbie2@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"newbie2"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'newbie3@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"newbie3"}', false)
    ON CONFLICT (email) DO NOTHING;

    -- REGULAR USERS
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
    VALUES 
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user1@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user1"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user2@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user2"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user3@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user3"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user4@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user4"}', false),
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user5@gunstro.com', crypt('Demo123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"user5"}', false)
    ON CONFLICT (email) DO NOTHING;

END $$;

-- Create profiles for all users
INSERT INTO profiles (id, username, email, display_name, bio, visa_tier, community_referrals, total_earnings, consecutive_login_days, bragging_title)
SELECT 
    u.id,
    (u.raw_user_meta_data->>'username'),
    u.email,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 'Alex PowerUser'
        WHEN 'poweruser1@gunstro.com' THEN 'Sarah Elite'
        WHEN 'poweruser2@gunstro.com' THEN 'Mike Champion'
        WHEN 'poweruser3@gunstro.com' THEN 'Lisa Premier'
        WHEN 'midtier@gunstro.com' THEN 'Tom Ambassador'
        WHEN 'midtier1@gunstro.com' THEN 'Emma Executive'
        WHEN 'midtier2@gunstro.com' THEN 'James Leader'
        WHEN 'midtier3@gunstro.com' THEN 'Sophie Patron'
        WHEN 'newbie@gunstro.com' THEN 'Chris Newbie'
        WHEN 'newbie1@gunstro.com' THEN 'Amy Starter'
        WHEN 'newbie2@gunstro.com' THEN 'David New'
        WHEN 'newbie3@gunstro.com' THEN 'Rachel Beginner'
        WHEN 'user@gunstro.com' THEN 'Mark User'
        WHEN 'user1@gunstro.com' THEN 'Julia Member'
        WHEN 'user2@gunstro.com' THEN 'Robert User'
        WHEN 'user3@gunstro.com' THEN 'Anna Member'
        WHEN 'user4@gunstro.com' THEN 'Peter Newuser'
        WHEN 'user5@gunstro.com' THEN 'Linda User'
        ELSE (u.raw_user_meta_data->>'username')
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 'VIP Founder | Building massive communities | Earning big!'
        WHEN 'poweruser1@gunstro.com' THEN 'Gold Premiere member | Community champion'
        WHEN 'poweruser2@gunstro.com' THEN 'Building communities one connection at a time'
        WHEN 'poweruser3@gunstro.com' THEN 'Premiere tier | Growing fast!'
        WHEN 'midtier@gunstro.com' THEN 'Ambassador tier | Building my community fabric'
        WHEN 'midtier1@gunstro.com' THEN 'Executive member | Focused on growth'
        WHEN 'midtier2@gunstro.com' THEN 'On the executive path to success'
        WHEN 'midtier3@gunstro.com' THEN 'City Patron | Loving the MegaVX community'
        WHEN 'newbie@gunstro.com' THEN 'New to MegaVX but excited to grow!'
        WHEN 'newbie1@gunstro.com' THEN 'Just getting started on my journey'
        WHEN 'newbie2@gunstro.com' THEN 'Learning the ropes!'
        WHEN 'newbie3@gunstro.com' THEN 'Just joined MegaVX!'
        WHEN 'user@gunstro.com' THEN 'Regular MegaVX member'
        ELSE NULL
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 'vip_founder'
        WHEN 'poweruser1@gunstro.com' THEN 'gold_premiere'
        WHEN 'poweruser2@gunstro.com' THEN 'gold_premiere'
        WHEN 'poweruser3@gunstro.com' THEN 'premiere'
        WHEN 'midtier@gunstro.com' THEN 'ambassador'
        WHEN 'midtier1@gunstro.com' THEN 'executive'
        WHEN 'midtier2@gunstro.com' THEN 'executive'
        WHEN 'midtier3@gunstro.com' THEN 'city_patron'
        WHEN 'newbie@gunstro.com' THEN 'city_dweller'
        WHEN 'newbie1@gunstro.com' THEN 'novice'
        WHEN 'newbie2@gunstro.com' THEN 'novice'
        WHEN 'newbie3@gunstro.com' THEN 'free'
        WHEN 'user@gunstro.com' THEN 'city_dweller'
        WHEN 'user1@gunstro.com' THEN 'novice'
        WHEN 'user2@gunstro.com' THEN 'novice'
        WHEN 'user3@gunstro.com' THEN 'free'
        WHEN 'user4@gunstro.com' THEN 'free'
        WHEN 'user5@gunstro.com' THEN 'free'
        ELSE 'free'
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 75
        WHEN 'poweruser1@gunstro.com' THEN 50
        WHEN 'poweruser2@gunstro.com' THEN 45
        WHEN 'poweruser3@gunstro.com' THEN 35
        WHEN 'midtier@gunstro.com' THEN 30
        WHEN 'midtier1@gunstro.com' THEN 25
        WHEN 'midtier2@gunstro.com' THEN 20
        WHEN 'midtier3@gunstro.com' THEN 15
        WHEN 'newbie@gunstro.com' THEN 10
        WHEN 'newbie1@gunstro.com' THEN 5
        WHEN 'newbie2@gunstro.com' THEN 4
        WHEN 'newbie3@gunstro.com' THEN 1
        WHEN 'user@gunstro.com' THEN 8
        WHEN 'user1@gunstro.com' THEN 3
        WHEN 'user2@gunstro.com' THEN 2
        WHEN 'user3@gunstro.com' THEN 1
        ELSE 0
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 15000.00
        WHEN 'poweruser1@gunstro.com' THEN 8500.00
        WHEN 'poweruser2@gunstro.com' THEN 7200.00
        WHEN 'poweruser3@gunstro.com' THEN 5000.00
        WHEN 'midtier@gunstro.com' THEN 3500.00
        WHEN 'midtier1@gunstro.com' THEN 2800.00
        WHEN 'midtier2@gunstro.com' THEN 2200.00
        WHEN 'midtier3@gunstro.com' THEN 1500.00
        WHEN 'newbie@gunstro.com' THEN 850.00
        WHEN 'newbie1@gunstro.com' THEN 350.00
        WHEN 'newbie2@gunstro.com' THEN 280.00
        WHEN 'newbie3@gunstro.com' THEN 45.00
        WHEN 'user@gunstro.com' THEN 650.00
        WHEN 'user1@gunstro.com' THEN 220.00
        WHEN 'user2@gunstro.com' THEN 180.00
        WHEN 'user3@gunstro.com' THEN 65.00
        ELSE 0.00
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 180
        WHEN 'poweruser1@gunstro.com' THEN 90
        WHEN 'poweruser2@gunstro.com' THEN 75
        WHEN 'poweruser3@gunstro.com' THEN 60
        WHEN 'midtier@gunstro.com' THEN 45
        WHEN 'midtier1@gunstro.com' THEN 35
        WHEN 'midtier2@gunstro.com' THEN 30
        WHEN 'midtier3@gunstro.com' THEN 25
        WHEN 'newbie@gunstro.com' THEN 15
        WHEN 'newbie1@gunstro.com' THEN 10
        WHEN 'newbie2@gunstro.com' THEN 8
        WHEN 'newbie3@gunstro.com' THEN 3
        WHEN 'user@gunstro.com' THEN 12
        WHEN 'user1@gunstro.com' THEN 7
        WHEN 'user2@gunstro.com' THEN 5
        WHEN 'user3@gunstro.com' THEN 4
        WHEN 'user4@gunstro.com' THEN 2
        WHEN 'user5@gunstro.com' THEN 1
        ELSE 0
    END,
    CASE u.email
        WHEN 'poweruser@gunstro.com' THEN 'Power Builder'
        WHEN 'midtier@gunstro.com' THEN 'Ambassador'
        ELSE NULL
    END
FROM auth.users u
WHERE u.email LIKE '%@gunstro.com'
  AND u.email NOT IN ('founder@gunstro.com') -- Founder already created
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    visa_tier = EXCLUDED.visa_tier,
    community_referrals = EXCLUDED.community_referrals,
    total_earnings = EXCLUDED.total_earnings,
    consecutive_login_days = EXCLUDED.consecutive_login_days,
    bragging_title = EXCLUDED.bragging_title;

-- Award badges
INSERT INTO user_badges (user_id, badge_id, is_pinned)
SELECT 
    p.id as user_id,
    b.id as badge_id,
    CASE WHEN p.email = 'founder@gunstro.com' THEN true ELSE false END
FROM profiles p
CROSS JOIN badges b
WHERE p.email LIKE '%@gunstro.com'
  AND (
    (p.community_referrals >= 100 AND b.badge_key IN ('first_recruit', 'team_of_5', 'team_of_10', 'team_of_25'))
    OR (p.community_referrals >= 50 AND p.community_referrals < 100 AND b.badge_key IN ('first_recruit', 'team_of_5', 'team_of_10', 'team_of_25'))
    OR (p.community_referrals >= 25 AND p.community_referrals < 50 AND b.badge_key IN ('first_recruit', 'team_of_5', 'team_of_10', 'team_of_25'))
    OR (p.community_referrals >= 10 AND p.community_referrals < 25 AND b.badge_key IN ('first_recruit', 'team_of_5', 'team_of_10'))
    OR (p.community_referrals >= 5 AND p.community_referrals < 10 AND b.badge_key IN ('first_recruit', 'team_of_5'))
    OR (p.community_referrals >= 1 AND p.community_referrals < 5 AND b.badge_key = 'first_recruit')
    OR (p.total_earnings >= 1000 AND b.badge_key = 'first_1k')
    OR (p.consecutive_login_days >= 7 AND b.badge_key = 'week_streak')
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Verification
SELECT 
    email,
    display_name,
    visa_tier,
    community_referrals as referrals,
    total_earnings as earnings,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = p.id) as badges
FROM profiles p
WHERE email LIKE '%@gunstro.com'
ORDER BY total_earnings DESC;

-- Success!
SELECT '🎉 ALL 19 DEMO USERS CREATED! Password for all: Demo123!' as status;
