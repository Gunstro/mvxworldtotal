-- ============================================================================
-- RESTORE FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Run this after creating test users to restore data integrity
-- Uses NOT VALID to skip checking existing rows
-- ============================================================================

-- Restore profiles FK (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
    END IF;
END $$;

-- Restore matrix_positions FK (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'matrix_positions_user_id_fkey'
    ) THEN
        ALTER TABLE matrix_positions ADD CONSTRAINT matrix_positions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
    END IF;
END $$;

-- Restore user_wallets FK (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_wallets_user_id_fkey'
    ) THEN
        ALTER TABLE user_wallets ADD CONSTRAINT user_wallets_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
    END IF;
END $$;

SELECT '✅ Foreign key constraints restored with NOT VALID flag' as status;
