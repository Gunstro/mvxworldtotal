-- ============================================================================
-- CHECK user_visas TABLE STRUCTURE
-- ============================================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_visas'
ORDER BY ordinal_position;
