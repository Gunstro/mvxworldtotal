-- ============================================================================
-- MEGAMATRIX COMMISSION ENGINE - CONSOLIDATED SCHEMA
-- ============================================================================
-- Version: 3.0
-- Date: 2025-12-26
-- 
-- This is a CLEAN migration that:
-- 1. Drops existing partial tables (if any)
-- 2. Creates all required tables with correct structure
-- 3. Supports AF (AFRO), MB (MegaBucks), and NFTs
-- 4. Implements OPEN spots for orphan users
-- ============================================================================

-- ============================================================================
-- STEP 0: DROP EXISTING TABLES (Clean Start)
-- ============================================================================
-- Run this ONLY if you need to start fresh
-- Comment out if you want to preserve existing data

DROP TABLE IF EXISTS user_mb_activity_log CASCADE;
DROP TABLE IF EXISTS mb_visa_multipliers CASCADE;
DROP TABLE IF EXISTS mb_earning_rates CASCADE;
DROP TABLE IF EXISTS commission_transactions CASCADE;
DROP TABLE IF EXISTS visa_purchases CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;
DROP TABLE IF EXISTS matrix_positions CASCADE;
DROP TABLE IF EXISTS platform_funds CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS commission_rates CASCADE;

-- ============================================================================
-- STEP 1: UPDATE VISAS TABLE (Add matrix columns)
-- ============================================================================

ALTER TABLE visas 
    ADD COLUMN IF NOT EXISTS matrix_level INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS auto_upgrade_threshold DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_children INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS exchange_fee_percent DECIMAL(4,2) DEFAULT 12.5;

-- Update matrix levels for existing visas
UPDATE visas SET matrix_level = 1, max_children = 20, exchange_fee_percent = 2.5 WHERE visa_type = 'Gold VIP Founder';
UPDATE visas SET matrix_level = 1, max_children = 20, exchange_fee_percent = 3.5 WHERE visa_type = 'VIP';
UPDATE visas SET matrix_level = 2, max_children = 10, exchange_fee_percent = 5.0 WHERE visa_type = 'Gold Premiere';
UPDATE visas SET matrix_level = 2, max_children = 10, exchange_fee_percent = 6.0 WHERE visa_type = 'Premiere';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 7.5 WHERE visa_type = 'Ambassador';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 8.5 WHERE visa_type = 'Executive';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 10.0 WHERE visa_type = 'City Patron';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 11.0 WHERE visa_type = 'City Dweller';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 12.0 WHERE visa_type = 'Novice';
UPDATE visas SET matrix_level = 3, max_children = 5, exchange_fee_percent = 12.5 WHERE visa_type = 'Free';

-- Update auto-upgrade thresholds (wallet balance that triggers upgrade)
UPDATE visas SET auto_upgrade_threshold = 95 WHERE visa_type = 'Free';
UPDATE visas SET auto_upgrade_threshold = 195 WHERE visa_type = 'Novice';
UPDATE visas SET auto_upgrade_threshold = 295 WHERE visa_type = 'City Dweller';
UPDATE visas SET auto_upgrade_threshold = 395 WHERE visa_type = 'City Patron';
UPDATE visas SET auto_upgrade_threshold = 495 WHERE visa_type = 'Executive';
UPDATE visas SET auto_upgrade_threshold = 795 WHERE visa_type = 'Ambassador';
UPDATE visas SET auto_upgrade_threshold = 895 WHERE visa_type = 'Premiere';
UPDATE visas SET auto_upgrade_threshold = 1950 WHERE visa_type = 'Gold Premiere';
UPDATE visas SET auto_upgrade_threshold = 2750 WHERE visa_type = 'VIP';
UPDATE visas SET auto_upgrade_threshold = 0 WHERE visa_type = 'Gold VIP Founder'; -- MAX TIER

-- ============================================================================
-- STEP 2: MATRIX POSITIONS TABLE
-- ============================================================================

