-- ============================================================================
-- DELETE ALL CHECKUSER TEST DATA
-- ============================================================================
-- Remove all checkuser test users to fix duplicate positions
-- Keep original users (founder, poweruser, etc.)
-- ============================================================================

-- STEP 1: Delete commission transactions for checkusers
DELETE FROM commission_transactions
WHERE user_id IN (SELECT id FROM profiles WHERE username LIKE 'checkuser%')
   OR from_user_id IN (SELECT id FROM profiles WHERE username LIKE 'checkuser%');

-- STEP 2: Delete wallets for checkusers
DELETE FROM user_wallets
WHERE user_id IN (SELECT id FROM profiles WHERE username LIKE 'checkuser%');

-- STEP 3: Delete matrix positions for checkusers
DELETE FROM matrix_positions
WHERE user_id IN (SELECT id FROM profiles WHERE username LIKE 'checkuser%');

-- STEP 4: Delete checkuser profiles
DELETE FROM profiles
WHERE username LIKE 'checkuser%';

-- STEP 5: Verify no more duplicates
SELECT 
    readable_position,
    COUNT(*) as count,
    STRING_AGG(p.username, ', ') as usernames
FROM matrix_positions mp
LEFT JOIN profiles p ON p.id = mp.user_id
GROUP BY readable_position
HAVING COUNT(*) > 1
ORDER BY readable_position;

-- STEP 6: Add unique constraint to prevent future duplicates
ALTER TABLE matrix_positions 
ADD CONSTRAINT matrix_positions_readable_position_unique UNIQUE (readable_position);

SELECT '✅ All checkusers deleted, unique constraint added' as status;
