-- ============================================================================
-- STEP 1: ADD READABLE POSITION COLUMNS
-- ============================================================================
-- Non-breaking change: adds new columns without removing existing ones
-- ============================================================================

-- Add new columns for readable positions
ALTER TABLE matrix_positions
ADD COLUMN IF NOT EXISTS readable_position VARCHAR(20),
ADD COLUMN IF NOT EXISTS level_depth INTEGER,
ADD COLUMN IF NOT EXISTS level_position BIGINT;

-- Create index for fast position lookups
CREATE INDEX IF NOT EXISTS idx_matrix_readable_position 
    ON matrix_positions(level_depth, level_position);

-- Create unique constraint to prevent duplicate positions
ALTER TABLE matrix_positions
DROP CONSTRAINT IF EXISTS unique_readable_position;

ALTER TABLE matrix_positions
ADD CONSTRAINT unique_readable_position 
    UNIQUE(level_depth, level_position);

-- Verify columns added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'matrix_positions'
  AND column_name IN ('readable_position', 'level_depth', 'level_position')
ORDER BY column_name;

-- Success message
SELECT '✅ Step 1 Complete: Columns added to matrix_positions' as status;
