-- ============================================================================
-- QUERY 4: PROFILE COLUMNS CHECK
-- ============================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('visa_tier', 'community_referrals', 'total_earnings', 'consecutive_login_days', 'bragging_title')
ORDER BY column_name;
