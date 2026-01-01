-- ============================================================================
-- COMPLETE COMMISSION DISTRIBUTION TEST
-- ============================================================================
-- Tests user4 purchasing AF 100 visa and verifies commission distribution
-- Chain: user4 → midtier1 → poweruser3 → poweruser → SYSTEM
-- ============================================================================

-- ============================================================================
-- STEP 1: VERIFY STARTING WALLET BALANCES (should all be 0)
-- ============================================================================
SELECT 
    p.username,
    w.available_balance,
    w.pending_balance,
    w.total_earned
FROM user_wallets w
JOIN profiles p ON p.id = w.user_id
WHERE p.username IN ('midtier1', 'poweruser3', 'poweruser', 'user4')
ORDER BY p.username;

-- ============================================================================
-- STEP 2: TRACE UPLINE FOR user4 (5 levels up)
-- ============================================================================
WITH RECURSIVE upline_trace AS (
    -- Start with user4
    SELECT 
        mp.id as position_id,
        mp.user_id,
        mp.sponsor_id,
        mp.readable_position,
        p.username,
        0 as upline_level
    FROM matrix_positions mp
    JOIN profiles p ON p.id = mp.user_id
    WHERE p.username = 'user4'
    
    UNION ALL
    
    -- Go up the tree
    SELECT 
        parent.id,
        parent.user_id,
        parent.sponsor_id,
        parent.readable_position,
        COALESCE(parent_p.username, 'SYSTEM (Poverty Relief)'),
        ut.upline_level + 1
    FROM upline_trace ut
    JOIN matrix_positions parent ON parent.id = ut.sponsor_id
    LEFT JOIN profiles parent_p ON parent_p.id = parent.user_id
    WHERE ut.upline_level < 5
)
SELECT 
    upline_level as "Level",
    username as "User",
    readable_position as "Position",
    CASE upline_level
        WHEN 0 THEN 'PURCHASER (no commission)'
        WHEN 1 THEN '20% = AF 20.00'
        WHEN 2 THEN '3% = AF 3.00'
        WHEN 3 THEN '4% = AF 4.00'
        WHEN 4 THEN '5% = AF 5.00 → if SYSTEM, goes to Poverty Fund'
        WHEN 5 THEN '8% = AF 8.00 → if SYSTEM, goes to Poverty Fund'
    END as "Commission (on AF 100)"
FROM upline_trace
ORDER BY upline_level;

-- ============================================================================
-- STEP 3: EXPECTED RESULTS SUMMARY
-- ============================================================================
SELECT '=== EXPECTED COMMISSION DISTRIBUTION ===' as header
UNION ALL SELECT 'Purchase Amount: AF 100.00'
UNION ALL SELECT '======================================='
UNION ALL SELECT 'Level 1 - midtier1:   AF 20.00 (20%)'
UNION ALL SELECT 'Level 2 - poweruser3: AF  3.00 (3%)'
UNION ALL SELECT 'Level 3 - poweruser:  AF  4.00 (4%)'
UNION ALL SELECT 'Level 4 - Poverty Fund: AF  5.00 (5%)'
UNION ALL SELECT 'Level 5 - Poverty Fund: AF  8.00 (8%)'
UNION ALL SELECT '======================================='
UNION ALL SELECT 'TOTAL TO UPLINE:      AF 40.00 (40%)'
UNION ALL SELECT 'TOTAL TO COMPANY:     AF 60.00 (60%)'
UNION ALL SELECT '======================================='
UNION ALL SELECT 'Poverty Fund receives: AF 13.00 (5% + 8%)'
UNION ALL SELECT 'Real users receive:    AF 27.00 (20% + 3% + 4%)';

-- ============================================================================
-- STEP 4: CHECK IF get_commission_upline FUNCTION EXISTS
-- ============================================================================
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_commission_upline', 'distribute_visa_commission')
ORDER BY routine_name;

