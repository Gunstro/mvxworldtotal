-- ============================================================================
-- COMMISSION ENGINE TEST SCRIPT
-- ============================================================================
-- Tests the commission distribution system with the new readable positions
-- ============================================================================

-- Step 1: Check commission upline function
SELECT 
    '📊 Testing Commission Upline Function' as test_name,
    '' as details;

-- Get commission upline for a test user (e.g., user at position 3,5)
SELECT 
    mp.readable_position as "Test User Position",
    p.username as "Test User",
    upline.upline_level as "Upline Level",
    upline_mp.readable_position as "Upline Position",
    upline_p.username as "Upline Username"
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
CROSS JOIN LATERAL get_commission_upline(mp.user_id) as upline
JOIN matrix_positions upline_mp ON upline.position_id = upline_mp.id
LEFT JOIN profiles upline_p ON upline_mp.user_id = upline_p.id
WHERE mp.readable_position = '3,1'  -- Test with first Level 3 user
ORDER BY upline.upline_level;

-- Step 2: Check wallet structure
SELECT 
    '💰 Wallet Structure Check' as test_name,
    '' as details;

SELECT 
    p.username,
    mp.readable_position,
    uw.available_balance,
    uw.pending_balance,
    uw.total_earned
FROM profiles p
JOIN matrix_positions mp ON p.id = mp.user_id
LEFT JOIN user_wallets uw ON p.id = uw.user_id
WHERE mp.level_depth > 0
ORDER BY mp.level_depth, mp.level_position
LIMIT 10;

-- Step 3: Check if commission tables exist
SELECT 
    '📋 Commission Tables Check' as test_name,
    '' as details;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'visa_purchases' THEN '✅ Exists'
        WHEN table_name = 'commission_transactions' THEN '✅ Exists'
        WHEN table_name = 'user_wallets' THEN '✅ Exists'
        ELSE '❓ Unknown'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('visa_purchases', 'commission_transactions', 'user_wallets')
ORDER BY table_name;

-- Step 4: Test commission rates
SELECT 
    '💸 Commission Rates by Level' as test_name,
    '' as details;

-- Expected commission structure (based on your MLM design)
WITH commission_rates AS (
    SELECT 1 as level, 20.00 as rate UNION ALL
    SELECT 2, 10.00 UNION ALL
    SELECT 3, 5.00 UNION ALL
    SELECT 4, 3.00 UNION ALL
    SELECT 5, 2.00
)
SELECT 
    level as "Upline Level",
    rate as "Commission %"
FROM commission_rates
ORDER BY level;

-- Step 5: Summary
SELECT 
    '✅ Commission Engine Status' as status,
    'Ready for testing' as note1,
    'Need to create test VISA purchase to trigger commissions' as note2;
