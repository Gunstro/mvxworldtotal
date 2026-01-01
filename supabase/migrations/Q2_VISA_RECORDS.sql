-- ============================================================================
-- QUERY 2: VISA RECORDS
-- ============================================================================
SELECT 
    v_no,
    visa_type,
    price,
    monthly_fee,
    income_cap,
    is_active,
    available
FROM visas
ORDER BY v_no;
