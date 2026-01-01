-- ============================================================================
-- COMMISSION RATES & DISTRIBUTION SYSTEM
-- ============================================================================
-- Sets up the 5-level commission structure: 20%, 3%, 4%, 5%, 8% = 40% total
-- ============================================================================

-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS commission_rates CASCADE;

-- Create commission_rates table
CREATE TABLE commission_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_level INTEGER NOT NULL UNIQUE,
    commission_percentage DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_percentage CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
    CONSTRAINT valid_level CHECK (upline_level >= 1 AND upline_level <= 5)
);

-- Insert commission rates
INSERT INTO commission_rates (upline_level, commission_percentage, description)
VALUES 
    (1, 20.00, 'Direct Sponsor - 20%'),
    (2, 3.00, '2nd Level Up - 3%'),
    (3, 4.00, '3rd Level Up - 4%'),
    (4, 5.00, '4th Level Up - 5%'),
    (5, 8.00, '5th Level Up - 8%');

-- Verify rates
SELECT 
    upline_level as "Level",
    commission_percentage || '%' as "Commission",
    description as "Description"
FROM commission_rates
ORDER BY upline_level;

-- Calculate total
SELECT 
    SUM(commission_percentage) || '%' as "Total Commission to Upline"
FROM commission_rates;

SELECT '✅ Commission rates configured: 20% + 3% + 4% + 5% + 8% = 40% total' as status;

