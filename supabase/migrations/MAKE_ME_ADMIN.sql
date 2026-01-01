-- ============================================================================
-- QUICK FIX: Make your user an admin
-- ============================================================================

-- Step 1: Check current admin status
SELECT 
    id,
    email,
    username,
    is_admin,
    is_super_admin
FROM profiles
WHERE email = 'gunnar@gunstro.com';

-- Step 2: Set yourself as super admin
UPDATE profiles
SET 
    is_admin = true,
    is_super_admin = true,
    updated_at = NOW()
WHERE email = 'gunnar@gunstro.com';

-- Step 3: Verify
SELECT 
    id,
    email,
    username,
    is_admin,
    is_super_admin
FROM profiles
WHERE email = 'gunnar@gunstro.com';

-- Success message
SELECT '✅ Admin access granted!' as status;
