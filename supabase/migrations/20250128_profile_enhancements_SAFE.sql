-- ============================================================================
-- PROFILE ENHANCEMENTS - SAFE VERSION (Checks for existing objects)
-- ============================================================================

-- ============================================================================
-- 1. BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common',
    icon_emoji VARCHAR(10),
    icon_url TEXT,
    badge_color VARCHAR(7) DEFAULT '#6B7280',
    unlock_criteria JSONB NOT NULL,
    mb_reward DECIMAL(10,2) DEFAULT 0,
    access_perks JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 2. USER_BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    pin_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_pinned ON user_badges(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_badges_public ON user_badges(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- 3. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    milestone_value DECIMAL(12,2),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- ============================================================================
-- 4. PROFILE_PRIVACY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_privacy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    layout_cards_public BOOLEAN DEFAULT TRUE,
    layout_twitter_public BOOLEAN DEFAULT TRUE,
    layout_instagram_public BOOLEAN DEFAULT TRUE,
    layout_linkedin_public BOOLEAN DEFAULT TRUE,
    layout_facebook_public BOOLEAN DEFAULT TRUE,
    layout_tiktok_public BOOLEAN DEFAULT TRUE,
    layout_youtube_public BOOLEAN DEFAULT TRUE,
    show_badges BOOLEAN DEFAULT TRUE,
    show_community_stats BOOLEAN DEFAULT TRUE,
    show_bragging_rights BOOLEAN DEFAULT TRUE,
    show_wallet_overview BOOLEAN DEFAULT FALSE,
    show_visa_tier BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_privacy_user ON profile_privacy(user_id);

-- ============================================================================
-- 5. HALL_OF_FAME TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hall_of_fame (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    period VARCHAR(20) NOT NULL,
    rankings JSONB NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, period, period_start)
);

CREATE INDEX IF NOT EXISTS idx_hall_of_fame_category ON hall_of_fame(category, period);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_updated ON hall_of_fame(last_updated DESC);

-- ============================================================================
-- 6. EXTEND PROFILES TABLE
-- ============================================================================
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS visa_tier VARCHAR(50),
    ADD COLUMN IF NOT EXISTS community_referrals INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bragging_title VARCHAR(100),
    ADD COLUMN IF NOT EXISTS matrix_power_score INTEGER DEFAULT 0;

-- ============================================================================
-- 7. ENABLE RLS
-- ============================================================================
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- Badges: Everyone can view active badges
CREATE POLICY "Badges are publicly viewable"
    ON badges FOR SELECT
    USING (is_active = TRUE);

-- User Badges: View own or public badges
CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can update own badges"
    ON user_badges FOR UPDATE
    USING (auth.uid() = user_id);

-- Achievements: Users can view their own
CREATE POLICY "Users can view own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

-- Profile Privacy: Users control their own
CREATE POLICY "Users control own privacy"
    ON profile_privacy FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Hall of Fame: Publicly viewable
CREATE POLICY "Hall of Fame is public"
    ON hall_of_fame FOR SELECT
    USING (TRUE);

-- ============================================================================
-- 9. SEED DATA (Only insert if not exists)
-- ============================================================================

-- Function to safely insert badges
DO $$
BEGIN
    -- Recruitment Badges
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('first_recruit', 'First Volunteer', 'Welcome your first community member!', 'recruitment', 'common', '🎯', '{"community_referrals": {"gte": 1}}', 50, '["Early Starter Title"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('team_of_5', 'Team Builder', 'Build a fabric of 5 volunteers', 'recruitment', 'common', '👥', '{"community_referrals": {"gte": 5}}', 100, '["Community Builder Title"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('team_of_10', 'Community Leader', 'Lead a community of 10 members', 'recruitment', 'rare', '🏆', '{"community_referrals": {"gte": 10}}', 250, '["Priority Support Access"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('team_of_25', 'Fabric Weaver', 'Weave a strong fabric of 25 volunteers', 'recruitment', 'rare', '🌟', '{"community_referrals": {"gte": 25}}', 500, '["Exclusive Badge Frame"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('team_of_50', 'Community Champion', 'Champion of 50 community members', 'recruitment', 'epic', '👑', '{"community_referrals": {"gte": 50}}', 1000, '["VIP Chat Access", "Custom Profile Color"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('century_club', 'Century Club', 'The prestigious 100-member milestone', 'recruitment', 'legendary', '💎', '{"community_referrals": {"gte": 100}}', 5000, '["Century Club Title", "Verified Badge", "Exclusive Events"]')
    ON CONFLICT (badge_key) DO NOTHING;

    -- Earning Badges
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
    ('first_100', 'First £100', 'Your first £100 in earnings!', 'earning', 'common', '💰', '{"total_earnings": {"gte": 100}}', 25)
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
    ('first_500', '£500 Milestone', 'Reached £500 in total earnings', 'earning', 'common', '💷', '{"total_earnings": {"gte": 500}}', 50)
    ON CONFLICT (badge_key) DO NOTHING;
    
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
    ('first_1k', '£1K Earner', 'Earned your first £1,000!', 'earning', 'rare', '💸', '{"total_earnings": {"gte": 1000}}', 100)
    ON CONFLICT (badge_key) DO NOTHING;
    
    -- Activity Badges
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
    ('week_streak', '7-Day Streak', 'Logged in for 7 consecutive days', 'activity', 'common', '🔥', '{"consecutive_login_days": {"gte": 7}}', 50)
    ON CONFLICT (badge_key) DO NOTHING;
    
    -- VISA Badges
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) VALUES
    ('visa_gold_vip_founder', 'Gold VIP Founder', 'The Ultimate - Gold VIP Founder', 'visa', 'legendary', '💎', '{"visa_tier": {"eq": "Gold VIP Founder"}}', 2500)
    ON CONFLICT (badge_key) DO NOTHING;

    -- Special Badges
    INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward, access_perks) VALUES
    ('founding_member', 'Founding Member', 'Pre-launch pioneer - Thank you!', 'special', 'legendary', '🚀', '{"is_prelaunch": {"eq": true}}', 1000, '["Founding Member Title", "Exclusive Founding Badge Frame", "Lifetime Priority Support"]')
    ON CONFLICT (badge_key) DO NOTHING;
    
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
