-- ============================================================================
-- CHECK MATRIX PLACEMENT SYSTEM
-- ============================================================================

-- Check if place_user_in_matrix function exists
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'place_user_in_matrix';

-- Check if there's a trigger for matrix placement
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%matrix%'
   OR trigger_name LIKE '%matrix%';

-- Check matrix_positions table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'matrix_positions'
ORDER BY ordinal_position;

-- Check if founder has a matrix position (using actual column names)
SELECT 
    mp.*
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
WHERE p.email = 'founder@gunstro.com';
