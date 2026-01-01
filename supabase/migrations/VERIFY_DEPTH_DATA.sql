-- ============================================================================
-- VERIFY MATRIX DEPTH DATA
-- ============================================================================

SELECT 
    p.username,
    p.email,
    mp.depth,
    mp.children_count,
    CASE mp.depth
        WHEN 1 THEN 'Level 1: Founder'
        WHEN 2 THEN 'Level 2: Premiere'
        ELSE 'Level 3+: Standard'
    END as should_show_as
FROM profiles p
LEFT JOIN matrix_positions mp ON p.id = mp.user_id
WHERE p.email LIKE '%gunstro.com'
ORDER BY mp.depth NULLS LAST, p.username;

-- Count by depth
SELECT 
    COALESCE(mp.depth, 0) as depth,
    COUNT(*) as user_count
FROM profiles p
LEFT JOIN matrix_positions mp ON p.id = mp.user_id
WHERE p.email LIKE '%gunstro.com'
GROUP BY mp.depth
ORDER BY depth;
