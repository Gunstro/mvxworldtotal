-- ============================================================================
-- DISABLE AUTO-ASSIGN FREE VISA TRIGGER
-- ============================================================================
-- This prevents the automatic Free VISA assignment so users can choose their VISA
-- ============================================================================

-- Drop the trigger that auto-assigns free visa
DROP TRIGGER IF EXISTS on_profile_created_assign_visa ON profiles;

-- Verify it's gone
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_profile_created_assign_visa';

-- Success message
SELECT '✅ Auto-assign Free VISA trigger disabled! Users can now choose their VISA!' as status;
