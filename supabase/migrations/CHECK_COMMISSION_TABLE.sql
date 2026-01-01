-- ============================================================================
-- CHECK EXISTING COMMISSION_RATES TABLE
-- ============================================================================

-- Check if table exists and what columns it has
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'commission_rates'
ORDER BY ordinal_position;

-- If table exists, show its structure
SELECT 'Table structure above' as info;
