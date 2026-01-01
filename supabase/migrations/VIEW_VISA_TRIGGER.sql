-- ============================================================================
-- VIEW VISA TRIGGER FUNCTION CODE
-- ============================================================================

-- Get the trigger_assign_visa_on_profile_create function code
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'trigger_assign_visa_on_profile_create';
