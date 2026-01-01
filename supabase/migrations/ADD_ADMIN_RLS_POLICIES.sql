-- ============================================================================
-- ADD ADMIN ACCESS TO MATRIX POSITIONS
-- ============================================================================
-- This allows admin users to view all matrix positions in the Admin Dashboard
-- ============================================================================

-- Option 1: Add a policy for users with is_admin flag in profiles
CREATE POLICY "Admins can view all matrix positions"
    ON matrix_positions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Option 2: Add policy for users with 'admin' role in auth.users metadata
CREATE POLICY "Admin role can view all matrix positions"
    ON matrix_positions FOR SELECT
    USING (
        auth.jwt() ->> 'user_role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Verification: Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'matrix_positions'
ORDER BY policyname;
