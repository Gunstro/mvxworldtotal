-- ============================================================================
-- STEP 3: Check if founder has a matrix position
-- ============================================================================

SELECT 
    mp.*
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
WHERE p.email = 'founder@gunstro.com';
