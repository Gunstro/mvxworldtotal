-- ============================================================================
-- AUTOMATIC VISA PURCHASE COMMISSION TRIGGER
-- ============================================================================
-- Automatically distributes commissions when a visa is purchased
-- ============================================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION trigger_distribute_commission()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger on visa purchase/upgrade
    IF NEW.status = 'completed' AND NEW.transaction_type = 'visa_purchase' THEN
        -- Distribute commissions
        PERFORM distribute_visa_commission(
            NEW.user_id,
            NEW.amount,
            NEW.id
        );
        
        RAISE NOTICE 'Commission distributed for visa purchase: % by user %', NEW.id, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if visa_purchases table exists, create trigger
DO $$
BEGIN
    -- Create trigger on visa_purchases table (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visa_purchases') THEN
        DROP TRIGGER IF EXISTS auto_distribute_commission ON visa_purchases;
        CREATE TRIGGER auto_distribute_commission
            AFTER INSERT OR UPDATE ON visa_purchases
            FOR EACH ROW
            EXECUTE FUNCTION trigger_distribute_commission();
        RAISE NOTICE '✅ Trigger created on visa_purchases table';
    ELSE
        RAISE NOTICE '⚠️ visa_purchases table not found - trigger not created';
    END IF;
END $$;

-- Alternative: Create trigger on a transactions table if that's what you use
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        DROP TRIGGER IF EXISTS auto_distribute_commission ON transactions;
        CREATE TRIGGER auto_distribute_commission
            AFTER INSERT OR UPDATE ON transactions
            FOR EACH ROW
            WHEN (NEW.transaction_type = 'visa_purchase' AND NEW.status = 'completed')
            EXECUTE FUNCTION trigger_distribute_commission();
        RAISE NOTICE '✅ Trigger created on transactions table';
    END IF;
END $$;

SELECT '✅ Commission distribution trigger function created' as status;
