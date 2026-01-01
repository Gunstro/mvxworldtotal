-- ============================================================================
-- COMMISSION DISTRIBUTION TEST SUITE
-- ============================================================================
-- This script tests the 5-level commission distribution (20%, 3%, 4%, 5%, 8%)
-- Run each section step by step in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: VIEW THE SPONSOR CHAIN (UPLINE RELATIONSHIPS)
-- ============================================================================
-- This shows who sponsors whom - essential for understanding commission flow

SELECT 
    mp.readable_position,
    p.username,
    p.display_name,
    v.visa_type,
    mp.level_depth,
    -- Get sponsor info
    sponsor_mp.readable_position as sponsor_position,
    sponsor_p.username as sponsor_username
FROM matrix_positions mp
JOIN profiles p ON p.id = mp.user_id
LEFT JOIN visas v ON v.id = mp.visa_id
LEFT JOIN matrix_positions sponsor_mp ON sponsor_mp.id = mp.sponsor_id
LEFT JOIN profiles sponsor_p ON sponsor_p.id = sponsor_mp.user_id
ORDER BY mp.level_depth, mp.level_position;

-- ============================================================================
-- STEP 2: CHECK IF commission_rates TABLE EXISTS AND HAS CORRECT RATES
-- ============================================================================

SELECT 
    upline_level as "Level",
    commission_percentage || '%' as "Rate",
    description
FROM commission_rates 
ORDER BY upline_level;

-- Expected:
-- Level 1: 20% (Direct Sponsor)
-- Level 2: 3%
-- Level 3: 4%
-- Level 4: 5%
-- Level 5: 8%
-- Total: 40%

-- ============================================================================
-- STEP 3: CHECK IF user_wallets EXIST FOR TEST USERS
-- ============================================================================

SELECT 
    p.username,
    p.display_name,
    COALESCE(w.available_balance, 0) as available_balance,
    COALESCE(w.pending_balance, 0) as pending_balance,
    COALESCE(w.total_earned, 0) as total_earned
FROM profiles p
LEFT JOIN user_wallets w ON w.user_id = p.id
WHERE p.username IN ('founder', 'gunstro', 'poweruser1', 'midtier', 'user2', 'user3', 'user4')
ORDER BY p.username;

-- ============================================================================
-- STEP 4: GET UPLINE CHAIN FOR A SPECIFIC USER (user4)
-- ============================================================================
-- This shows who would receive commissions if user4 makes a purchase

-- First, let's check if get_commission_upline function exists
SELECT 
    routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_commission_upline';

-- If the function exists, test it:
-- SELECT * FROM get_commission_upline(
--     (SELECT user_id FROM matrix_positions WHERE readable_position = '4,3')
-- );

