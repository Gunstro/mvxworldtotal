-- ============================================================================
-- STEP 1: Check if place_user_in_matrix function exists
-- ============================================================================

SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'place_user_in_matrix';
