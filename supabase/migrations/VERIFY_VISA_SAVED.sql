-- ============================================================================
-- VERIFY VISA ASSIGNMENTS IN DATABASE
-- ============================================================================

SELECT 
    p.username,
    p.email,
    v.visa_type as assigned_visa,
    uv.status,
    uv.created_at
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
LEFT JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
ORDER BY p.username;

-- Count how many users have each VISA
SELECT 
    COALESCE(v.visa_type, 'NO VISA') as visa_type,
    COUNT(*) as count
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
LEFT JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
GROUP BY v.visa_type
ORDER BY count DESC;
