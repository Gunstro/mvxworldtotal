-- ============================================================================
-- FIX COMMISSION DISTRIBUTION SYSTEM
-- ============================================================================
-- Step 1: Check commission_transactions table structure
-- Step 2: Create/fix the table if needed
-- Step 3: Update the distribute_visa_commission function
-- ============================================================================

-- ============================================================================
-- STEP 1: CHECK CURRENT TABLE STRUCTURE
-- ============================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'commission_transactions'
ORDER BY ordinal_position;

-- If the table doesn't exist or has wrong structure, run Step 2

-- ============================================================================
-- STEP 2: CREATE/RECREATE commission_transactions TABLE
-- ============================================================================
-- Uncomment and run if needed:

DROP TABLE IF EXISTS commission_transactions CASCADE;

CREATE TABLE commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),          -- Who receives the commission
    from_user_id UUID NOT NULL REFERENCES profiles(id),     -- Who made the purchase
    purchase_id UUID,                                         -- Links to the visa purchase
    upline_level INTEGER NOT NULL,                           -- 1-5 (which level up)
    commission_amount DECIMAL(10,2) NOT NULL,                -- Amount earned
    commission_percentage DECIMAL(5,2) NOT NULL,             -- Percentage rate
    transaction_type TEXT DEFAULT 'visa_purchase_commission',
    status TEXT DEFAULT 'pending',                           -- pending, cleared, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cleared_at TIMESTAMPTZ,                                  -- When commission clears (10-day hold)
    
    CONSTRAINT valid_level CHECK (upline_level >= 1 AND upline_level <= 5),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'cleared', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX idx_commission_tx_user ON commission_transactions(user_id);
CREATE INDEX idx_commission_tx_from_user ON commission_transactions(from_user_id);
CREATE INDEX idx_commission_tx_purchase ON commission_transactions(purchase_id);
CREATE INDEX idx_commission_tx_status ON commission_transactions(status);

-- Enable RLS
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own commissions
CREATE POLICY "Users can view own commissions"
ON commission_transactions FOR SELECT
USING (auth.uid() = user_id);

SELECT '✅ commission_transactions table created/updated' as status;

-- ============================================================================
-- STEP 3: VERIFY TABLE STRUCTURE
-- ============================================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'commission_transactions'
ORDER BY ordinal_position;
