-- ============================================================================
-- VIEW TRIGGER FUNCTION CODE
-- ============================================================================

-- Get the handle_new_user function code
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';
