-- ============================================================================
-- PROFILE ENHANCEMENTS - SUPER SIMPLE (No RLS Issues)
-- ============================================================================

-- 1. CREATE BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
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

-- 2. CREATE USER_BADGES TABLE  
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- 3. CREATE ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- 4. EXTEND PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visa_tier VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_referrals INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bragging_title VARCHAR(100);

-- 5. INSERT SAMPLE BADGES (with ON CONFLICT to avoid duplicates)
INSERT INTO public.badges (badge_key, name, description, category, rarity, icon_emoji, unlock_criteria, mb_reward) 
VALUES 
    ('first_recruit', 'First Volunteer', 'Welcome your first community member!', 'recruitment', 'common', '🎯', '{"community_referrals": {"gte": 1}}', 50),
    ('team_of_5', 'Team Builder', 'Build a fabric of 5 volunteers', 'recruitment', 'common', '👥', '{"community_referrals": {"gte": 5}}', 100),
    ('team_of_10', 'Community Leader', 'Lead a community of 10 members', 'recruitment', 'rare', '🏆', '{"community_referrals": {"gte": 10}}', 250),
    ('team_of_25', 'Fabric Weaver', 'Weave a strong fabric of 25 volunteers', 'recruitment', 'rare', '🌟', '{"community_referrals": {"gte": 25}}', 500),
    ('first_1k', '£1K Earner', 'Earned your first £1,000!', 'earning', 'rare', '💸', '{"total_earnings": {"gte": 1000}}', 100),
    ('week_streak', '7-Day Streak', 'Logged in for 7 consecutive days', 'activity', 'common', '🔥', '{"consecutive_login_days": {"gte": 7}}', 50)
ON CONFLICT (badge_key) DO NOTHING;

-- Done!
SELECT 'Migration completed successfully! Tables created and sample badges inserted.' AS status;
