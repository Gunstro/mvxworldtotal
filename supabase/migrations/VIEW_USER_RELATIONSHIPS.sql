-- ============================================================================
-- VIEW USER RELATIONSHIPS IN MATRIX
-- ============================================================================
-- Shows sponsor and referrer relationships for all users
-- ============================================================================

-- Complete relationship view
SELECT 
    p.username as "User",
    mp.readable_position as "Position",
    
    -- Sponsor (matrix parent)
    sponsor_p.username as "Sponsor (Parent)",
    sponsor_mp.readable_position as "Sponsor Position",
    
    -- Referrer (who invited)
    referrer_p.username as "Referrer (Recruited By)",
    referrer_mp.readable_position as "Referrer Position",
    
    -- Flags
    CASE 
        WHEN mp.is_orphan THEN '🔴 Orphan (no referrer)'
        WHEN mp.is_spillover THEN '🟡 Spillover'
        WHEN mp.referrer_user_id = sponsor_mp.user_id THEN '🟢 Direct placement'
        ELSE '🟠 Indirect placement'
    END as "Placement Type"
    
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id

-- Join sponsor
LEFT JOIN matrix_positions sponsor_mp ON mp.sponsor_id = sponsor_mp.id
LEFT JOIN profiles sponsor_p ON sponsor_mp.user_id = sponsor_p.id

-- Join referrer
LEFT JOIN profiles referrer_p ON mp.referrer_user_id = referrer_p.id
LEFT JOIN matrix_positions referrer_mp ON referrer_mp.user_id = referrer_p.id

WHERE mp.level_depth > 0  -- Exclude Poverty Relief
ORDER BY mp.level_depth, mp.level_position
LIMIT 20;

-- Summary stats
SELECT 
    '📊 Relationship Summary' as section,
    '' as details;

SELECT 
    COUNT(*) as "Total Users",
    SUM(CASE WHEN is_orphan THEN 1 ELSE 0 END) as "Orphans",
    SUM(CASE WHEN is_spillover THEN 1 ELSE 0 END) as "Spillovers",
    SUM(CASE WHEN referrer_user_id IS NOT NULL AND NOT is_spillover THEN 1 ELSE 0 END) as "Direct Placements"
FROM matrix_positions
WHERE user_id IS NOT NULL;
