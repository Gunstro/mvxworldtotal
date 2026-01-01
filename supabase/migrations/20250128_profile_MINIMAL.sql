-- ============================================================================
-- PROFILE ENHANCEMENTS - MINIMAL VERSION
-- ============================================================================

-- 1. CREATE TABLES
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common',
    icon_emoji VARCHAR(10),
    unlock_criteria JSONB NOT NULL,
    mb_reward DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- 2. EXTEND PROFILES TABLE
DO $$ 
BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visa_tier VARCHAR(50);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_referrals INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bragging_title VARCHAR(100);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. ENABLE RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (with OR REPLACE to avoid conflicts)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "badges_public_read" ON badges;
    DROP POLICY IF EXISTS "user_badges_read" ON user_badges;
    DROP POLICY IF EXISTS "achievements_read" ON achievements;
END $$;

-- Create new policies
CREATE POLICY "badges_public_read" ON badges
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "user_badges_read" ON user_badges
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = TRUE
    );

CREATE POLICY "achievements_read" ON achievements
    FOR SELECT USING (user_id = auth.uid());

-- 5. INSERT SAMPLE BADGES
INSERT INTO badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) 
VALUES 
    ('first_recruit', 'First Volunteer', 'Welcome your first community member!', 'recruitment', 'common', '🎯', '{"community_referrals": {"gte": 1}}', 50),
    ('team_of_10', 'Community Leader', 'Lead a community of 10 members', 'recruitment', 'rare', '🏆', '{"community_referrals": {"gte": 10}}', 250),
    ('first_1k', '£1K Earner', 'Earned your first £1,000!', 'earning', 'rare', '💸', '{"total_earnings": {"gte": 1000}}', 100),
    ('week_streak', '7-Day Streak', 'Logged in for 7 consecutive days', 'activity', 'common', '🔥', '{"consecutive_login_days": {"gte": 7}}', 50)
ON CONFLICT (badge_key) DO NOTHING;

-- SUCCESS MESSAGE
DO $$ 
BEGIN
    RAISE NOTICE 'Profile enhancements migration completed successfully!';
END $$;
