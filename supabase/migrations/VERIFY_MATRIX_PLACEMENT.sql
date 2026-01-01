-- ============================================================================
-- VERIFY MATRIX PLACEMENT WORKED
-- ============================================================================

-- Count users at each depth level
SELECT 
    depth,
    COUNT(*) as user_count
FROM matrix_positions
GROUP BY depth
ORDER BY depth;

-- Show sample of matrix positions
SELECT 
    p.username,
    mp.depth,
    mp.position_number,
    mp.children_count,
    sponsor.username as sponsor_username
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN matrix_positions sponsor_pos ON mp.sponsor_id = sponsor_pos.id
LEFT JOIN profiles sponsor ON sponsor_pos.user_id = sponsor.id
ORDER BY mp.global_position
LIMIT 20;

-- Check matrix_level column (separate from depth)
SELECT 
    matrix_level,
    COUNT(*) as count
FROM matrix_positions
GROUP BY matrix_level;
