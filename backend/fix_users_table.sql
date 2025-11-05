-- This SQL script helps diagnose and fix the "Database error saving new user" issue
-- Run these queries in your Supabase SQL Editor

-- 1. Check if the users table exists and see its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check for triggers on auth.users that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- 3. Check for triggers on public.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'users';

-- 4. Drop existing table if it has wrong structure (WARNING: This deletes all user data!)
-- Uncomment the next line ONLY if you're okay with losing existing user data:
-- DROP TABLE IF EXISTS public.users CASCADE;

-- 5. Create the users table with correct structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add missing columns if table already exists (safe to run multiple times)
DO $$ 
DECLARE
    existing_pk_name TEXT;
    fk_constraint RECORD;
BEGIN
    -- Add id column if it doesn't exist (THIS IS THE CRITICAL FIX!)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'id') THEN
        -- Check if there's an existing primary key constraint
        SELECT constraint_name INTO existing_pk_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND constraint_type = 'PRIMARY KEY'
        LIMIT 1;
        
        -- Drop existing primary key with CASCADE (this will automatically drop dependent foreign keys)
        IF existing_pk_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I CASCADE', existing_pk_name);
        END IF;
        
        -- First add the column as nullable
        ALTER TABLE public.users ADD COLUMN id UUID;
        
        -- Populate id from auth.users based on email match
        UPDATE public.users u
        SET id = au.id
        FROM auth.users au
        WHERE u.email = au.email
        AND u.id IS NULL;
        
        -- Delete any rows that couldn't be matched (orphaned records)
        DELETE FROM public.users WHERE id IS NULL;
        
        -- Now make it NOT NULL and set as primary key
        ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;
        ALTER TABLE public.users ADD PRIMARY KEY (id);
        
        -- Ensure email has a unique constraint (required for foreign keys that reference it)
        -- Check if constraint already exists before creating
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'users' 
            AND constraint_name = 'users_email_unique'
        ) THEN
            BEGIN
                ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
            EXCEPTION WHEN duplicate_object THEN
                -- Unique constraint already exists, ignore
                NULL;
            END;
        END IF;
        
        -- Recreate foreign key constraints (they will reference email, which is fine)
        -- These are the foreign keys that were dropped above
        BEGIN
            ALTER TABLE public.project_members 
            ADD CONSTRAINT project_members_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.tasks 
            ADD CONSTRAINT tasks_assignee_fkey 
            FOREIGN KEY (assignee) REFERENCES public.users(email) ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.tasks 
            ADD CONSTRAINT tasks_owner_fkey 
            FOREIGN KEY (owner) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.messages 
            ADD CONSTRAINT messages_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.files 
            ADD CONSTRAINT files_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.activity_logs 
            ADD CONSTRAINT activity_logs_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        BEGIN
            ALTER TABLE public.projects 
            ADD CONSTRAINT projects_owner_fkey 
            FOREIGN KEY (owner) REFERENCES public.users(email) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        
        -- Add foreign key constraint to auth.users
        BEGIN
            ALTER TABLE public.users 
            ADD CONSTRAINT users_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN
            -- Foreign key already exists, ignore
            NULL;
        END;
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
    END IF;
    
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'first_name') THEN
        ALTER TABLE public.users ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'last_name') THEN
        ALTER TABLE public.users ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Make email NOT NULL if not already
    BEGIN
        ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Column might already be NOT NULL, ignore
        NULL;
    END;
    
    -- Ensure email has unique constraint (if it doesn't exist)
    -- Note: This is already added above if id column was just created, but we check here
    -- in case the id column already existed or if the constraint was dropped
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'users' 
        AND constraint_name = 'users_email_unique'
    ) THEN
        BEGIN
            ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
        EXCEPTION WHEN OTHERS THEN
            -- Constraint might have been created concurrently or error occurred, ignore
            NULL;
        END;
    END IF;
END $$;

-- 7. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 9. Create a policy that allows users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- 10. Create a policy that allows service role to insert/update (for backend)
-- This policy allows all operations - Supabase service role bypasses RLS anyway
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 11. Create a policy that allows users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- 12. Create a function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.users.email),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger (drop old one first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 14. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;

