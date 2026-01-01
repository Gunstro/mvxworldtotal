-- ============================================================================
-- MB EARNING RATES - CONFIGURABLE TABLE
-- ============================================================================
-- This table allows dynamic configuration of MegaBucks earning rates
-- Rates can be adjusted without code changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS mb_earning_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Activity identification
    activity_code VARCHAR(50) NOT NULL UNIQUE,      -- e.g., 'daily_login', 'post_created'
    activity_name VARCHAR(100) NOT NULL,            -- Human-readable name
    activity_description TEXT,                       -- Detailed description
    activity_category VARCHAR(50) NOT NULL,         -- 'engagement', 'content', 'social', 'commerce', 'gaming'
    
    -- Earning amount
    mb_reward BIGINT NOT NULL DEFAULT 0,            -- MegaBucks earned per action
    
    -- Limits
    daily_limit INTEGER,                            -- Max times per day (NULL = unlimited)
    monthly_limit INTEGER,                          -- Max times per month (NULL = unlimited)
    lifetime_limit INTEGER,                         -- Max times ever (NULL = unlimited)
    
    -- Cooldown
    cooldown_minutes INTEGER DEFAULT 0,             -- Minutes between rewards (0 = no cooldown)
    
    -- Visa-based multipliers (optional)
    applies_multiplier BOOLEAN DEFAULT TRUE,        -- Whether visa multiplier applies
    -- If TRUE, higher visa tiers get bonus MB
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEFAULT EARNING RATES (STARTING POINT - ADJUST AS NEEDED)
-- ============================================================================

INSERT INTO mb_earning_rates (activity_code, activity_name, activity_category, mb_reward, daily_limit, cooldown_minutes, activity_description) VALUES
    -- ENGAGEMENT
    ('daily_login', 'Daily Login', 'engagement', 10, 1, 1440, 'Login to the platform once per day'),
    ('profile_complete', 'Complete Profile', 'engagement', 100, NULL, NULL, 'One-time bonus for completing profile'),
    ('kyc_verified', 'KYC Verified', 'engagement', 500, NULL, NULL, 'One-time bonus for completing KYC verification'),
    
    -- CONTENT CREATION
    ('post_created', 'Create Post', 'content', 5, 10, 5, 'Create a new post'),
    ('post_with_media', 'Post with Media', 'content', 10, 10, 5, 'Create a post with image or video'),
    ('comment_made', 'Comment', 'content', 2, 50, 1, 'Comment on a post'),
    ('story_posted', 'Story Posted', 'content', 3, 5, 60, 'Post a story'),
    
    -- SOCIAL INTERACTIONS
    ('post_liked', 'Post Liked', 'social', 1, 100, 0, 'Like a post'),
    ('post_shared', 'Post Shared', 'social', 3, 20, 5, 'Share a post'),
    ('follow_user', 'Follow User', 'social', 2, 50, 1, 'Follow another user'),
    ('receive_follower', 'Gained Follower', 'social', 5, NULL, 0, 'When someone follows you'),
    
    -- ADVERTISING
    ('ad_viewed', 'Ad Viewed', 'commerce', 1, 100, 0, 'View an advertisement'),
    ('ad_clicked', 'Ad Clicked', 'commerce', 5, 20, 5, 'Click on an advertisement'),
    ('ad_placed', 'Ad Placed', 'commerce', 50, 10, 0, 'Place your own advertisement'),
    
    -- REFERRALS
    ('referral_signup', 'Referral Signup', 'social', 100, NULL, 0, 'When your referral signs up'),
    ('referral_first_purchase', 'Referral First Purchase', 'social', 500, NULL, 0, 'When referral makes first visa purchase'),
    
    -- GAMING
    ('game_played', 'Game Played', 'gaming', 2, 50, 5, 'Play a game'),
    ('game_won', 'Game Won', 'gaming', 10, 20, 0, 'Win a game'),
    
    -- TERRITORY
    ('territory_visited', 'Territory Visited', 'engagement', 1, 20, 30, 'Visit a territory page'),
    ('territory_purchased', 'Territory Purchased', 'commerce', 1000, NULL, 0, 'Purchase a territory')
