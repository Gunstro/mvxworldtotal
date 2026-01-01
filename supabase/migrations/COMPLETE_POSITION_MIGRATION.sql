-- ============================================================================
-- ALL-IN-ONE: COMPLETE READABLE POSITION MIGRATION
-- ============================================================================
-- Run this single script to implement the entire position numbering system
-- ============================================================================

-- Step 1: Add columns
ALTER TABLE matrix_positions
ADD COLUMN IF NOT EXISTS readable_position VARCHAR(20),
ADD COLUMN IF NOT EXISTS level_depth INTEGER,
ADD COLUMN IF NOT EXISTS level_position BIGINT;

CREATE INDEX IF NOT EXISTS idx_matrix_readable_position 
    ON matrix_positions(level_depth, level_position);

-- Step 2: Create functions
CREATE OR REPLACE FUNCTION get_max_children_by_depth(p_depth INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE p_depth
        WHEN 0 THEN 20000
        WHEN 1 THEN 20
        WHEN 2 THEN 10
        ELSE 5
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_sponsor_position(
    p_child_level INTEGER,
    p_child_position BIGINT
)
RETURNS TABLE(sponsor_level INTEGER, sponsor_position BIGINT) AS $$
DECLARE
    v_parent_max_children INTEGER;
BEGIN
    IF p_child_level <= 0 THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::BIGINT;
        RETURN;
    END IF;
    
    IF p_child_level = 1 THEN
        RETURN QUERY SELECT 0::INTEGER, 1::BIGINT;
        RETURN;
    END IF;
    
    v_parent_max_children := get_max_children_by_depth(p_child_level - 1);
    
    RETURN QUERY SELECT 
        p_child_level - 1,
        CEILING(p_child_position::NUMERIC / v_parent_max_children)::BIGINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Backfill existing users
WITH numbered AS (
    SELECT 
        id,
        depth as level_depth,
        ROW_NUMBER() OVER (PARTITION BY depth ORDER BY global_position) as level_position
    FROM matrix_positions
    WHERE user_id IS NOT NULL
)
UPDATE matrix_positions mp
SET 
    level_depth = n.level_depth,
    level_position = n.level_position,
    readable_position = CONCAT(n.level_depth, ',', n.level_position),
    max_children = get_max_children_by_depth(n.level_depth),
    updated_at = NOW()
FROM numbered n
WHERE mp.id = n.id;

-- Update Poverty Relief
UPDATE matrix_positions
SET 
    level_depth = 0,
    level_position = 1,
    readable_position = '0,1',
    max_children = 20000,
    updated_at = NOW()
WHERE matrix_level = 0 AND depth = 0;

-- Final verification
SELECT 
    p.username,
    mp.readable_position,
    mp.children_count || '/' || mp.max_children as "Team Size",
    v.visa_type
FROM matrix_positions mp
LEFT JOIN profiles p ON mp.user_id = p.id
LEFT JOIN visas v ON mp.visa_id = v.id
ORDER BY mp.level_depth, mp.level_position
LIMIT 25;

SELECT '🎉 COMPLETE! All users now have readable positions' as status;