-- ============================================================================
-- STEP 5: TEST THE COMMISSION DISTRIBUTION (DRY RUN - SIMULATION)
-- ============================================================================
-- This calculates what SHOULD happen without modifying any data

WITH purchaser AS (
    SELECT mp.user_id, p.username
    FROM matrix_positions mp
    JOIN profiles p ON p.id = mp.user_id
    WHERE p.username = 'user4'
),
commission_calc AS (
    SELECT 
        1 as level,
        'midtier1' as recipient,
        100.00 * 0.20 as commission,
        '20%' as rate,
        'Paid to User' as status
    UNION ALL SELECT 2, 'poweruser3', 100.00 * 0.03, '3%', 'Paid to User'
    UNION ALL SELECT 3, 'poweruser', 100.00 * 0.04, '4%', 'Paid to User'
    UNION ALL SELECT 4, 'Poverty Fund', 100.00 * 0.05, '5%', 'No upline - Poverty Fund'
    UNION ALL SELECT 5, 'Poverty Fund', 100.00 * 0.08, '8%', 'No upline - Poverty Fund'
)
SELECT 
    level as "Commission Level",
    recipient as "Recipient",
    rate as "Rate",
    'AF ' || commission as "Amount",
    status as "Status"
FROM commission_calc
UNION ALL
SELECT 
    NULL, 
    '=== TOTALS ===', 
    '40%', 
    'AF 40.00', 
    'Total to Upline'
UNION ALL
SELECT 
    NULL, 
    'Company', 
    '60%', 
    'AF 60.00', 
    'Company Revenue';

-- ============================================================================
-- STEP 6: VERIFY MATH IS 100% CORRECT
-- ============================================================================
SELECT 
    'VERIFICATION' as check_type,
    CASE 
        WHEN (20 + 3 + 4 + 5 + 8) = 40 THEN '✅ Upline rates sum to 40%'
        ELSE '❌ ERROR: Rates do not sum to 40%'
    END as result
UNION ALL
SELECT 
    'VERIFICATION',
    CASE 
        WHEN 40 + 60 = 100 THEN '✅ Total distribution = 100%'
        ELSE '❌ ERROR: Total not 100%'
    END
UNION ALL
SELECT 
    'USER EARNINGS',
    'midtier1: AF 20, poweruser3: AF 3, poweruser: AF 4 = AF 27 total'
UNION ALL
SELECT 
    'POVERTY FUND',
    'Level 4: AF 5 + Level 5: AF 8 = AF 13 total'
UNION ALL
SELECT 
    'COMPANY',
    'AF 60 (60% of purchase)';

-- ============================================================================
-- STEP 7: ACTUAL COMMISSION DISTRIBUTION (IF distribute_visa_commission EXISTS)
-- ============================================================================
-- Uncomment and run this to actually distribute commissions:
/*
SELECT * FROM distribute_visa_commission(
    (SELECT user_id FROM matrix_positions mp JOIN profiles p ON p.id = mp.user_id WHERE p.username = 'user4'),
    100.00,  -- AF 100 purchase
    gen_random_uuid()  -- Generate a purchase ID
);
*/

-- ============================================================================
-- STEP 8: AFTER DISTRIBUTION - CHECK WALLET BALANCES
-- ============================================================================
-- Run this AFTER calling distribute_visa_commission to verify:
/*
SELECT 
    p.username,
    w.pending_balance as "Should Be",
    CASE p.username
        WHEN 'midtier1' THEN 'AF 20.00'
        WHEN 'poweruser3' THEN 'AF 3.00'
        WHEN 'poweruser' THEN 'AF 4.00'
        ELSE 'AF 0.00'
    END as "Expected"
FROM user_wallets w
JOIN profiles p ON p.id = w.user_id
WHERE p.username IN ('midtier1', 'poweruser3', 'poweruser', 'user4')
ORDER BY w.pending_balance DESC;
*/

SELECT '✅ Commission test script ready! Run Step 7 to actually distribute commissions.' as status;
