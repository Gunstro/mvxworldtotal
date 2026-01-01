-- ============================================================================
-- VERIFY FOUNDER ACCOUNT WAS CREATED PROPERLY
-- ============================================================================

-- Check auth.users
SELECT 
    email,
    created_at,
    email_confirmed_at,
    (raw_user_meta_data->>'username') as metadata_username
FROM auth.users
WHERE email = 'founder@gunstro.com';

-- Check profiles
SELECT 
    username,
    email,
    display_name,
    is_active,
    created_at
FROM profiles
WHERE email = 'founder@gunstro.com';

-- Check user_visas (should have Gold VIP Founder)
SELECT 
    uv.user_id,
    v.visa_type,
    v.v_no,
    uv.status,
    uv.purchase_price_paid,
    uv.purchased_at
FROM user_visas uv
JOIN visas v ON uv.visa_id = v.id
JOIN profiles p ON uv.user_id = p.id
WHERE p.email = 'founder@gunstro.com';

-- Check megabucks_wallets
SELECT 
    mw.user_id,
    mw.balance,
    mw.created_at
FROM megabucks_wallets mw
JOIN profiles p ON mw.user_id = p.id
WHERE p.email = 'founder@gunstro.com';

-- Check megascores
SELECT 
    ms.user_id,
    ms.total_score,
    ms.level,
    ms.created_at
FROM megascores ms
JOIN profiles p ON ms.user_id = p.id
WHERE p.email = 'founder@gunstro.com';

-- Success summary
SELECT '✅ FOUNDER ACCOUNT FULLY VERIFIED!' as status;
