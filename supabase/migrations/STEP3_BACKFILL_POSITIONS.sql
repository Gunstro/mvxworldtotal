-- ============================================================================
-- STEP 3: BACKFILL EXISTING USERS WITH READABLE POSITIONS
-- ============================================================================
-- Assigns Level,Position format to all 20 existing users
-- ============================================================================

-- Calculate and assign readable positions
WITH numbered AS (
    SELECT 
        id,
        depth as level_depth,
        ROW_NUMBER() OVER (PARTITION BY depth ORDER BY global_position) as level_position
    FROM matrix_positions
    WHERE user_id IS NOT NULL  -- Exclude Poverty Relief if it has user_id = NULL
)
UPDATE matrix_positions mp
SET 
    level_depth = n.level_depth,
    level_position = n.level_position,
    readable_position = CONCAT(n.level_depth, ',', n.level_position),
    updated_at = NOW()
FROM numbered n
WHERE mp.id = n.id;

-- Also set Poverty Relief (Level 0)
UPDATE matrix_positions
SET 
    level_depth = 0,
    level_position = 1,
    readable_position = '0,1',
    updated_at = NOW()
WHERE matrix_level = 0 AND depth = 0;

-- Update max_children to use depth-based rules
UPDATE matrix_positions
SET max_children = get_max_children_by_depth(depth);

-- Verification
SELECT 
    p.username,
    mp.readable_position,
    mp.level_depth,
    mp.level_position,
    mp.depth,
    mp.children_count,
    mp.max_children
FROM matrix_positions mp
LEFT JOIN profiles p ON mp.user_id = p.id
ORDER BY mp.global_position
LIMIT 25;

-- Success message
SELECT '✅ Step 3 Complete: All users assigned readable positions' as status;
