-- ============================================================================
-- DUAL-SYSTEM VISA MANAGEMENT
-- ============================================================================
-- user_visas = Source of Truth (fees, earnings, history)
-- profiles.visa_id = Cached copy (fast lookups)
-- Trigger keeps them in sync automatically
-- ============================================================================

-- STEP 1: Create trigger function to sync user_visas → profiles.visa_id
CREATE OR REPLACE FUNCTION sync_visa_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When user_visa is inserted or updated, sync to profiles.visa_id
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE profiles
        SET visa_id = NEW.visa_id,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    -- When user_visa is deleted, clear profiles.visa_id
    IF (TG_OP = 'DELETE') THEN
        UPDATE profiles
        SET visa_id = NULL,
            updated_at = NOW()
        WHERE id = OLD.user_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- STEP 2: Create trigger on user_visas table
DROP TRIGGER IF EXISTS sync_visa_to_profile_trigger ON user_visas;

CREATE TRIGGER sync_visa_to_profile_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_visas
FOR EACH ROW
EXECUTE FUNCTION sync_visa_to_profile();

-- STEP 3: Sync all existing user_visas to profiles.visa_id
UPDATE profiles p
SET visa_id = uv.visa_id,
    updated_at = NOW()
FROM user_visas uv
WHERE p.id = uv.user_id
  AND (p.visa_id IS NULL OR p.visa_id != uv.visa_id);

-- STEP 4: Verify sync worked
SELECT 
    p.username,
    p.email,
    v_profile.visa_type as profile_visa,
    v_user_visa.visa_type as user_visa_table,
    CASE 
        WHEN p.visa_id = uv.visa_id THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END as sync_status
FROM profiles p
LEFT JOIN user_visas uv ON p.id = uv.user_id
LEFT JOIN visas v_profile ON p.visa_id = v_profile.id
LEFT JOIN visas v_user_visa ON uv.visa_id = v_user_visa.id
WHERE p.email LIKE '%gunstro.com'
ORDER BY p.username;

-- Success message
SELECT '🎉 DUAL-SYSTEM VISA MANAGEMENT ACTIVATED!' as status,
       'user_visas = Source of Truth' as note1,
       'profiles.visa_id = Auto-synced cache' as note2,
       'Both systems now stay in sync!' as note3;
