-- ============================================================================
-- CHECK IF GUNNAR IS SET AS ADMIN
-- ============================================================================

SELECT 
    username,
    email,
    is_admin,
    is_verified
FROM profiles
WHERE email = 'gunnar@gunstro.com'
   OR email = 'founder@gunstro.com';

-- Make Gunnar an admin if not already
UPDATE profiles
SET is_admin = true
WHERE email = 'gunnar@gunstro.com';

-- Verify
SELECT 
    username,
    email,
    is_admin
FROM profiles
WHERE email = 'gunnar@gunstro.com';

-- Success
SELECT '✅ Gunnar is now an admin!' as status;
