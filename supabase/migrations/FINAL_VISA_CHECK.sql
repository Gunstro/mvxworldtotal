-- ============================================================================
-- FINAL VERIFICATION: Check VISA assignments are correct
-- ============================================================================

-- Show what the dashboard SHOULD be reading
SELECT 
    p.username,
    p.email,
    v.visa_type,
    v.badge_color,
    uv.status,
    uv.created_at
FROM profiles p
JOIN user_visas uv ON p.id = uv.user_id
JOIN visas v ON uv.visa_id = v.id
WHERE p.email LIKE '%gunstro.com'
ORDER BY v.v_no, p.username;

-- Check if any users are missing VISAs
SELECT 
    p.username,
    p.email,
    'NO VISA ASSIGNED' as issue
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
WHERE p.email LIKE '%gunstro.com'
  AND uv.id IS NULL;
