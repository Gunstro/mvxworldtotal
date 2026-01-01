-- ============================================================================
-- CHECK VISA ASSIGNMENTS FOR ALL 19 USERS
-- ============================================================================

SELECT 
    p.username,
    p.email,
    v.visa_type,
    v.v_no,
    uv.status,
    uv.purchase_price_paid,
    uv.created_at
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
LEFT JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
ORDER BY p.username;

-- Count by VISA type
SELECT 
    COALESCE(v.visa_type, 'NO VISA') as visa_type,
    COUNT(*) as user_count,
    COALESCE(MIN(v.v_no), 999) as visa_order
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
LEFT JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
GROUP BY v.visa_type
ORDER BY visa_order;
