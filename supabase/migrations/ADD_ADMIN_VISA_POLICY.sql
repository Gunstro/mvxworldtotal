-- ============================================================================
-- CHECK IF ADMIN CAN READ user_visas TABLE
-- ============================================================================

-- Check RLS policies for SELECT on user_visas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_visas'
  AND cmd = 'SELECT';

-- Add admin bypass policy if missing
DO $$
BEGIN
    -- Check if admin policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_visas' 
        AND policyname = 'Admins can view all visas'
    ) THEN
        -- Create policy for admins to view all user_visas
        EXECUTE 'CREATE POLICY "Admins can view all visas"
                 ON public.user_visas
                 FOR SELECT
                 TO public
                 USING (
                     EXISTS (
                         SELECT 1 FROM profiles 
                         WHERE id = auth.uid() 
                         AND is_admin = true
                     )
                 )';
        RAISE NOTICE '✅ Admin SELECT policy added!';
    ELSE
        RAISE NOTICE 'ℹ️ Admin SELECT policy already exists';
    END IF;
END $$;

-- Verify policies
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'user_visas'
ORDER BY cmd, policyname;
