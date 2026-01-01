-- ============================================================================
-- FIX handle_new_user TO BYPASS RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Bypass RLS by using a SECURITY DEFINER function
    -- This inserts the profile directly without RLS checks
    INSERT INTO public.profiles (
        id,
        email,
        username,
        display_name,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            LOWER(REGEXP_REPLACE(NEW.email, '@.*', ''))
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        true,
        NOW(),
        NOW()
    );
    
    -- Create wallet if table exists (also bypasses RLS)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'megabucks_wallets') THEN
        INSERT INTO public.megabucks_wallets (user_id, balance, created_at, updated_at)
        VALUES (NEW.id, 100.00, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- Create megascore if table exists (also bypasses RLS)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'megascores') THEN
        INSERT INTO public.megascores (user_id, total_score, level, created_at, updated_at)
        VALUES (NEW.id, 0, 1, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Success
SELECT '✅ handle_new_user updated to bypass RLS!' as status;
