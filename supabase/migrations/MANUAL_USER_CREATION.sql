-- ============================================================================
-- MANUAL USER CREATION FOR TESTING
-- ============================================================================
-- This bypasses the registration form and creates users + profiles directly
-- Password for all: Demo123!
-- ============================================================================

-- First, let's check what's required in profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Create a simple function to add test users
CREATE OR REPLACE FUNCTION create_test_user(
    p_email TEXT,
    p_username TEXT,
    p_display_name TEXT,
    p_password TEXT DEFAULT 'Demo123!'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insert into auth.users using the Supabase auth admin function
    -- This requires using Supabase's RPC or doing it through the dashboard
    
    -- For now, return a message
    RAISE NOTICE 'Please create user % via Supabase Dashboard', p_email;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- Since we can't directly insert into auth.users via SQL, use these methods:
--
-- METHOD 1: Supabase Dashboard (EASIEST)
-- 1. Go to Authentication → Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter email and password
-- 4. Make sure "Auto Confirm User" is checked
-- 5. Click Create
--
-- METHOD 2: Use Supabase CLI
-- Run this command for each user:
-- supabase auth users create founder@gunstro.com --password Demo123!
--
-- METHOD 3: Fix the registration form
-- We need to populate the 'visas' table first
-- ============================================================================

-- After users are created, run this to verify:
SELECT 
    u.email,
    u.created_at,
    u.email_confirmed_at,
    p.username,
    p.display_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@gunstro.com'
ORDER BY u.created_at DESC;