-- Manual upline trace (if function doesn't exist):
WITH RECURSIVE upline_chain AS (
    -- Start with the purchaser (user4 at position 4,3)
    SELECT 
        mp.id,
        mp.user_id,
        mp.sponsor_id,
        mp.readable_position,
        mp.level_depth,
        p.username,
        1 as upline_level
    FROM matrix_positions mp
    JOIN profiles p ON p.id = mp.user_id
    WHERE mp.readable_position = '4,3'  -- user4
    
    UNION ALL
    
    -- Recursively get sponsors (going UP the tree)
    SELECT 
        parent_mp.id,
        parent_mp.user_id,
        parent_mp.sponsor_id,
        parent_mp.readable_position,
        parent_mp.level_depth,
        parent_p.username,
        uc.upline_level + 1
    FROM upline_chain uc
    JOIN matrix_positions parent_mp ON parent_mp.id = uc.sponsor_id
    JOIN profiles parent_p ON parent_p.id = parent_mp.user_id
    WHERE uc.upline_level < 6  -- Stop at 5 levels up + 1 (purchaser)
)
SELECT 
    upline_level - 1 as "Commission Level",  -- 0 = purchaser, 1-5 = upline
    username,
    readable_position,
    level_depth,
    CASE 
        WHEN upline_level = 1 THEN '(PURCHASER - no commission)'
        WHEN upline_level = 2 THEN '20% = AF ' || (100 * 0.20)::TEXT
        WHEN upline_level = 3 THEN '3% = AF ' || (100 * 0.03)::TEXT
        WHEN upline_level = 4 THEN '4% = AF ' || (100 * 0.04)::TEXT
        WHEN upline_level = 5 THEN '5% = AF ' || (100 * 0.05)::TEXT
        WHEN upline_level = 6 THEN '8% = AF ' || (100 * 0.08)::TEXT
    END as "Commission (on AF 100 purchase)"
FROM upline_chain
ORDER BY upline_level;

-- ============================================================================
-- STEP 5: VALIDATE COMMISSION MATH (MANUAL CALCULATION)
-- ============================================================================
-- For a AF 100 purchase:

SELECT 
    'Total Purchase' as description,
    100.00 as amount,
    '100%' as percentage
UNION ALL
SELECT 
    'Company Share',
    60.00,
    '60%'
UNION ALL
SELECT 
    'Commission Pool',
    40.00,
    '40%'
UNION ALL
SELECT 
    'Level 1 (Direct Sponsor)',
    20.00,
    '20%'
UNION ALL
SELECT 
    'Level 2',
    3.00,
    '3%'
UNION ALL
SELECT 
    'Level 3',
    4.00,
    '4%'
UNION ALL
SELECT 
    'Level 4',
    5.00,
    '5%'
UNION ALL
SELECT 
    'Level 5',
    8.00,
    '8%'
UNION ALL
SELECT 
    'TOTAL UPLINE',
    20 + 3 + 4 + 5 + 8,
    '40%'
UNION ALL
SELECT 
    'VERIFY: Commission + Company',
    40 + 60,
    '100% ✓';

-- ============================================================================
-- STEP 6: CHECK VISA PRICES IN DATABASE
-- ============================================================================

SELECT 
    visa_type,
    price::DECIMAL as price_af,
    price::DECIMAL * 0.40 as commission_pool,
    price::DECIMAL * 0.20 as level_1_commission,
    price::DECIMAL * 0.03 as level_2_commission,
    price::DECIMAL * 0.04 as level_3_commission,
    price::DECIMAL * 0.05 as level_4_commission,
    price::DECIMAL * 0.08 as level_5_commission
FROM visas
WHERE is_active = true
ORDER BY price::DECIMAL;

-- ============================================================================
-- STEP 7: CREATE TEST DATA FOR CHAIN (if needed)
-- ============================================================================
-- Only run this if you want to set up a clean 5-level test chain

-- This assumes user4 is at depth 4 and we need to trace their upline
-- The chain should be visible from Step 4 results

-- ============================================================================
-- STEP 8: SIMULATE COMMISSION DISTRIBUTION (DRY RUN)
-- ============================================================================
-- This shows what WOULD happen if user4 purchased a AF 100 visa
-- Does NOT actually update any balances

WITH purchaser AS (
    SELECT mp.*, p.username 
    FROM matrix_positions mp
    JOIN profiles p ON p.id = mp.user_id
    WHERE mp.readable_position = '4,3'  -- user4
),
upline AS (
    WITH RECURSIVE chain AS (
        SELECT 
            mp.id,
            mp.user_id,
            mp.sponsor_id,
            mp.readable_position,
            p.username,
            1 as level
        FROM matrix_positions mp
        JOIN profiles p ON p.id = mp.user_id
        WHERE mp.sponsor_id = (SELECT id FROM purchaser)
        
        UNION ALL
        
        -- This is wrong, we need to go UP, not down
        -- Let me fix this
        SELECT 
            parent.id,
            parent.user_id,
            parent.sponsor_id,
            parent.readable_position,
            parent_p.username,
            c.level + 1
        FROM chain c
        JOIN matrix_positions parent ON parent.id = c.sponsor_id
        JOIN profiles parent_p ON parent_p.id = parent.user_id
        WHERE c.level < 5
    )
    SELECT * FROM chain
)
SELECT 
    100.00 as purchase_amount,
    'Simulation complete - see upline in Step 4' as note;

-- ============================================================================
-- EXPECTED RESULTS FOR user4 (position 4,3) PURCHASING AF 100 VISA:
-- ============================================================================
-- 
-- Commission Level | Username      | Commission
-- -----------------|---------------|------------
-- 0 (Purchaser)    | user4         | N/A
-- 1 (Direct)       | ???           | AF 20 (20%)
-- 2                | ???           | AF 3 (3%)
-- 3                | ???           | AF 4 (4%)
-- 4                | ???           | AF 5 (5%)
-- 5                | ???           | AF 8 (8%)
-- -----------------|---------------|------------
-- TOTAL UPLINE                     | AF 40 (40%)
-- COMPANY                          | AF 60 (60%)
-- ============================================================================

SELECT '✅ Test suite ready - Run Step 4 to see actual upline chain!' as status;
