-- ============================================================================
-- QUERY 3: BADGE RECORDS
-- ============================================================================
SELECT 
    badge_key,
    name,
    category,
    rarity,
    is_active
FROM badges
ORDER BY category, name;
