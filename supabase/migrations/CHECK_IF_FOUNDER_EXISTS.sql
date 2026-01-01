-- ============================================================================
-- CHECK IF FOUNDER USER EXISTS
-- ============================================================================

-- Check in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'founder@gunstro.com';

-- Check in profiles
SELECT id, username, email, display_name, created_at
FROM profiles
WHERE email = 'founder@gunstro.com' OR username = 'founder';

-- If user exists, DELETE them (so we can register fresh)
-- UNCOMMENT THESE LINES IF USER EXISTS:
-- DELETE FROM profiles WHERE email = 'founder@gunstro.com' OR username = 'founder';
-- DELETE FROM auth.users WHERE email = 'founder@gunstro.com';
