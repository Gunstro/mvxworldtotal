-- ============================================================================
-- MEGAMATRIX COMMISSION ENGINE - PHASE 1 DATABASE SCHEMA
-- ============================================================================
-- Currency: GBP (£) exclusively
-- Core Principle: Auto-upgrade users to Ambassador tier as quickly as possible
-- ============================================================================

-- ============================================================================
-- 1. UPDATE EXISTING VISAS TABLE (if needed)
-- ============================================================================
-- Add matrix_level and auto_upgrade_threshold columns if not exist
ALTER TABLE visas 
    ADD COLUMN IF NOT EXISTS matrix_level INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS auto_upgrade_threshold DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS next_visa_id UUID REFERENCES visas(id);

-- Update matrix levels for existing visas
UPDATE visas SET matrix_level = 3 WHERE visa_type IN ('Free', 'Novice', 'City Dweller', 'City Patron', 'Executive', 'Ambassador');
UPDATE visas SET matrix_level = 2 WHERE visa_type IN ('Gold Premiere', 'VIP Gold Premiere');
UPDATE visas SET matrix_level = 1 WHERE visa_type IN ('Gold Founder', 'VIP Gold Founder');

-- Update auto-upgrade thresholds (wallet balance that triggers upgrade)
UPDATE visas SET auto_upgrade_threshold = 95 WHERE visa_type = 'Free';
UPDATE visas SET auto_upgrade_threshold = 295 WHERE visa_type = 'Novice';
UPDATE visas SET auto_upgrade_threshold = 395 WHERE visa_type = 'City Dweller';
UPDATE visas SET auto_upgrade_threshold = 495 WHERE visa_type = 'City Patron';
UPDATE visas SET auto_upgrade_threshold = 695 WHERE visa_type = 'Executive';
UPDATE visas SET auto_upgrade_threshold = 985 WHERE visa_type = 'Ambassador';
UPDATE visas SET auto_upgrade_threshold = 1250 WHERE visa_type = 'Gold Premiere';
UPDATE visas SET auto_upgrade_threshold = 2250 WHERE visa_type = 'VIP Gold Premiere';
UPDATE visas SET auto_upgrade_threshold = 3750 WHERE visa_type = 'Gold Founder';
UPDATE visas SET auto_upgrade_threshold = 0 WHERE visa_type = 'VIP Gold Founder'; -- MAX TIER

-- ============================================================================
-- 2. MATRIX POSITIONS TABLE
-- ============================================================================
-- Tracks each user's position in the fixed matrix
CREATE TABLE IF NOT EXISTS matrix_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULLABLE for Level 0 root
    
    -- Matrix hierarchy
    sponsor_id UUID REFERENCES matrix_positions(id),  -- ACTUAL parent in matrix (placement)
    matrix_level INTEGER NOT NULL DEFAULT 3,           -- 0=PovertyRelief, 1=Founder, 2=Premiere, 3+=Standard
    position_number INTEGER NOT NULL,                  -- Position within sponsor's children (1-indexed)
    global_position BIGINT,                            -- Global sequential position (for ordering)
    depth INTEGER NOT NULL DEFAULT 1,                  -- How deep in the tree (Level 0=0, Level 1=1, etc.)
    
    -- Referrer tracking (who recruited them - may differ from sponsor)
    referrer_user_id UUID REFERENCES auth.users(id),   -- The user who referred this person (original recruiter)
    is_orphan BOOLEAN DEFAULT FALSE,                   -- TRUE if no referrer provided at signup
    is_spillover BOOLEAN DEFAULT FALSE,                -- TRUE if placed via spillover (not directly under referrer)
    
    -- Sponsorship capacity
    children_count INTEGER DEFAULT 0,
    max_children INTEGER NOT NULL,                     -- Level 0=20000, Level 1=20, Level 2=10, Level 3+=5
    is_full BOOLEAN DEFAULT FALSE,
    
    -- Visa info (denormalized for placement queries)
    visa_id UUID REFERENCES visas(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CONSTRAINT valid_matrix_level CHECK (matrix_level >= 0),
    CONSTRAINT valid_depth CHECK (depth >= 0),
    CONSTRAINT valid_children CHECK (children_count >= 0 AND children_count <= max_children),
    CONSTRAINT level_0_nullable_user CHECK (
        (matrix_level = 0 AND user_id IS NULL) OR 
        (matrix_level > 0 AND user_id IS NOT NULL)
    )
);

