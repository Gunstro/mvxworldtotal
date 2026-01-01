-- ============================================================================
-- CHECK PROFILES TABLE FOR NOT NULL COLUMNS
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND is_nullable = 'NO'
  AND column_default IS NULL
ORDER BY ordinal_position;
