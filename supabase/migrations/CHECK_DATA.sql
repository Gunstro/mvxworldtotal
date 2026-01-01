-- ============================================================================
-- CHECK TABLE DATA - Do tables have records?
-- ============================================================================

-- Check VISAS count
SELECT 'VISAS' as table_name, COUNT(*) as record_count FROM visas
UNION ALL
SELECT 'BADGES', COUNT(*) FROM badges
UNION ALL
SELECT 'PROFILES', COUNT(*) FROM profiles
UNION ALL
SELECT 'USER_BADGES', COUNT(*) FROM user_badges
UNION ALL
SELECT 'USER_ACHIEVEMENTS', COUNT(*) FROM user_achievements
UNION ALL
SELECT 'MATRIX_POSITIONS', COUNT(*) FROM matrix_positions;

-- Show actual VISA records
SELECT 
    v_no,
    visa_type,
    price,
    monthly_fee,
    income_cap,
    is_active,
    available
FROM visas
ORDER BY v_no;

-- Show badges
SELECT 
    badge_key,
    name,
    category,
    rarity,
    is_active
FROM badges
ORDER BY category, name;

-- Check if profiles table has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('visa_tier', 'community_referrals', 'total_earnings', 'consecutive_login_days', 'bragging_title')
ORDER BY column_name;

-- Check auth.users count
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check profiles without auth user
SELECT COUNT(*) as orphaned_profiles
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
);