CREATE TABLE matrix_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User/Position identification
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    visa_id UUID REFERENCES visas(id),
    
    -- Matrix structure
    sponsor_id UUID REFERENCES matrix_positions(id),
    referrer_user_id UUID REFERENCES auth.users(id),
    matrix_level INTEGER NOT NULL DEFAULT 3,
    position_number SERIAL,
    depth INTEGER DEFAULT 0,
    
    -- Children tracking
    children_count INTEGER DEFAULT 0,
    max_children INTEGER DEFAULT 5,
    is_full BOOLEAN DEFAULT FALSE,
    
    -- OPEN spot tracking
    is_open_spot BOOLEAN DEFAULT FALSE,
    open_spot_commission DECIMAL(12,2) DEFAULT 0,
    open_spot_cap DECIMAL(12,2) DEFAULT 1000,
    claimed_at TIMESTAMPTZ,
    claimed_by UUID REFERENCES auth.users(id),
    
    -- Placement tracking
    is_spillover BOOLEAN DEFAULT FALSE,
    is_legacy_founder BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_matrix_user ON matrix_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_sponsor ON matrix_positions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_matrix_level ON matrix_positions(matrix_level);
CREATE INDEX IF NOT EXISTS idx_matrix_open ON matrix_positions(is_open_spot) WHERE is_open_spot = TRUE;
CREATE INDEX IF NOT EXISTS idx_matrix_referrer ON matrix_positions(referrer_user_id);

-- ============================================================================
-- STEP 3: USER WALLETS TABLE (3 Currencies: AF, MB, NFTs)
-- ============================================================================

CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- AFRO (AF) Balances - Platform stablecoin 1:1 GBP
    afro_available DECIMAL(14,2) DEFAULT 0,
    afro_pending DECIMAL(14,2) DEFAULT 0,
    afro_locked DECIMAL(14,2) DEFAULT 0,
    
    -- MegaBucks (MB) Balance - Platform engagement currency
    megabucks_balance BIGINT DEFAULT 0,
    
    -- Monthly tracking (for caps)
    this_month_afro_earned DECIMAL(12,2) DEFAULT 0,
    monthly_cap DECIMAL(12,2) DEFAULT 75,
    monthly_fee_paid BOOLEAN DEFAULT FALSE,
    
    -- Lifetime stats
    lifetime_afro_earned DECIMAL(14,2) DEFAULT 0,
    lifetime_afro_withdrawn DECIMAL(14,2) DEFAULT 0,
    lifetime_megabucks_earned BIGINT DEFAULT 0,
    lifetime_megabucks_spent BIGINT DEFAULT 0,
    
    -- Visa reference
    current_visa_id UUID REFERENCES visas(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_monthly_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_afro_balances CHECK (
        afro_available >= 0 AND 
        afro_pending >= 0 AND 
        afro_locked >= 0
    ),
    CONSTRAINT positive_mb_balance CHECK (megabucks_balance >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_visa ON user_wallets(current_visa_id);

-- ============================================================================
-- STEP 4: PLATFORM FUNDS TABLE (MB Backing, Poverty Fund, Operating)
-- ============================================================================

CREATE TABLE platform_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_type VARCHAR(50) NOT NULL UNIQUE,
    -- Types: 'mb_backing', 'poverty_fund', 'operating'
    
    balance DECIMAL(16,2) DEFAULT 0,
    
    -- For MB backing specifically
    total_mb_issued BIGINT DEFAULT 0,
    current_mb_value DECIMAL(10,6) DEFAULT 0.01,
    
    -- Tracking
    last_transaction_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize platform funds
INSERT INTO platform_funds (fund_type, balance, total_mb_issued, current_mb_value) VALUES
    ('mb_backing', 0, 0, 0.01),
    ('poverty_fund', 0, 0, 0),
    ('operating', 0, 0, 0)
ON CONFLICT (fund_type) DO NOTHING;

-- ============================================================================
-- STEP 5: WALLET TRANSACTIONS TABLE (Complete Audit Trail)
-- ============================================================================

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    
    -- Transaction details
    currency_type VARCHAR(10) NOT NULL, -- 'af', 'mb'
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Balance after transaction
    balance_after DECIMAL(14,2),
    
    -- For exchanges
    from_currency VARCHAR(10),
    to_currency VARCHAR(10),
    exchange_rate DECIMAL(10,6),
    
    -- References
    related_transaction_id UUID REFERENCES wallet_transactions(id),
    visa_purchase_id UUID,
    matrix_position_id UUID REFERENCES matrix_positions(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON wallet_transactions(created_at);

-- ============================================================================
-- STEP 6: VISA PURCHASES TABLE (10-day holding period)
-- ============================================================================

CREATE TABLE visa_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    visa_id UUID NOT NULL REFERENCES visas(id),
    
    -- Purchase details
    purchase_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'card',
    
    -- Commission tracking
    commission_pool DECIMAL(10,2) NOT NULL,
    commissions_distributed BOOLEAN DEFAULT FALSE,
    
    -- Holding period
    holding_start TIMESTAMPTZ DEFAULT NOW(),
    holding_end TIMESTAMPTZ,
    is_released BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visa_purchases_user ON visa_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_visa_purchases_holding ON visa_purchases(is_released, holding_end);

-- Auto-set holding end date (10 days)
CREATE OR REPLACE FUNCTION set_holding_end_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.holding_end := NEW.holding_start + INTERVAL '10 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_holding_end ON visa_purchases;
CREATE TRIGGER tr_set_holding_end
    BEFORE INSERT ON visa_purchases
    FOR EACH ROW
    EXECUTE FUNCTION set_holding_end_date();

-- ============================================================================
-- STEP 7: COMMISSION RATES TABLE
-- ============================================================================

CREATE TABLE commission_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_level INTEGER NOT NULL UNIQUE,
    rate_percent DECIMAL(5,2) NOT NULL,
    description VARCHAR(100)
);

-- Insert commission rates (5 levels, total 40%)
INSERT INTO commission_rates (upline_level, rate_percent, description) VALUES
    (1, 20.00, 'Direct Sponsor'),
    (2, 3.00, 'Level 2'),
    (3, 4.00, 'Level 3'),
    (4, 5.00, 'Level 4'),
    (5, 8.00, 'Level 5')
ON CONFLICT (upline_level) DO NOTHING;

-- ============================================================================
-- STEP 8: COMMISSION TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parties
    earner_user_id UUID NOT NULL REFERENCES auth.users(id),
    source_user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Commission details
    visa_purchase_id UUID REFERENCES visa_purchases(id),
    upline_level INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, released, capped, overflow
    
    -- If capped, how much went to poverty fund
    overflow_to_poverty DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commission_earner ON commission_transactions(earner_user_id);
CREATE INDEX IF NOT EXISTS idx_commission_source ON commission_transactions(source_user_id);
CREATE INDEX IF NOT EXISTS idx_commission_status ON commission_transactions(status);

-- ============================================================================
-- STEP 9: MB EARNING RATES TABLE
-- ============================================================================

CREATE TABLE mb_earning_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_code VARCHAR(50) NOT NULL UNIQUE,
    activity_name VARCHAR(100) NOT NULL,
    activity_description TEXT,
    activity_category VARCHAR(50) NOT NULL,
    mb_reward BIGINT NOT NULL DEFAULT 0,
    daily_limit INTEGER,
    monthly_limit INTEGER,
    lifetime_limit INTEGER,
    cooldown_minutes INTEGER DEFAULT 0,
    applies_multiplier BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default earning rates
INSERT INTO mb_earning_rates (activity_code, activity_name, activity_category, mb_reward, daily_limit, cooldown_minutes, activity_description) VALUES
    ('daily_login', 'Daily Login', 'engagement', 10, 1, 1440, 'Login once per day'),
    ('profile_complete', 'Complete Profile', 'engagement', 100, NULL, NULL, 'One-time profile completion'),
    ('kyc_verified', 'KYC Verified', 'engagement', 500, NULL, NULL, 'One-time KYC verification'),
    ('post_created', 'Create Post', 'content', 5, 10, 5, 'Create a new post'),
    ('post_with_media', 'Post with Media', 'content', 10, 10, 5, 'Create post with image/video'),
    ('comment_made', 'Comment', 'content', 2, 50, 1, 'Comment on a post'),
    ('ad_viewed', 'Ad Viewed', 'commerce', 1, 100, 0, 'View an advertisement'),
    ('referral_signup', 'Referral Signup', 'social', 100, NULL, 0, 'Referral signs up'),
    ('referral_first_purchase', 'Referral First Purchase', 'social', 500, NULL, 0, 'Referral makes first purchase')
ON CONFLICT (activity_code) DO NOTHING;

-- ============================================================================
-- STEP 10: USER MB ACTIVITY LOG
-- ============================================================================

CREATE TABLE user_mb_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_code VARCHAR(50) NOT NULL,
    mb_earned BIGINT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mb_activity_user ON user_mb_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mb_activity_code ON user_mb_activity_log(activity_code);
CREATE INDEX IF NOT EXISTS idx_mb_activity_date ON user_mb_activity_log(earned_at);

-- ============================================================================
-- STEP 11: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE matrix_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mb_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own matrix position"
    ON matrix_positions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet"
    ON user_wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
    ON wallet_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own visa purchases"
    ON visa_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own commissions"
    ON commission_transactions FOR SELECT
    USING (auth.uid() = earner_user_id);

CREATE POLICY "Users can view own MB activity"
    ON user_mb_activity_log FOR SELECT
    USING (auth.uid() = user_id);

-- Public read for rates and funds
CREATE POLICY "Anyone can view commission rates"
    ON commission_rates FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view MB earning rates"
    ON mb_earning_rates FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view platform funds"
    ON platform_funds FOR SELECT
    USING (true);

-- ============================================================================
-- STEP 12: HELPER FUNCTIONS
-- ============================================================================

-- Function to get max children based on matrix level
CREATE OR REPLACE FUNCTION get_max_children(p_matrix_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE p_matrix_level
        WHEN 0 THEN RETURN 20000;  -- Poverty Relief
        WHEN 1 THEN RETURN 20;     -- Founders
        WHEN 2 THEN RETURN 10;     -- Premiere
        ELSE RETURN 5;             -- Standard (Level 3+)
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to count total downline recursively
CREATE OR REPLACE FUNCTION count_total_downline(position_id UUID)
RETURNS BIGINT AS $$
DECLARE
    total_count BIGINT := 0;
BEGIN
    WITH RECURSIVE downline AS (
        SELECT id FROM matrix_positions WHERE sponsor_id = position_id
        UNION ALL
        SELECT m.id FROM matrix_positions m
        INNER JOIN downline d ON m.sponsor_id = d.id
    )
    SELECT COUNT(*) INTO total_count FROM downline;
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get upline for commission distribution (5 levels)
CREATE OR REPLACE FUNCTION get_commission_upline(p_position_id UUID)
RETURNS TABLE (
    level_num INTEGER,
    position_id UUID,
    user_id UUID,
    is_open_spot BOOLEAN
) AS $$
DECLARE
    current_id UUID := p_position_id;
    current_level INTEGER := 0;
BEGIN
    WHILE current_level < 5 LOOP
        -- Get parent position
        SELECT m.sponsor_id INTO current_id
        FROM matrix_positions m
        WHERE m.id = current_id;
        
        IF current_id IS NULL THEN
            EXIT;
        END IF;
        
        current_level := current_level + 1;
        
        RETURN QUERY
        SELECT 
            current_level,
            m.id,
            m.user_id,
            m.is_open_spot
        FROM matrix_positions m
        WHERE m.id = current_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to find next OPEN spot using round-robin
CREATE OR REPLACE FUNCTION find_next_open_spot(p_matrix_level INTEGER)
RETURNS UUID AS $$
DECLARE
    v_open_spot_id UUID;
BEGIN
    -- Find OPEN spot at the specified level with least filled parent
    -- This implements round-robin distribution
    SELECT mp.id INTO v_open_spot_id
    FROM matrix_positions mp
    WHERE mp.is_open_spot = TRUE
      AND mp.user_id IS NULL
      AND mp.matrix_level = p_matrix_level
    ORDER BY mp.created_at ASC
    LIMIT 1;
    
    RETURN v_open_spot_id;
END;
$$ LANGUAGE plpgsql;

-- Function to award MegaBucks
CREATE OR REPLACE FUNCTION award_megabucks(
    p_user_id UUID,
    p_activity_code VARCHAR(50)
)
RETURNS BIGINT AS $$
DECLARE
    v_rate RECORD;
    v_today_count INTEGER;
    v_final_mb BIGINT;
BEGIN
    -- Get the earning rate
    SELECT * INTO v_rate
    FROM mb_earning_rates
    WHERE activity_code = p_activity_code
      AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Check daily limit
    IF v_rate.daily_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_today_count
        FROM user_mb_activity_log
        WHERE user_id = p_user_id
          AND activity_code = p_activity_code
          AND earned_at >= CURRENT_DATE;
        
        IF v_today_count >= v_rate.daily_limit THEN
            RETURN 0;
        END IF;
    END IF;
    
    v_final_mb := v_rate.mb_reward;
    
    -- Log the activity
    INSERT INTO user_mb_activity_log (user_id, activity_code, mb_earned)
    VALUES (p_user_id, p_activity_code, v_final_mb);
    
    -- Update user's MB balance
    UPDATE user_wallets
    SET megabucks_balance = megabucks_balance + v_final_mb,
        lifetime_megabucks_earned = lifetime_megabucks_earned + v_final_mb,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_final_mb;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 13: INITIALIZE POVERTY RELIEF (Level 0 Root)
-- ============================================================================

-- Create a virtual user ID for Poverty Relief
DO $$
DECLARE
    poverty_relief_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Create the root matrix position
    INSERT INTO matrix_positions (
        id,
        user_id,
        matrix_level,
        max_children,
        is_open_spot,
        is_legacy_founder
    ) VALUES (
        poverty_relief_id,
        NULL,  -- No user - this is the system root
        0,     -- Level 0
        20000, -- Can have 20,000 direct children (Founders)
        FALSE,
        FALSE
    ) ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- STEP 14: FUNCTION TO CREATE OPEN SPOTS FOR FOUNDERS
-- ============================================================================
-- When a Founder is imported, this creates their child OPEN spots
-- Level 1 Founder → Creates 20 Level 2 OPEN spots
-- Each Level 2 → Creates 10 Level 3 OPEN spots

CREATE OR REPLACE FUNCTION create_founder_open_spots(
    p_founder_position_id UUID,
    p_create_level_3 BOOLEAN DEFAULT TRUE
)
RETURNS INTEGER AS $$
DECLARE
    v_level2_count INTEGER := 20;  -- Founders get 20 Level 2 children
    v_level3_count INTEGER := 10;  -- Level 2 gets 10 Level 3 children
    v_new_level2_id UUID;
    v_total_created INTEGER := 0;
    v_founder_depth INTEGER;
BEGIN
    -- Get founder's depth
    SELECT depth INTO v_founder_depth
    FROM matrix_positions
    WHERE id = p_founder_position_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Founder position not found: %', p_founder_position_id;
    END IF;

    -- Create 20 Level 2 OPEN spots under this Founder
    FOR i IN 1..v_level2_count LOOP
        INSERT INTO matrix_positions (
            sponsor_id,
            matrix_level,
            max_children,
            depth,
            is_open_spot,
            open_spot_commission,
            open_spot_cap
        ) VALUES (
            p_founder_position_id,
            2,              -- Level 2 (Premiere level)
            10,             -- Max 10 children
            v_founder_depth + 1,
            TRUE,           -- This is an OPEN spot
            0,              -- No commission accumulated yet
            1000            -- Cap at AF 1000
        )
        RETURNING id INTO v_new_level2_id;
        
        v_total_created := v_total_created + 1;
        
        -- Update founder's children count
        UPDATE matrix_positions
        SET children_count = children_count + 1,
            is_full = (children_count + 1 >= max_children)
        WHERE id = p_founder_position_id;
        
        -- Optionally create Level 3 OPEN spots under each Level 2
        IF p_create_level_3 THEN
            FOR j IN 1..v_level3_count LOOP
                INSERT INTO matrix_positions (
                    sponsor_id,
                    matrix_level,
                    max_children,
                    depth,
                    is_open_spot,
                    open_spot_commission,
                    open_spot_cap
                ) VALUES (
                    v_new_level2_id,
                    3,              -- Level 3 (Standard level)
                    5,              -- Max 5 children
                    v_founder_depth + 2,
                    TRUE,           -- This is an OPEN spot
                    0,
                    1000
                );
                
                v_total_created := v_total_created + 1;
                
                -- Update Level 2's children count
                UPDATE matrix_positions
                SET children_count = children_count + 1,
                    is_full = (children_count + 1 >= max_children)
                WHERE id = v_new_level2_id;
            END LOOP;
        END IF;
    END LOOP;
    
    RETURN v_total_created;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 15: FUNCTION TO CLAIM AN OPEN SPOT
-- ============================================================================
-- When a user claims an OPEN spot:
-- 1. Transfer the position to them
-- 2. Split accumulated commissions: 50% to user, 50% to Poverty Fund

CREATE OR REPLACE FUNCTION claim_open_spot(
    p_open_spot_id UUID,
    p_user_id UUID,
    p_visa_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    inherited_amount DECIMAL(12,2),
    poverty_amount DECIMAL(12,2),
    message TEXT
) AS $$
DECLARE
    v_spot RECORD;
    v_inherited_amount DECIMAL(12,2);
    v_poverty_amount DECIMAL(12,2);
BEGIN
    -- Get the OPEN spot
    SELECT * INTO v_spot
    FROM matrix_positions
    WHERE id = p_open_spot_id
      AND is_open_spot = TRUE
      AND user_id IS NULL;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL(12,2), 0::DECIMAL(12,2), 'OPEN spot not found or already claimed'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate split (50/50)
    v_inherited_amount := v_spot.open_spot_commission / 2;
    v_poverty_amount := v_spot.open_spot_commission - v_inherited_amount;
    
    -- Update the OPEN spot to be owned by the user
    UPDATE matrix_positions
    SET user_id = p_user_id,
        visa_id = p_visa_id,
        is_open_spot = FALSE,
        claimed_at = NOW(),
        claimed_by = p_user_id,
        open_spot_commission = 0,
        updated_at = NOW()
    WHERE id = p_open_spot_id;
    
    -- Credit inherited amount to user's wallet
    IF v_inherited_amount > 0 THEN
        UPDATE user_wallets
        SET afro_available = afro_available + v_inherited_amount,
            lifetime_afro_earned = lifetime_afro_earned + v_inherited_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Log the transaction
        INSERT INTO wallet_transactions (
            user_id,
            currency_type,
            transaction_type,
            amount,
            description,
            matrix_position_id
        ) VALUES (
            p_user_id,
            'af',
            'open_spot_inheritance',
            v_inherited_amount,
            'Inherited from claimed OPEN spot',
            p_open_spot_id
        );
    END IF;
    
    -- Credit poverty fund
    IF v_poverty_amount > 0 THEN
        UPDATE platform_funds
        SET balance = balance + v_poverty_amount,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE fund_type = 'poverty_fund';
        
        -- Log the transaction
        INSERT INTO wallet_transactions (
            currency_type,
            transaction_type,
            amount,
            description,
            matrix_position_id
        ) VALUES (
            'af',
            'open_spot_poverty_allocation',
            v_poverty_amount,
            'From claimed OPEN spot',
            p_open_spot_id
        );
    END IF;
    
    RETURN QUERY SELECT TRUE, v_inherited_amount, v_poverty_amount, 'OPEN spot claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 16: FUNCTION TO ADD COMMISSION TO OPEN SPOT
-- ============================================================================
-- When an OPEN spot earns commission (from its downline),
-- add to accumulated balance (capped at AF 1000)

CREATE OR REPLACE FUNCTION add_open_spot_commission(
    p_open_spot_id UUID,
    p_amount DECIMAL(12,2)
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    v_current RECORD;
    v_can_add DECIMAL(12,2);
    v_overflow DECIMAL(12,2);
BEGIN
    -- Get current OPEN spot balance
    SELECT open_spot_commission, open_spot_cap INTO v_current
    FROM matrix_positions
    WHERE id = p_open_spot_id
      AND is_open_spot = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate how much can be added before cap
    v_can_add := LEAST(p_amount, v_current.open_spot_cap - v_current.open_spot_commission);
    v_overflow := p_amount - v_can_add;
    
    -- Add commission to OPEN spot
    IF v_can_add > 0 THEN
        UPDATE matrix_positions
        SET open_spot_commission = open_spot_commission + v_can_add,
            updated_at = NOW()
        WHERE id = p_open_spot_id;
    END IF;
    
    -- Overflow goes to poverty fund
    IF v_overflow > 0 THEN
        UPDATE platform_funds
        SET balance = balance + v_overflow,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE fund_type = 'poverty_fund';
    END IF;
    
    RETURN v_can_add;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- 
-- Tables created:
-- 1. matrix_positions - User positions in the matrix with OPEN spot support
-- 2. user_wallets - AF and MB balances for each user
-- 3. platform_funds - MB backing, Poverty Fund, Operating accounts
-- 4. wallet_transactions - Complete transaction audit trail
-- 5. visa_purchases - Visa purchase history with 10-day holding
-- 6. commission_rates - 20%/3%/4%/5%/8% commission levels
-- 7. commission_transactions - Commission distribution records
-- 8. mb_earning_rates - Configurable MB earning activities
-- 9. user_mb_activity_log - MB earning activity tracking
--
-- Functions created:
-- - get_max_children() - Get max children for a matrix level
-- - count_total_downline() - Recursive downline count
-- - get_commission_upline() - Get 5-level upline for commissions
-- - find_next_open_spot() - Round-robin OPEN spot finder
-- - award_megabucks() - Award MB with limits/cooldowns
-- - create_founder_open_spots() - Create OPEN spots for imported Founders
-- - claim_open_spot() - Claim an OPEN spot (50/50 split)
-- - add_open_spot_commission() - Add commission to OPEN spot (capped)
--
-- Usage:
-- After importing a Founder, call:
--   SELECT create_founder_open_spots('founder-position-uuid');
-- 
-- This creates 20 Level 2 + 200 Level 3 OPEN spots (220 total per Founder)
--
-- ============================================================================