-- Indexes for fast queries
CREATE INDEX idx_matrix_positions_sponsor ON matrix_positions(sponsor_id);
CREATE INDEX idx_matrix_positions_user ON matrix_positions(user_id);
CREATE INDEX idx_matrix_positions_level ON matrix_positions(matrix_level);
CREATE INDEX idx_matrix_positions_referrer ON matrix_positions(referrer_user_id);
CREATE INDEX idx_matrix_positions_not_full ON matrix_positions(is_full, matrix_level) WHERE is_full = FALSE;
CREATE INDEX idx_matrix_positions_depth ON matrix_positions(depth);
CREATE INDEX idx_matrix_positions_global ON matrix_positions(global_position);

-- ============================================================================
-- 3. USER WALLETS TABLE
-- ============================================================================
-- Tracks user balances and earnings (GBP only)
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Current balances (GBP)
    available_balance DECIMAL(12,2) DEFAULT 0,         -- Available to withdraw or use
    pending_balance DECIMAL(12,2) DEFAULT 0,           -- In holding period (10 days)
    
    -- Monthly tracking (resets monthly)
    this_month_earnings DECIMAL(12,2) DEFAULT 0,       -- Earnings this month (for fee trigger)
    monthly_cap DECIMAL(12,2) DEFAULT 95,              -- Current cap based on visa tier (default Free = £95)
    
    -- Lifetime totals
    total_earned DECIMAL(12,2) DEFAULT 0,
    total_withdrawn DECIMAL(12,2) DEFAULT 0,
    total_to_poverty_fund DECIMAL(12,2) DEFAULT 0,     -- Overflow to poverty fund
    
    -- Current visa info (denormalized for performance)
    -- Note: References visas table - make sure visas table exists first
    current_visa_id UUID REFERENCES visas(id),
    
    -- Flags
    monthly_fee_paid_this_month BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_monthly_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CONSTRAINT positive_balances CHECK (
        available_balance >= 0 AND 
        pending_balance >= 0 AND 
        this_month_earnings >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);
-- Only create visa index if column exists (handled by IF NOT EXISTS on table)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallets' AND column_name = 'current_visa_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_wallets_visa ON user_wallets(current_visa_id);
    END IF;
END $$;

-- ============================================================================
-- 4. VISA PURCHASES TABLE
-- ============================================================================
-- Records all visa purchases with 10-day holding period
CREATE TABLE IF NOT EXISTS visa_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visa_id UUID NOT NULL REFERENCES visas(id),
    
    -- Purchase details (GBP)
    purchase_amount DECIMAL(10,2) NOT NULL,
    
    -- Commission breakdown (calculated at purchase)
    company_share DECIMAL(10,2) NOT NULL,              -- 31.5%
    matrix_commission_pool DECIMAL(10,2) NOT NULL,     -- 40%
    megapartner_pool DECIMAL(10,2) NOT NULL,           -- 28.5% (Phase 2)
    
    -- Holding period
    holding_period_days INTEGER DEFAULT 10,
    holding_start_date TIMESTAMPTZ DEFAULT NOW(),
    holding_end_date TIMESTAMPTZ,                      -- Calculated: start + 10 days
    
    -- Processing status
    status VARCHAR(20) DEFAULT 'pending',              -- pending, released, cancelled
    commissions_distributed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- Set holding end date trigger
CREATE OR REPLACE FUNCTION set_holding_end_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.holding_end_date := NEW.holding_start_date + (NEW.holding_period_days || ' days')::INTERVAL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_holding_end_date
    BEFORE INSERT ON visa_purchases
    FOR EACH ROW
    EXECUTE FUNCTION set_holding_end_date();

CREATE INDEX idx_visa_purchases_user ON visa_purchases(user_id);
CREATE INDEX idx_visa_purchases_status ON visa_purchases(status);
CREATE INDEX idx_visa_purchases_holding ON visa_purchases(holding_end_date) WHERE status = 'pending';

