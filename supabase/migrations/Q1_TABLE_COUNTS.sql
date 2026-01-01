-- ============================================================================
-- QUERY 1: TABLE RECORD COUNTS
-- ============================================================================
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
SELECT 'MATRIX_POSITIONS', COUNT(*) FROM matrix_positions
UNION ALL
SELECT 'AUTH_USERS', COUNT(*) FROM auth.users;
