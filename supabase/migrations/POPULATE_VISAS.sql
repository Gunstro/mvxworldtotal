-- ============================================================================
-- FIX REGISTRATION - Populate VISAS Table
-- ============================================================================
-- This enables the registration form to work by providing VIS

A options
-- ============================================================================

-- Check if visas table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visas') THEN
        -- Create visas table if it doesn't exist
        CREATE TABLE IF NOT EXISTS visas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            visa_type VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            v_no INTEGER UNIQUE NOT NULL,
            price DECIMAL(10,2) DEFAULT 0,
            monthly_fee DECIMAL(10,2) DEFAULT 0,
            income_cap DECIMAL(12,2) DEFAULT 0,
            level INTEGER DEFAULT 1,
            available BOOLEAN DEFAULT TRUE,
            availability_limit INTEGER,
            positions_allocated INTEGER DEFAULT 0,
            lifetime BOOLEAN DEFAULT FALSE,
            upgradeable BOOLEAN DEFAULT TRUE,
            shares INTEGER DEFAULT 0,
            description TEXT,
            badge_color VARCHAR(20) DEFAULT 'gray',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Clear existing data
TRUNCATE TABLE visas;

-- Insert all 10 VISA tiers
INSERT INTO visas (v_no, visa_type, category, price, monthly_fee, income_cap, level, lifetime, shares, description, badge_color, is_active, available) VALUES
-- 1. FREE TIER
(1, 'Free', 'entry', 0.00, 0.00, 95.00, 1, false, 0, 
 'Entry level - Perfect to get started!', 'gray', true, true),

-- 2. NOVICE
(2, 'Novice', 'basic', 95.00, 95.00, 295.00, 2, false, 0,
 'Build your foundation', 'slate', true, true),

-- 3. CITY DWELLER
(3, 'City Dweller', 'standard', 195.00, 195.00, 395.00, 3, false, 0,
 'Explore the community', 'cyan', true, true),

-- 4. CITY PATRON
(4, 'City Patron', 'premium', 295.00, 295.00, 495.00, 4, false, 0,
 'Support the community', 'teal', true, true),

-- 5. EXECUTIVE
(5, 'Executive', 'professional', 395.00, 395.00, 695.00, 5, false, 0,
 'Take charge of your success', 'indigo', true, true),

-- 6. AMBASSADOR
(6, 'Ambassador', 'elite', 495.00, 495.00, 985.00, 6, false, 2,
 'Represent MegaVX globally', 'blue', true, true),

-- 7. PREMIERE
(7, 'Premiere', 'vip', 795.00, 795.00, 1250.00, 7, false, 5,
 'Premium membership benefits', 'amber', true, true),

-- 8. GOLD PREMIERE
(8, 'Gold Premiere', 'vip_plus', 895.00, 895.00, 2250.00, 8, false, 10,
 'Gold-tier excellence', 'gold', true, true),

-- 9. VIP FOUNDER
(9, 'VIP Founder', 'founder', 1950.00, 1950.00, 3750.00, 9, true, 25,
 'VIP Founder - Lifetime benefits', 'purple', true, true),

-- 10. GOLD VIP FOUNDER
(10, 'Gold VIP Founder', 'ultimate', 2750.00, 2750.00, 999999.00, 10, true, 50,
 'The Ultimate - Gold VIP Founder with unlimited potential', 'gold', true, true);

-- Verify
SELECT 
    v_no,
    visa_type,
    price,
    monthly_fee,
    income_cap,
    lifetime,
    shares,
    badge_color
FROM visas
ORDER BY v_no;

-- Success!
SELECT '✅ VISAS table populated! Registration form should now work!' as status;
