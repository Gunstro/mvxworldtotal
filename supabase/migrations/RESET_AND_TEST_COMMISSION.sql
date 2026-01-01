-- ============================================================================
-- RESET AND TEST COMMISSION DISTRIBUTION
-- ============================================================================
-- Run this AFTER running FIX_COMMISSION_V3_COMPLETE.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: RESET ALL WALLET BALANCES TO ZERO
-- ============================================================================
UPDATE user_wallets
SET 
    available_balance = 0,
    pending_balance = 0,
    total_earned = 0,
    updated_at = NOW();

-- Reset poverty fund
UPDATE poverty_fund
SET 
    total_balance = 0,
    total_received = 0,
    updated_at = NOW();

-- Clear previous commission transactions
DELETE FROM commission_transactions;

SELECT 'Wallets and Poverty Fund reset to zero' as status;

-- ============================================================================
-- STEP 2: VERIFY STARTING BALANCES ARE ZERO
-- ============================================================================
SELECT 
    'User Wallets' as source,
    SUM(pending_balance) as pending,
    SUM(total_earned) as earned
FROM user_wallets

UNION ALL

SELECT 
    'Poverty Fund',
    total_balance,
    total_received
FROM poverty_fund;

-- ============================================================================
-- STEP 3: RUN COMMISSION DISTRIBUTION TEST
-- ============================================================================
-- user4 has 3 real upline users, then Poverty Relief for levels 4-5
-- Expected: midtier1=AF20, poweruser3=AF3, poweruser=AF4, Poverty=AF13

SELECT * FROM distribute_visa_commission(
    (SELECT user_id FROM matrix_positions mp 
     JOIN profiles p ON p.id = mp.user_id 
     WHERE p.username = 'user4'),
    100.00,
    gen_random_uuid()
);

-- ============================================================================
-- STEP 4: VERIFY RESULTS
-- ============================================================================

-- Check user wallets
SELECT 
    p.username,
    w.pending_balance,
    w.total_earned,
    CASE p.username
        WHEN 'midtier1' THEN 'Expected: AF 20.00 (20%)'
        WHEN 'poweruser3' THEN 'Expected: AF 3.00 (3%)'
        WHEN 'poweruser' THEN 'Expected: AF 4.00 (4%)'
        ELSE ''
    END as expected
FROM user_wallets w
JOIN profiles p ON p.id = w.user_id
WHERE w.pending_balance > 0
ORDER BY w.pending_balance DESC;

-- Check poverty fund
SELECT 
    total_balance as poverty_balance,
    'Expected: AF 13.00 (5% + 8%)' as expected
FROM poverty_fund;

-- Check totals add up to 40%
SELECT 
    (SELECT SUM(pending_balance) FROM user_wallets) as users_total,
    (SELECT total_balance FROM poverty_fund LIMIT 1) as poverty_total,
    (SELECT SUM(pending_balance) FROM user_wallets) + 
    (SELECT COALESCE(total_balance, 0) FROM poverty_fund LIMIT 1) as total_distributed,
    'Should equal AF 40.00 (40% of AF 100)' as verification;
