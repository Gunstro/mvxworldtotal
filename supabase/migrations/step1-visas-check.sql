-- ============================================================================
-- MEGAMATRIX - ADD MISSING COLUMNS TO VISAS TABLE
-- ============================================================================
-- Run this BEFORE the main megamatrix-phase1-schema.sql
-- ============================================================================

-- Add missing columns to visas table
ALTER TABLE visas ADD COLUMN IF NOT EXISTS matrix_level INTEGER DEFAULT 3;
ALTER TABLE visas ADD COLUMN IF NOT EXISTS auto_upgrade_threshold DECIMAL(10,2) DEFAULT 0;
ALTER TABLE visas ADD COLUMN IF NOT EXISTS next_visa_id UUID REFERENCES visas(id);

-- Update matrix levels based on existing level column
-- Level 1 = Founders (matrix_level 1)
-- Level 2 = Premiere (matrix_level 2)  
-- Level 3 = Standard (matrix_level 3+)
UPDATE visas SET matrix_level = level WHERE matrix_level IS NULL OR matrix_level = 3;

-- Update auto-upgrade thresholds based on visa type
UPDATE visas SET auto_upgrade_threshold = 95 WHERE visa_type = 'Free';
UPDATE visas SET auto_upgrade_threshold = 195 WHERE visa_type = 'Novice';
UPDATE visas SET auto_upgrade_threshold = 295 WHERE visa_type = 'City Dweller';
UPDATE visas SET auto_upgrade_threshold = 395 WHERE visa_type = 'City Patron';
UPDATE visas SET auto_upgrade_threshold = 495 WHERE visa_type = 'Executive';
UPDATE visas SET auto_upgrade_threshold = 795 WHERE visa_type = 'Ambassador';
UPDATE visas SET auto_upgrade_threshold = 895 WHERE visa_type = 'Premiere';
UPDATE visas SET auto_upgrade_threshold = 1950 WHERE visa_type = 'Gold Premiere';
UPDATE visas SET auto_upgrade_threshold = 2750 WHERE visa_type ILIKE '%VIP%' AND level = 1;
UPDATE visas SET auto_upgrade_threshold = 0 WHERE visa_type ILIKE '%Gold VIP Founder%'; -- MAX TIER

-- Verify the update
SELECT visa_type, level, matrix_level, auto_upgrade_threshold, price, income_cap 
FROM visas 
ORDER BY v_no;