-- ============================================================================
-- 5. COMMISSION TRANSACTIONS TABLE
-- ============================================================================
-- Audit trail for all commission events
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction parties
    from_user_id UUID REFERENCES auth.users(id),       -- Purchaser (source of commission)
    to_user_id UUID REFERENCES auth.users(id),         -- Recipient
    to_poverty_fund BOOLEAN DEFAULT FALSE,             -- If overflow to poverty fund
    
    -- Source
    visa_purchase_id UUID REFERENCES visa_purchases(id),
    
    -- Amount details (GBP)
    amount DECIMAL(10,2) NOT NULL,
    commission_level INTEGER NOT NULL,                 -- 1=20%, 2=3%, 3=4%, 4=5%, 5=8%
    commission_rate DECIMAL(5,2) NOT NULL,             -- The actual rate applied
    
    -- Transaction type
    transaction_type VARCHAR(30) NOT NULL,             -- 'matrix_commission', 'overflow', 'cap_surplus', 'auto_upgrade', 'monthly_fee'
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',            -- pending, completed, failed
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commission_tx_from ON commission_transactions(from_user_id);
CREATE INDEX idx_commission_tx_to ON commission_transactions(to_user_id);
CREATE INDEX idx_commission_tx_purchase ON commission_transactions(visa_purchase_id);
CREATE INDEX idx_commission_tx_type ON commission_transactions(transaction_type);

-- ============================================================================
-- 6. POVERTY FUND TABLE
-- ============================================================================
-- Tracks the Poverty Relief fund (Level 0 entity)
CREATE TABLE IF NOT EXISTS poverty_fund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Balances (GBP)
    total_balance DECIMAL(14,2) DEFAULT 0,
    relief_allocation DECIMAL(14,2) DEFAULT 0,         -- 80% of balance
    megabucks_allocation DECIMAL(14,2) DEFAULT 0,      -- 20% of balance
    
    -- Lifetime totals
    total_received DECIMAL(14,2) DEFAULT 0,
    total_distributed DECIMAL(14,2) DEFAULT 0,
    
    -- Last distribution
    last_distribution_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert single poverty fund record (Level 0 entity)
