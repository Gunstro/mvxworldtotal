-- ============================================================================
-- VIEW assign_free_visa_to_user FUNCTION
-- ============================================================================

SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'assign_free_visa_to_user';
