-- ============================================================================
-- ADD INSERT POLICY FOR user_visas TABLE
-- ============================================================================

-- Allow users to insert their own VISA during registration
CREATE POLICY "Users can insert own visa"
ON public.user_visas
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());

-- Verify the policy was created
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'user_visas'
  AND cmd = 'INSERT';

-- Success message
SELECT '✅ INSERT policy added! Users can now assign their VISA during registration!' as status;