INSERT INTO poverty_fund (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. MEGABUCKS FUND TABLE
-- ============================================================================
-- Tracks MegaBucks value backing (20% of poverty fund)
CREATE TABLE IF NOT EXISTS megabucks_fund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Balances (GBP)
    total_balance DECIMAL(14,2) DEFAULT 0,
    backing_per_megabuck DECIMAL(10,6) DEFAULT 0.01,   -- £0.01 per MB default
    
    -- Lifetime totals
    total_received DECIMAL(14,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert single megabucks fund record
INSERT INTO megabucks_fund (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. COMMISSION RATES CONFIGURATION TABLE
-- ============================================================================
-- Configurable commission rates for each upline level
CREATE TABLE IF NOT EXISTS commission_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    upline_level INTEGER NOT NULL UNIQUE,              -- 1-5 (levels up from purchaser)
    rate_percentage DECIMAL(5,2) NOT NULL,             -- The percentage rate
    
    -- Metadata
    description VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default commission rates (totals to 40%)
INSERT INTO commission_rates (upline_level, rate_percentage, description) VALUES
    (1, 20.00, 'Direct Sponsor - 20%'),
    (2, 3.00, 'Level 2 Upline - 3%'),
    (3, 4.00, 'Level 3 Upline - 4%'),
    (4, 5.00, 'Level 4 Upline - 5%'),
    (5, 8.00, 'Level 5 Upline - 8%')
ON CONFLICT (upline_level) DO NOTHING;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE matrix_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own matrix position
CREATE POLICY "Users can view own matrix position"
    ON matrix_positions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
    ON user_wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON visa_purchases FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own commission transactions
CREATE POLICY "Users can view own commissions"
    ON commission_transactions FOR SELECT
    USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- Service role can do everything (for backend processing)
CREATE POLICY "Service role full access matrix_positions"
    ON matrix_positions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access user_wallets"
    ON user_wallets FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access visa_purchases"
    ON visa_purchases FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access commission_transactions"
    ON commission_transactions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 10. HELPER FUNCTIONS
-- ============================================================================

-- Function to get max children by matrix level
CREATE OR REPLACE FUNCTION get_max_children(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE level
        WHEN 0 THEN RETURN 20000;  -- Poverty Relief Ltd
        WHEN 1 THEN RETURN 20;     -- Founder level
        WHEN 2 THEN RETURN 10;     -- Premiere level
        ELSE RETURN 5;             -- Standard levels (3+)
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update wallet timestamp
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_wallet_timestamp
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_timestamp();

-- ============================================================================
-- 11. LEVEL 0 ENTITY: POVERTY RELIEF LTD
-- ============================================================================
-- Create a system user and matrix position for Poverty Relief (root of tree)
-- This must be run AFTER auth.users exists

DO $$
DECLARE
    poverty_relief_position_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Note: Level 0 is a system entity, not a real user
    -- Commission overflow goes to poverty_fund table
    
    -- Insert Poverty Relief as Level 0 root position
    INSERT INTO matrix_positions (
        id,
        user_id,
        sponsor_id,
        matrix_level,
        position_number,
        global_position,
        depth,
        max_children,
        is_orphan,
        is_active
    ) VALUES (
        poverty_relief_position_id,
        NULL,                     -- Level 0 has no user (system entity)
        NULL,                     -- No parent (root)
        0,                        -- Level 0
        1,                        -- Position 1
        1,                        -- Global position 1
        0,                        -- Depth 0 (root)
        20000,                    -- Can have 20,000 Founder children
        FALSE,
        TRUE
    ) ON CONFLICT (id) DO NOTHING;
    
END $$;

-- ============================================================================
-- 12. MATRIX PLACEMENT ALGORITHM
-- ============================================================================
-- Finds the optimal position for a new user based on visa level and referrer

CREATE OR REPLACE FUNCTION find_matrix_position(
    p_referrer_user_id UUID,    -- The user who referred (NULL for orphan)
    p_visa_matrix_level INTEGER -- Required level from visa (1, 2, or 3+)
)
RETURNS TABLE (
    sponsor_position_id UUID,
    sponsor_user_id UUID,
    position_number INTEGER,
    depth INTEGER,
    is_spillover BOOLEAN
) AS $$
DECLARE
    v_referrer_position matrix_positions%ROWTYPE;
    v_candidate_position matrix_positions%ROWTYPE;
    v_result RECORD;
BEGIN
    -- ========================================================================
    -- CASE 1: ORPHAN (No referrer) - Use global knitting machine
    -- ========================================================================
    IF p_referrer_user_id IS NULL THEN
        -- For Level 1 (Founders), find first available slot under Poverty Relief
        IF p_visa_matrix_level = 1 THEN
            SELECT * INTO v_candidate_position
            FROM matrix_positions
            WHERE matrix_level = 0
              AND is_full = FALSE
            ORDER BY global_position
            LIMIT 1;
            
            IF FOUND THEN
                RETURN QUERY SELECT 
                    v_candidate_position.id,
                    v_candidate_position.user_id,
                    v_candidate_position.children_count + 1,
                    1,
                    FALSE;
                RETURN;
            END IF;
        
        -- For Level 2 (Premiere), find first available Founder
        ELSIF p_visa_matrix_level = 2 THEN
            SELECT * INTO v_candidate_position
            FROM matrix_positions
            WHERE matrix_level = 1
              AND is_full = FALSE
            ORDER BY global_position
            LIMIT 1;
            
            IF FOUND THEN
                RETURN QUERY SELECT 
                    v_candidate_position.id,
                    v_candidate_position.user_id,
                    v_candidate_position.children_count + 1,
                    2,
                    FALSE;
                RETURN;
            END IF;
        
        -- For Level 3+ (Standard), find first available slot at Level 2+
        ELSE
            SELECT * INTO v_candidate_position
            FROM matrix_positions
            WHERE matrix_level >= 2
              AND is_full = FALSE
            ORDER BY depth, global_position
            LIMIT 1;
            
            IF FOUND THEN
                RETURN QUERY SELECT 
                    v_candidate_position.id,
                    v_candidate_position.user_id,
                    v_candidate_position.children_count + 1,
                    v_candidate_position.depth + 1,
                    FALSE;
                RETURN;
            END IF;
        END IF;
        
        -- No position found
        RETURN;
    END IF;
    
    -- ========================================================================
    -- CASE 2: REFERRED USER - Place in referrer's tree
    -- ========================================================================
    
    -- Get referrer's matrix position
    SELECT * INTO v_referrer_position
    FROM matrix_positions
    WHERE user_id = p_referrer_user_id;
    
    IF NOT FOUND THEN
        -- Referrer not in matrix, treat as orphan
        RETURN QUERY SELECT * FROM find_matrix_position(NULL, p_visa_matrix_level);
        RETURN;
    END IF;
    
    -- ========================================================================
    -- Check if referrer can directly sponsor at the required level
    -- ========================================================================
    
    -- Level 1 (Founder): Only Poverty Relief (Level 0) can sponsor
    IF p_visa_matrix_level = 1 THEN
        IF v_referrer_position.matrix_level = 0 AND v_referrer_position.is_full = FALSE THEN
            RETURN QUERY SELECT 
                v_referrer_position.id,
                v_referrer_position.user_id,
                v_referrer_position.children_count + 1,
                1,
                FALSE;
            RETURN;
        ELSE
            -- Referrer can't sponsor Founders, treat as orphan
            RETURN QUERY SELECT * FROM find_matrix_position(NULL, p_visa_matrix_level);
            RETURN;
        END IF;
    END IF;
    
    -- Level 2 (Premiere): Only Level 1 (Founders) can sponsor
    IF p_visa_matrix_level = 2 THEN
        IF v_referrer_position.matrix_level = 1 AND v_referrer_position.is_full = FALSE THEN
            RETURN QUERY SELECT 
                v_referrer_position.id,
                v_referrer_position.user_id,
                v_referrer_position.children_count + 1,
                2,
                FALSE;
            RETURN;
        ELSIF v_referrer_position.matrix_level = 1 AND v_referrer_position.is_full = TRUE THEN
            -- Referrer is full, find spot in referrer's subtree (spillover)
            -- Note: Founders can't have Premiere grandchildren, so spillover to global
            RETURN QUERY SELECT * FROM find_matrix_position(NULL, p_visa_matrix_level);
            RETURN;
        ELSE
            -- Referrer is wrong level, treat as orphan
            RETURN QUERY SELECT * FROM find_matrix_position(NULL, p_visa_matrix_level);
            RETURN;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Level 3+ (Standard): Can be sponsored by Level 2+ positions
    -- ========================================================================
    
    -- Check if referrer can directly sponsor (must be Level 2+)
    IF v_referrer_position.matrix_level >= 2 AND v_referrer_position.is_full = FALSE THEN
        RETURN QUERY SELECT 
            v_referrer_position.id,
            v_referrer_position.user_id,
            v_referrer_position.children_count + 1,
            v_referrer_position.depth + 1,
            FALSE;
        RETURN;
    END IF;
    
    -- Referrer is full or wrong level - SPILLOVER into referrer's subtree
    -- BFS search for first available position in referrer's tree
    WITH RECURSIVE subtree AS (
        -- Start with referrer's direct children
        SELECT mp.*, 1 as search_depth
        FROM matrix_positions mp
        WHERE mp.sponsor_id = v_referrer_position.id
        
        UNION ALL
        
        -- Recursively get descendants
        SELECT mp.*, st.search_depth + 1
        FROM matrix_positions mp
        INNER JOIN subtree st ON mp.sponsor_id = st.id
        WHERE st.search_depth < 100  -- Limit depth to prevent infinite loops
    )
    SELECT * INTO v_candidate_position
    FROM subtree
    WHERE is_full = FALSE
      AND matrix_level >= 2  -- Must be able to sponsor Standard users
    ORDER BY search_depth, global_position
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            v_candidate_position.id,
            v_candidate_position.user_id,
            v_candidate_position.children_count + 1,
            v_candidate_position.depth + 1,
            TRUE;  -- This is a spillover placement
        RETURN;
    END IF;
    
    -- No spot in referrer's tree, use global placement
    RETURN QUERY SELECT * FROM find_matrix_position(NULL, p_visa_matrix_level);
    
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. PLACE USER IN MATRIX
-- ============================================================================
-- Main function to place a new user in the matrix

CREATE OR REPLACE FUNCTION place_user_in_matrix(
    p_user_id UUID,
    p_visa_id UUID,
    p_referrer_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$  -- Returns the new matrix_position id
DECLARE
    v_visa RECORD;
    v_placement RECORD;
    v_new_position_id UUID;
    v_global_position BIGINT;
BEGIN
    -- Get visa details
    SELECT * INTO v_visa
    FROM visas
    WHERE id = p_visa_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Visa not found: %', p_visa_id;
    END IF;
    
    -- Find placement position
    SELECT * INTO v_placement
    FROM find_matrix_position(p_referrer_user_id, v_visa.matrix_level);
    
    IF v_placement.sponsor_position_id IS NULL THEN
        RAISE EXCEPTION 'No available matrix position for visa level %', v_visa.matrix_level;
    END IF;
    
    -- Get next global position
    SELECT COALESCE(MAX(global_position), 0) + 1 INTO v_global_position
    FROM matrix_positions;
    
    -- Insert new position
    INSERT INTO matrix_positions (
        user_id,
        sponsor_id,
        matrix_level,
        position_number,
        global_position,
        depth,
        referrer_user_id,
        is_orphan,
        is_spillover,
        max_children,
        visa_id
    ) VALUES (
        p_user_id,
        v_placement.sponsor_position_id,
        v_visa.matrix_level,
        v_placement.position_number,
        v_global_position,
        v_placement.depth,
        p_referrer_user_id,
        p_referrer_user_id IS NULL,
        v_placement.is_spillover,
        get_max_children(v_visa.matrix_level),
        p_visa_id
    )
    RETURNING id INTO v_new_position_id;
    
    -- Update sponsor's children count
    UPDATE matrix_positions
    SET children_count = children_count + 1,
        is_full = (children_count + 1 >= max_children),
        updated_at = NOW()
    WHERE id = v_placement.sponsor_position_id;
    
    RETURN v_new_position_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 14. GET UPLINE FOR COMMISSIONS
-- ============================================================================
-- Returns the 5-level upline for commission distribution

CREATE OR REPLACE FUNCTION get_commission_upline(p_user_id UUID)
RETURNS TABLE (
    upline_level INTEGER,
    position_id UUID,
    user_id UUID
) AS $$
DECLARE
    v_current_position matrix_positions%ROWTYPE;
    v_level INTEGER := 0;
BEGIN
    -- Get user's position
    SELECT * INTO v_current_position
    FROM matrix_positions
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Traverse up 5 levels
    WHILE v_level < 5 AND v_current_position.sponsor_id IS NOT NULL LOOP
        -- Move to sponsor
        SELECT * INTO v_current_position
        FROM matrix_positions
        WHERE id = v_current_position.sponsor_id;
        
        IF NOT FOUND OR v_current_position.matrix_level = 0 THEN
            EXIT;  -- Stop at Poverty Relief
        END IF;
        
        v_level := v_level + 1;
        
        RETURN QUERY SELECT 
            v_level,
            v_current_position.id,
            v_current_position.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 15. COUNT TOTAL DOWNLINE (RECURSIVE)
-- ============================================================================
-- Returns the total count of all descendants in a user's tree

CREATE OR REPLACE FUNCTION count_total_downline(position_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    WITH RECURSIVE downline AS (
        -- Direct children
        SELECT id
        FROM matrix_positions
        WHERE sponsor_id = position_id
        
        UNION ALL
        
        -- Recursive descendants
        SELECT mp.id
        FROM matrix_positions mp
        INNER JOIN downline d ON mp.sponsor_id = d.id
    )
    SELECT COUNT(*)::INTEGER INTO total_count FROM downline;
    
    RETURN COALESCE(total_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF PHASE 1 SCHEMA
-- ============================================================================

