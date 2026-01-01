-- ============================================================================
-- FIX GUNNAR'S VISA - Add to user_visas table
-- ============================================================================

-- First, check current state
SELECT 
    p.username,
    p.email,
    p.visa_id as profile_visa_id,
    v.visa_type as profile_visa_name,
    uv.id as has_user_visa_entry
FROM profiles p
LEFT JOIN visas v ON p.visa_id = v.id
LEFT JOIN user_visas uv ON p.id = uv.user_id
WHERE p.email = 'gunnar@gunstro.com';

-- Insert gunnar@gunstro into user_visas based on profiles.visa_id
INSERT INTO user_visas (user_id, visa_id, status, purchase_price_paid, purchased_at)
SELECT 
    p.id,
    p.visa_id,
    'active',
    CASE 
        WHEN v.visa_type = 'Gold VIP Founder' THEN 2750.00
        ELSE 0
    END,
    NOW()
FROM profiles p
JOIN visas v ON p.visa_id = v.id
WHERE p.email = 'gunnar@gunstro.com'
  AND p.visa_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM user_visas WHERE user_id = p.id
  );

-- Verify fix
SELECT 
    p.username,
    p.email,
    v.visa_type,
    uv.status,
    uv.purchase_price_paid
FROM profiles p
JOIN user_visas uv ON p.id = uv.user_id
JOIN visas v ON uv.visa_id = v.id
WHERE p.email = 'gunnar@gunstro.com';

SELECT '✅ Gunnar VISA added to user_visas!' as status;
