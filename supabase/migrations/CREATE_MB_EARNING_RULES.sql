-- ============================================================================
-- MEGABUCKS (MB) EARNING RULES SYSTEM
-- ============================================================================
-- Configurable table for all MB earning events
-- Easily add/modify earning amounts without code changes
-- ============================================================================

-- ============================================================================
-- TABLE: mb_earning_rules
-- ============================================================================
-- Defines all the ways users can earn MegaBucks
-- Amounts can be adjusted by admin without deployment

CREATE TABLE IF NOT EXISTS mb_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule identification
    rule_code VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'SIGNUP_BONUS', 'DAILY_LOGIN'
    rule_name VARCHAR(100) NOT NULL,         -- Display name
    description TEXT,                         -- What this earning is for
    
    -- Earning configuration
    mb_amount INTEGER NOT NULL DEFAULT 0,    -- Amount of MB to award
    
    -- Limits (optional)
    daily_limit INTEGER,                     -- Max times per day (NULL = unlimited)
    weekly_limit INTEGER,                    -- Max times per week
    monthly_limit INTEGER,                   -- Max times per month
    lifetime_limit INTEGER,                  -- Max times ever
    
    -- Requirements
    min_visa_level INTEGER DEFAULT 0,        -- Minimum VISA level required (0 = all)
    requires_verified BOOLEAN DEFAULT FALSE, -- Must be verified user
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INSERT DEFAULT MB EARNING RULES
-- ============================================================================

INSERT INTO mb_earning_rules (rule_code, rule_name, description, mb_amount, daily_limit, lifetime_limit) VALUES
    -- Onboarding & Account
    ('SIGNUP_BONUS', 'Signup Bonus', 'Awarded when user creates account', 100, NULL, 1),
    ('PROFILE_COMPLETE', 'Profile Completion', 'Complete your profile (avatar, bio, etc.)', 50, NULL, 1),
    ('EMAIL_VERIFIED', 'Email Verified', 'Verify your email address', 25, NULL, 1),
    ('PHONE_VERIFIED', 'Phone Verified', 'Verify your phone number', 50, NULL, 1),
    
    -- Daily Engagement
    ('DAILY_LOGIN', 'Daily Login', 'Login once per day', 5, 1, NULL),
    ('CONSECUTIVE_LOGIN_3', 'Login Streak (3 Days)', 'Login 3 consecutive days', 15, NULL, NULL),
    ('CONSECUTIVE_LOGIN_7', 'Login Streak (7 Days)', 'Login 7 consecutive days', 50, NULL, NULL),
    ('CONSECUTIVE_LOGIN_30', 'Login Streak (30 Days)', 'Login 30 consecutive days', 200, NULL, NULL),
    
    -- Content Creation
    ('CREATE_POST', 'Create Post', 'Create a new post', 2, 10, NULL),
    ('CREATE_STORY', 'Create Story', 'Share a story', 3, 5, NULL),
    ('UPLOAD_PHOTO', 'Upload Photo', 'Upload a photo to your gallery', 1, 20, NULL),
    ('UPLOAD_VIDEO', 'Upload Video', 'Upload a video', 5, 5, NULL),
    
    -- Social Engagement
    ('RECEIVE_LIKE', 'Receive Like', 'Someone liked your content', 1, 100, NULL),
    ('RECEIVE_COMMENT', 'Receive Comment', 'Someone commented on your content', 2, 50, NULL),
    ('RECEIVE_SHARE', 'Content Shared', 'Someone shared your content', 5, 20, NULL),
    ('RECEIVE_FOLLOW', 'New Follower', 'Someone followed you', 3, 50, NULL),
    
    -- Referrals & Recruitment
    ('REFERRAL_SIGNUP', 'Referral Signup', 'Someone you referred signed up', 50, NULL, NULL),
    ('REFERRAL_VISA_PURCHASE', 'Referral VISA Purchase', 'Your referral purchased a VISA', 100, NULL, NULL),
    
    -- Community & Achievements
    ('JOIN_COMMUNITY', 'Join Community', 'Join a community group', 10, 5, NULL),
    ('CREATE_COMMUNITY', 'Create Community', 'Create a new community', 100, NULL, 5),
    ('FIRST_POST_OF_DAY', 'First Post of Day', 'Be the first to post today', 10, 1, NULL),
    
    -- Special Events (admin can activate)
    ('HOLIDAY_BONUS', 'Holiday Bonus', 'Special holiday bonus', 500, NULL, NULL),
    ('PROMOTIONAL_BONUS', 'Promotional Bonus', 'Limited time promotional bonus', 1000, NULL, NULL)
    
