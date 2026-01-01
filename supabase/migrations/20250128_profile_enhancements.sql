-- ============================================================================
-- PROFILE ENHANCEMENTS - Badges, Achievements, Privacy, Hall of Fame
-- ============================================================================

-- ============================================================================
-- 1. BADGES TABLE - Badge Definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Badge Identity
    badge_key VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'first_recruit', 'century_club'
    name VARCHAR(200) NOT NULL,                     -- Display name
    description TEXT,
    category VARCHAR(50) NOT NULL,                  -- 'recruitment', 'earning', 'activity', 'social', 'special'
    
    -- Rarity & Display
    rarity VARCHAR(20) DEFAULT 'common',            -- 'common', 'rare', 'epic', 'legendary'
    icon_emoji VARCHAR(10),                         -- Emoji placeholder (MVP)
    icon_url TEXT,                                  -- PNG/image URL (production)
    badge_color VARCHAR(7) DEFAULT '#6B7280',       -- Hex color
    
    -- Unlock Criteria (JSON for flexibility)
    unlock_criteria JSONB NOT NULL,                 -- e.g., {"community_referrals": {"gte": 10}}
    
    -- Rewards
    mb_reward DECIMAL(10,2) DEFAULT 0,              -- MegaBucks bonus
    access_perks JSONB,                             -- Array of perks unlocked
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_active ON badges(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 2. USER_BADGES TABLE - User's Earned Badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    
    -- Earned details
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,                -- Show on profile header
    is_public BOOLEAN DEFAULT TRUE,                 -- Visible to others
    pin_order INTEGER,                              -- Order in pinned badges (1-3)
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_pinned ON user_badges(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_user_badges_public ON user_badges(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- 3. ACHIEVEMENTS TABLE - Track Progress Towards Badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,         -- 'community_referrals', 'total_earnings', etc.
    
    -- Progress tracking
    current_value DECIMAL(12,2) DEFAULT 0,
    milestone_value DECIMAL(12,2),                  -- Next milestone
    
    -- Timestamps
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

-- ============================================================================
-- 4. PROFILE_PRIVACY TABLE - Control Layout Visibility
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_privacy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Layout visibility
    layout_cards_public BOOLEAN DEFAULT TRUE,
    layout_twitter_public BOOLEAN DEFAULT TRUE,
    layout_instagram_public BOOLEAN DEFAULT TRUE,
    layout_linkedin_public BOOLEAN DEFAULT TRUE,
    layout_facebook_public BOOLEAN DEFAULT TRUE,
    layout_tiktok_public BOOLEAN DEFAULT TRUE,
    layout_youtube_public BOOLEAN DEFAULT TRUE,
    
    -- Profile sections visibility
    show_badges BOOLEAN DEFAULT TRUE,
    show_community_stats BOOLEAN DEFAULT TRUE,
    show_bragging_rights BOOLEAN DEFAULT TRUE,
    show_wallet_overview BOOLEAN DEFAULT FALSE,     -- Default private
    show_visa_tier BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_profile_privacy_user ON profile_privacy(user_id);

-- ============================================================================
-- 5. HALL_OF_FAME TABLE - Leaderboards & Top Performers
-- ============================================================================
CREATE TABLE IF NOT EXISTS hall_of_fame (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    category VARCHAR(50) NOT NULL,                  -- 'top_recruiters', 'top_earners', 'fastest_growth', etc.
    period VARCHAR(20) NOT NULL,                    -- 'daily', 'weekly', 'monthly', 'all_time'
    
    -- Rankings (Top 100)
    rankings JSONB NOT NULL,                        -- [{user_id, rank, score, display_name}]
    
    -- Metadata
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category, period, period_start)
);

CREATE INDEX idx_hall_of_fame_category ON hall_of_fame(category, period);
CREATE INDEX idx_hall_of_fame_updated ON hall_of_fame(last_updated DESC);

-- ============================================================================
-- 6. EXTEND PROFILES TABLE - Add Missing Columns
-- ============================================================================
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS visa_tier VARCHAR(50),
    ADD COLUMN IF NOT EXISTS community_referrals INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bragging_title VARCHAR(100),           -- Custom title earned
    ADD COLUMN IF NOT EXISTS matrix_power_score INTEGER DEFAULT 0;  -- Composite score

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Everyone can view active badges
CREATE POLICY "Badges are publicly viewable"
    ON badges FOR SELECT
    USING (is_active = TRUE);

-- Users can view their own badges and public badges of others
CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

-- Users can only modify their own badges
CREATE POLICY "Users can update own badges"
    ON user_badges FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view and update their privacy settings
CREATE POLICY "Users control own privacy"
    ON profile_privacy FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- Hall of Fame is publicly viewable
CREATE POLICY "Hall of Fame is public"
    ON hall_of_fame FOR SELECT
    USING (TRUE);

-- ============================================================================
-- 8. SEED DATA - Initial Badges (MVP Set with Emojis)
-- ============================================================================

-- Recruitment Badges
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
('first_recruit', 'First Volunteer', 'Welcome your first community member!', 'recruitment', 'common', '🎯', '{"community_referrals": {"gte": 1}}', 50, '["Early Starter Title"]'),
('team_of_5', 'Team Builder', 'Build a fabric of 5 volunteers', 'recruitment', 'common', '👥', '{"community_referrals": {"gte": 5}}', 100, '["Community Builder Title"]'),
('team_of_10', 'Community Leader', 'Lead a community of 10 members', 'recruitment', 'rare', '🏆', '{"community_referrals": {"gte": 10}}', 250, '["Priority Support Access"]'),
('team_of_25', 'Fabric Weaver', 'Weave a strong fabric of 25 volunteers', 'recruitment', 'rare', '🌟', '{"community_referrals": {"gte": 25}}', 500, '["Exclusive Badge Frame"]'),
('team_of_50', 'Community Champion', 'Champion of 50 community members', 'recruitment', 'epic', '👑', '{"community_referrals": {"gte": 50}}', 1000, '["VIP Chat Access", "Custom Profile Color"]'),
('century_club', 'Century Club', 'The prestigious 100-member milestone', 'recruitment', 'legendary', '💎', '{"community_referrals": {"gte": 100}}', 5000, '["Century Club Title", "Verified Badge", "Exclusive Events"]');

-- Earning Badges
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
('first_100', 'First £100', 'Your first £100 in earnings!', 'earning', 'common', '💰', '{"total_earnings": {"gte": 100}}', 25),
('first_500', '£500 Milestone', 'Reached £500 in total earnings', 'earning', 'common', '💷', '{"total_earnings": {"gte": 500}}', 50),
('first_1k', '£1K Earner', 'Earned your first £1,000!', 'earning', 'rare', '💸', '{"total_earnings": {"gte": 1000}}', 100),
('first_5k', '£5K Club', 'Member of the £5,000 earnings club', 'earning', 'epic', '💎', '{"total_earnings": {"gte": 5000}}', 500),
('first_10k', '£10K Legend', 'Legendary £10,000 earnings achieved!', 'earning', 'legendary', '🏅', '{"total_earnings": {"gte": 10000}}', 1000);

-- Activity Badges
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
('week_streak', '7-Day Streak', 'Logged in for 7 consecutive days', 'activity', 'common', '🔥', '{"consecutive_login_days": {"gte": 7}}', 50),
('month_streak', '30-Day Dedication', 'Logged in for 30 consecutive days!', 'activity', 'rare', '⚡', '{"consecutive_login_days": {"gte": 30}}', 250),
('year_streak', 'Year of Commitment', '365 days of consecutive logins!!!', 'activity', 'legendary', '🎖️', '{"consecutive_login_days": {"gte": 365}}', 5000);

-- VISA Tier Badges (Auto-awarded)
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
('visa_free', 'Free Tier', 'Welcome to MegaVXWorld!', 'visa', 'common', '🆓', '{"visa_tier": {"eq": "Free"}}', 0),
('visa_novice', 'Novice Tier', 'Upgraded to Novice!', 'visa', 'common', '🌱', '{"visa_tier": {"eq": "Novice"}}', 50),
('visa_city_dweller', 'City Dweller', 'City Dweller tier achieved', 'visa', 'common', '🏙️', '{"visa_tier": {"eq": "City Dweller"}}', 100),
('visa_city_patron', 'City Patron', 'City Patron status', 'visa', 'rare', '🏛️', '{"visa_tier": {"eq": "City Patron"}}', 150),
('visa_executive', 'Executive', 'Executive tier unlocked', 'visa', 'rare', '💼', '{"visa_tier": {"eq": "Executive"}}', 200),
('visa_ambassador', 'Ambassador', 'Ambassador status achieved', 'visa', 'epic', '🌍', '{"visa_tier": {"eq": "Ambassador"}}', 300),
('visa_premiere', 'Premiere', 'Premiere tier member', 'visa', 'epic', '⭐', '{"visa_tier": {"eq": "Premiere"}}', 500),
('visa_gold_premiere', 'Gold Premiere', 'Gold Premiere status', 'visa', 'epic', '🥇', '{"visa_tier": {"eq": "Gold Premiere"}}', 750),
('visa_vip_founder', 'VIP Founder', 'VIP Founder - Elite Status', 'visa', 'legendary', '👑', '{"visa_tier": {"eq": "VIP Founder"}}', 1500),
('visa_gold_vip_founder', 'Gold VIP Founder', 'The Ultimate - Gold VIP Founder', 'visa', 'legendary', '💎', '{"visa_tier": {"eq": "Gold VIP Founder"}}', 2500);

-- Special Badges
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
('founding_member', 'Founding Member', 'Pre-launch pioneer - Thank you!', 'special', 'legendary', '🚀', '{"is_prelaunch": {"eq": true}}', 1000, '["Founding Member Title", "Exclusive Founding Badge Frame", "Lifetime Priority Support"]'),
('day_1_elite', 'Day 1 Elite', 'Joined on launch day!', 'special', 'epic', '🎉', '{"joined_on_launch_day": {"eq": true}}', 500, '["Day 1 Title"]');

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_id UUID, badge_name VARCHAR) AS $$
DECLARE
    v_badge RECORD;
    v_user_stats RECORD;
    v_awarded_badge_id UUID;
BEGIN
    -- Get user's current stats
    SELECT 
        community_referrals,
        total_earnings,
        consecutive_login_days,
        visa_tier
    INTO v_user_stats
    FROM profiles
    WHERE id = p_user_id;
    
    -- Loop through all active badges
    FOR v_badge IN 
        SELECT * FROM badges WHERE is_active = TRUE
    LOOP
        -- Check if user already has this badge
        IF NOT EXISTS (
            SELECT 1 FROM user_badges 
            WHERE user_id = p_user_id AND badge_id = v_badge.id
        ) THEN
            -- Check unlock criteria (simplified - expand based on JSON structure)
            DECLARE
                v_should_award BOOLEAN := FALSE;
            BEGIN
                -- Community referrals check
                IF v_badge.unlock_criteria ? 'community_referrals' THEN
                    IF v_user_stats.community_referrals >= 
                       (v_badge.unlock_criteria->'community_referrals'->>'gte')::INTEGER THEN
                        v_should_award := TRUE;
                    END IF;
                END IF;
                
                -- Total earnings check
                IF v_badge.unlock_criteria ? 'total_earnings' THEN
                    IF v_user_stats.total_earnings >= 
                       (v_badge.unlock_criteria->'total_earnings'->>'gte')::DECIMAL THEN
                        v_should_award := TRUE;
                    END IF;
                END IF;
                
                -- Login streak check
                IF v_badge.unlock_criteria ? 'consecutive_login_days' THEN
                    IF v_user_stats.consecutive_login_days >= 
                       (v_badge.unlock_criteria->'consecutive_login_days'->>'gte')::INTEGER THEN
                        v_should_award := TRUE;
                    END IF;
                END IF;
                
                -- VISA tier check
                IF v_badge.unlock_criteria ? 'visa_tier' THEN
                    IF v_user_stats.visa_tier = 
                       (v_badge.unlock_criteria->'visa_tier'->>'eq') THEN
                        v_should_award := TRUE;
                    END IF;
                END IF;
                
                -- Award badge if criteria met
                IF v_should_award THEN
                    INSERT INTO user_badges (user_id, badge_id)
                    VALUES (p_user_id, v_badge.id)
                    RETURNING badge_id INTO v_awarded_badge_id;
                    
                    -- Return awarded badge
                    RETURN QUERY SELECT v_badge.id, v_badge.name::VARCHAR;
                END IF;
            END;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update user achievements
CREATE OR REPLACE FUNCTION update_achievement(
    p_user_id UUID,
    p_achievement_type VARCHAR,
    p_new_value DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO achievements (user_id, achievement_type, current_value)
    VALUES (p_user_id, p_achievement_type, p_new_value)
    ON CONFLICT (user_id, achievement_type)
    DO UPDATE SET 
        current_value = p_new_value,
        last_updated = NOW();
        
    -- Check for new badges
    PERFORM check_and_award_badges(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