ON CONFLICT (activity_code) DO NOTHING;

-- ============================================================================
-- VISA MULTIPLIER TABLE (OPTIONAL BONUS FOR HIGHER TIERS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mb_visa_multipliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visa_id UUID NOT NULL REFERENCES visas(id),
    multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,  -- 1.00 = 100%, 1.50 = 150%
    
    UNIQUE(visa_id)
);

-- Default multipliers (higher tiers get bonus)
-- These will be populated when visas exist
-- Example: Gold VIP Founder gets 2.5x MB, Free gets 1.0x

-- ============================================================================
-- USER MB ACTIVITY LOG (TRACKS LIMITS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_mb_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_code VARCHAR(50) NOT NULL REFERENCES mb_earning_rates(activity_code),
    mb_earned BIGINT NOT NULL,
    
    -- For tracking limits
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for fast lookups
    CONSTRAINT idx_user_activity_date UNIQUE (user_id, activity_code, earned_at)
);

CREATE INDEX idx_mb_activity_user ON user_mb_activity_log(user_id);
CREATE INDEX idx_mb_activity_code ON user_mb_activity_log(activity_code);
CREATE INDEX idx_mb_activity_date ON user_mb_activity_log(earned_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE mb_earning_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mb_activity_log ENABLE ROW LEVEL SECURITY;

-- Everyone can read earning rates
CREATE POLICY "Anyone can view earning rates"
    ON mb_earning_rates FOR SELECT
    USING (true);

-- Users can view their own activity
CREATE POLICY "Users can view own MB activity"
    ON user_mb_activity_log FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role full access mb_earning_rates"
    ON mb_earning_rates FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access user_mb_activity_log"
    ON user_mb_activity_log FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTION: AWARD MB TO USER
-- ============================================================================

CREATE OR REPLACE FUNCTION award_megabucks(
    p_user_id UUID,
    p_activity_code VARCHAR(50)
)
RETURNS BIGINT AS $$  -- Returns MB awarded (0 if limit reached)
DECLARE
    v_rate RECORD;
    v_today_count INTEGER;
    v_month_count INTEGER;
    v_lifetime_count INTEGER;
    v_last_activity TIMESTAMPTZ;
    v_multiplier DECIMAL(3,2) := 1.00;
    v_final_mb BIGINT;
BEGIN
    -- Get the earning rate
    SELECT * INTO v_rate
    FROM mb_earning_rates
    WHERE activity_code = p_activity_code
      AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;  -- Activity not found or inactive
    END IF;
    
    -- Check daily limit
    IF v_rate.daily_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_today_count
        FROM user_mb_activity_log
        WHERE user_id = p_user_id
          AND activity_code = p_activity_code
          AND earned_at >= CURRENT_DATE;
        
        IF v_today_count >= v_rate.daily_limit THEN
            RETURN 0;  -- Daily limit reached
        END IF;
    END IF;
    
    -- Check cooldown
    IF v_rate.cooldown_minutes > 0 THEN
        SELECT MAX(earned_at) INTO v_last_activity
        FROM user_mb_activity_log
        WHERE user_id = p_user_id
          AND activity_code = p_activity_code;
        
        IF v_last_activity IS NOT NULL AND 
           v_last_activity > (NOW() - (v_rate.cooldown_minutes || ' minutes')::INTERVAL) THEN
            RETURN 0;  -- Still in cooldown
        END IF;
    END IF;
    
    -- Get visa multiplier if applicable
    IF v_rate.applies_multiplier THEN
        SELECT COALESCE(m.multiplier, 1.00) INTO v_multiplier
        FROM user_wallets w
        LEFT JOIN mb_visa_multipliers m ON w.current_visa_id = m.visa_id
        WHERE w.user_id = p_user_id;
    END IF;
    
    -- Calculate final MB
    v_final_mb := FLOOR(v_rate.mb_reward * v_multiplier);
    
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