ON CONFLICT (rule_code) DO UPDATE SET
    mb_amount = EXCLUDED.mb_amount,
    updated_at = NOW();

-- ============================================================================
-- TABLE: mb_earning_history
-- ============================================================================
-- Tracks all MB earnings for each user

CREATE TABLE IF NOT EXISTS mb_earning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES mb_earning_rules(id),
    rule_code VARCHAR(50) NOT NULL,          -- Denormalized for quick queries
    mb_amount INTEGER NOT NULL,
    description TEXT,                         -- Optional context (e.g., "Post #123")
    reference_id UUID,                        -- Optional reference to related entity
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mb_earning_user ON mb_earning_history(user_id);
CREATE INDEX idx_mb_earning_rule ON mb_earning_history(rule_code);
CREATE INDEX idx_mb_earning_date ON mb_earning_history(created_at);

-- ============================================================================
-- FUNCTION: award_megabucks
-- ============================================================================
-- Call this function to award MB to a user based on a rule

CREATE OR REPLACE FUNCTION award_megabucks(
    p_user_id UUID,
    p_rule_code VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    mb_awarded INTEGER,
    message TEXT
) AS $$
DECLARE
    v_rule RECORD;
    v_today_count INTEGER;
    v_week_count INTEGER;
    v_month_count INTEGER;
    v_lifetime_count INTEGER;
BEGIN
    -- Get the rule
    SELECT * INTO v_rule FROM mb_earning_rules WHERE rule_code = p_rule_code AND is_active = TRUE;
    
    IF v_rule IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'Rule not found or inactive'::TEXT;
        RETURN;
    END IF;
    
    -- Check daily limit
    IF v_rule.daily_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_today_count
        FROM mb_earning_history
        WHERE user_id = p_user_id 
          AND rule_code = p_rule_code
          AND created_at >= CURRENT_DATE;
        
        IF v_today_count >= v_rule.daily_limit THEN
            RETURN QUERY SELECT FALSE, 0, 'Daily limit reached'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Check weekly limit
    IF v_rule.weekly_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_week_count
        FROM mb_earning_history
        WHERE user_id = p_user_id 
          AND rule_code = p_rule_code
          AND created_at >= DATE_TRUNC('week', CURRENT_DATE);
        
        IF v_week_count >= v_rule.weekly_limit THEN
            RETURN QUERY SELECT FALSE, 0, 'Weekly limit reached'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Check lifetime limit
    IF v_rule.lifetime_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_lifetime_count
        FROM mb_earning_history
        WHERE user_id = p_user_id AND rule_code = p_rule_code;
        
        IF v_lifetime_count >= v_rule.lifetime_limit THEN
            RETURN QUERY SELECT FALSE, 0, 'Lifetime limit reached'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Record the earning
    INSERT INTO mb_earning_history (user_id, rule_id, rule_code, mb_amount, description, reference_id)
    VALUES (p_user_id, v_rule.id, p_rule_code, v_rule.mb_amount, p_description, p_reference_id);
    
    -- Update user's MB wallet
    UPDATE megabucks_wallets
    SET 
        balance = balance + v_rule.mb_amount,
        total_earned = total_earned + v_rule.mb_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- If wallet doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO megabucks_wallets (user_id, balance, total_earned)
        VALUES (p_user_id, v_rule.mb_amount, v_rule.mb_amount)
        ON CONFLICT (user_id) DO UPDATE SET
            balance = megabucks_wallets.balance + v_rule.mb_amount,
            total_earned = megabucks_wallets.total_earned + v_rule.mb_amount;
    END IF;
    
    RETURN QUERY SELECT TRUE, v_rule.mb_amount, ('Awarded ' || v_rule.mb_amount || ' MB for ' || v_rule.rule_name)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW CURRENT RULES
-- ============================================================================
SELECT 
    rule_code,
    rule_name,
    mb_amount || ' MB' as reward,
    COALESCE(daily_limit::TEXT, '∞') as daily_limit,
    COALESCE(lifetime_limit::TEXT, '∞') as lifetime_limit,
    CASE WHEN is_active THEN '✅' ELSE '❌' END as active
FROM mb_earning_rules
ORDER BY rule_code;
