-- ============================================================================
-- STEP 2: Check for matrix-related triggers
-- ============================================================================

SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%matrix%'
   OR trigger_name LIKE '%matrix%';
