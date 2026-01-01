-- ============================================================================
-- INITIALIZE USER WALLETS FOR ALL MATRIX USERS
-- ============================================================================
-- Creates wallets for users who don't have one yet
-- ============================================================================

-- First, check if user_wallets table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'user_wallets'
) as wallets_table_exists;

-- If the table exists, insert wallets for all users who have matrix positions
INSERT INTO user_wallets (user_id, available_balance, pending_balance, total_earned)
SELECT 
    mp.user_id,
    0.00,  -- Start with 0 available
    0.00,  -- Start with 0 pending
    0.00   -- Start with 0 total earned
FROM matrix_positions mp
WHERE NOT EXISTS (
    SELECT 1 FROM user_wallets w WHERE w.user_id = mp.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify wallets were created
SELECT 
    p.username,
    p.display_name,
    w.available_balance,
    w.pending_balance,
    w.total_earned
FROM user_wallets w
JOIN profiles p ON p.id = w.user_id
ORDER BY p.username;

SELECT 'Wallets initialized for ' || COUNT(*) || ' users' as status
FROM user_wallets;
