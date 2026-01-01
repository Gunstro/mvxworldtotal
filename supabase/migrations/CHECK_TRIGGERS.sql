-- ============================================================================
-- CHECK TRIGGERS ON AUTH.USERS
-- ============================================================================

-- Find triggers on auth schema
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Also check for functions that might be called by triggers
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%'
  OR routine_name LIKE '%profile%'
ORDER BY routine_name;
