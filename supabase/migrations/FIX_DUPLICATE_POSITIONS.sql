-- ============================================================================
-- FIX DUPLICATE MATRIX POSITIONS
-- ============================================================================
-- Ensure no two users have the same readable_position
-- ============================================================================

-- STEP 1: Check for duplicates
SELECT 
    readable_position,
    COUNT(*) as count,
    STRING_AGG(p.username, ', ') as usernames
FROM matrix_positions mp
LEFT JOIN profiles p ON p.id = mp.user_id
GROUP BY readable_position
HAVING COUNT(*) > 1
ORDER BY readable_position;

-- STEP 2: View all users at position 1,1
SELECT 
    p.username,
    p.display_name,
    mp.readable_position,
    mp.created_at,
    mp.id as position_id
FROM matrix_positions mp
JOIN profiles p ON p.id = mp.user_id
WHERE mp.readable_position = '1,1'
ORDER BY mp.created_at;

-- ============================================================================
-- DECISION: Which user keeps 1,1?
-- ============================================================================
-- If Gunnar (founder) was created first, they should keep 1,1
-- Checkuser1 was our test user, so we need to either:
--   A) Delete checkuser1's position and move all their downline
--   B) Update checkuser1 to a different position (like 1,2 or 1,3)
-- ============================================================================

-- STEP 3: Check which positions are available at level 1
SELECT 
    DISTINCT readable_position
FROM matrix_positions
WHERE readable_position LIKE '1,%'
ORDER BY readable_position;

-- STEP 4: Update checkuser1 to next available position (e.g., 1,3)
-- First check if 1,3 exists
SELECT EXISTS (
    SELECT 1 FROM matrix_positions WHERE readable_position = '1,3'
) as position_exists;

-- ============================================================================
-- STEP 5: ADD UNIQUE CONSTRAINT (Run after fixing duplicates)
-- ============================================================================
-- This will prevent future duplicates

-- First, check if constraint already exists
SELECT COUNT(*) as constraint_exists
FROM pg_constraint 
WHERE conname = 'matrix_positions_readable_position_unique';

-- Add unique constraint (will fail if duplicates exist)
-- ALTER TABLE matrix_positions 
-- ADD CONSTRAINT matrix_positions_readable_position_unique UNIQUE (readable_position);
