-- ============================================================================
-- GENEALOGY TREE DATA - COMPLETE MATRIX STRUCTURE
-- ============================================================================
-- Provides hierarchical data for admin genealogy tree visualization
-- ============================================================================

-- Full genealogy with all relationship data
WITH RECURSIVE tree AS (
    -- Start with root (Poverty Relief)
    SELECT 
        mp.id,
        mp.user_id,
        p.username,
        p.display_name,
        mp.readable_position,
        mp.level_depth,
        mp.level_position,
        mp.children_count,
        mp.max_children,
        v.visa_type,
        v.badge_color,
        mp.sponsor_id,
        0 as tree_depth,
        ARRAY[mp.level_position] as path,
        '0,1' as parent_position
    FROM matrix_positions mp
    LEFT JOIN profiles p ON mp.user_id = p.id
    LEFT JOIN visas v ON mp.visa_id = v.id
    WHERE mp.level_depth = 0
    
    UNION ALL
    
    -- Recursively get all children
    SELECT 
        mp.id,
        mp.user_id,
        p.username,
        p.display_name,
        mp.readable_position,
        mp.level_depth,
        mp.level_position,
        mp.children_count,
        mp.max_children,
        v.visa_type,
        v.badge_color,
        mp.sponsor_id,
        tree.tree_depth + 1,
        tree.path || mp.level_position,
        tree.readable_position
    FROM matrix_positions mp
    JOIN tree ON mp.sponsor_id = tree.id
    LEFT JOIN profiles p ON mp.user_id = p.id
    LEFT JOIN visas v ON mp.visa_id = v.id
)
SELECT 
    readable_position as "Position",
    COALESCE(display_name, username, 'Poverty Relief') as "Name",
    username as "Username",
    visa_type as "VISA",
    badge_color as "Badge Color",
    level_depth as "Level",
    children_count || '/' || max_children as "Team",
    parent_position as "Parent",
    tree_depth as "Tree Depth",
    path as "Path"
FROM tree
ORDER BY level_depth, level_position;

-- Summary by level
SELECT 
    '📊 Matrix Summary by Level' as section,
    '' as details;

SELECT 
    level_depth as "Level",
    COUNT(*) as "Users",
    SUM(children_count) as "Total Children",
    AVG(children_count)::DECIMAL(5,2) as "Avg Team Size"
FROM matrix_positions
WHERE user_id IS NOT NULL
GROUP BY level_depth
ORDER BY level_depth;
