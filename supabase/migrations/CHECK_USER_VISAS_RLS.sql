-- ============================================================================
-- CHECK RLS POLICIES ON user_visas TABLE
-- ============================================================================

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'user_visas';

-- Check what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_visas'
ORDER BY policyname;
