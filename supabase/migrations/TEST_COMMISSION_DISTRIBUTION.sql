-- ============================================================================
-- TEST COMMISSION DISTRIBUTION
-- ============================================================================
-- Simulates a VISA purchase and shows how commissions would be distributed
-- ============================================================================

-- Step 1: Pick a test user from the matrix
SELECT 
    '🧪 TEST SCENARIO' as test_name,
    'Simulating £100 VISA purchase by user at position 3,1' as description;

-- Get user details at position 3,1
SELECT 
    p.username as "Test User",
    mp.readable_position as "Position",
    v.visa_type as "Current VISA"
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN visas v ON mp.visa_id = v.id
WHERE mp.readable_position = '3,1';

-- Step 2: Show their upline structure
SELECT 
    '👥 UPLINE STRUCTURE' as section,
    '' as details;

SELECT 
    upline.upline_level as "Level Up",
    upline_mp.readable_position as "Upline Position",
    upline_p.username as "Upline User",
    cr.commission_percentage || '%' as "Commission Rate"
FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
CROSS JOIN LATERAL get_commission_upline(mp.user_id) as upline
JOIN matrix_positions upline_mp ON upline.position_id = upline_mp.id
LEFT JOIN profiles upline_p ON upline_mp.user_id = upline_p.id
LEFT JOIN commission_rates cr ON cr.upline_level = upline.upline_level
WHERE mp.readable_position = '3,1'
ORDER BY upline.upline_level;

-- Step 3: Simulate the commission distribution
SELECT 
    '💰 COMMISSION DISTRIBUTION SIMULATION' as section,
    'Purchase Amount: £100' as details;

-- Show how £100 would be split
WITH purchase_details AS (
    SELECT 100.00 as amount
),
distribution AS (
    SELECT 
        1 as level,
        'Level 1 Sponsor' as recipient,
        20.00 as commission,
        20.00 as percentage
    UNION ALL
    SELECT 2, 'Level 2 Sponsor', 3.00, 3.00
    UNION ALL
    SELECT 3, 'Level 3 Sponsor', 4.00, 4.00
    UNION ALL
    SELECT 4, 'Level 4 Sponsor', 5.00, 5.00
    UNION ALL
    SELECT 5, 'Level 5 Sponsor', 8.00, 8.00
    UNION ALL
    SELECT 0, 'Company Profit', 60.00, 60.00
)
SELECT 
    level as "Priority",
    recipient as "Recipient",
    '£' || commission as "Amount",
    percentage || '%' as "Percentage"
FROM distribution
ORDER BY level;

-- Step 4: Summary
SELECT 
    '✅ Commission Engine Ready' as status,
    'To distribute real commissions, call distribute_visa_commission(user_id, amount, purchase_id)' as next_step;

-- Example command to run (commented out - replace UUIDs with real values):
/*
SELECT * FROM distribute_visa_commission(
    (SELECT user_id FROM matrix_positions WHERE readable_position = '3,1'),
    100.00,
    gen_random_uuid()  -- Generate a test purchase ID
);
*/
