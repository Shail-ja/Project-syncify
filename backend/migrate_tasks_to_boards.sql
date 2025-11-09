-- Migration script to restructure tasks and boards
-- This script:
-- 1. Creates boards table if it doesn't exist
-- 2. Creates boards for all existing projects
-- 3. Modifies tasks table to use board_id instead of column_id
-- 4. Adds all required columns to tasks table

-- Step 1: Create boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Default Board',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT boards_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Step 2: Create a unique board for each existing project that doesn't have one
-- First, get the project_id from existing tasks or create boards for all projects
INSERT INTO public.boards (id, project_id, title, created_at)
SELECT 
    gen_random_uuid() as id,
    p.id as project_id,
    'Default Board' as title,
    NOW() as created_at
FROM public.projects p
WHERE NOT EXISTS (
    SELECT 1 FROM public.boards b WHERE b.project_id = p.id
)
ON CONFLICT DO NOTHING;

-- Step 3: Add board_id column to tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'board_id'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN board_id UUID;
    END IF;
END $$;

-- Step 4: Migrate existing tasks to use board_id
-- For tasks that have column_id, find the board_id from the columns table
-- If columns table exists and has board_id, use that
DO $$
BEGIN
    -- Check if columns table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'columns'
    ) THEN
        -- Update tasks with board_id from columns
        UPDATE public.tasks t
        SET board_id = c.board_id
        FROM public.columns c
        WHERE t.column_id = c.id
        AND t.board_id IS NULL;
    END IF;
    
    -- For tasks that still don't have board_id, try to get it from project
    -- If task has project_id, find or create a board for that project
    UPDATE public.tasks t
    SET board_id = (
        SELECT b.id 
        FROM public.boards b 
        WHERE b.project_id = t.project_id 
        LIMIT 1
    )
    WHERE t.board_id IS NULL 
    AND t.project_id IS NOT NULL;
END $$;

-- Step 5: Add project_id column to tasks if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'project_id'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN project_id UUID;
        
        -- Try to populate project_id from boards via column_id if columns table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'columns'
        ) THEN
            UPDATE public.tasks t
            SET project_id = b.project_id
            FROM public.columns c
            JOIN public.boards b ON c.board_id = b.id
            WHERE t.column_id = c.id
            AND t.project_id IS NULL;
        END IF;
        
        -- Or populate from board_id directly
        UPDATE public.tasks t
        SET project_id = b.project_id
        FROM public.boards b
        WHERE t.board_id = b.id
        AND t.project_id IS NULL;
    END IF;
END $$;

-- Step 6: Add missing columns to tasks table
DO $$
BEGIN
    -- Add owner column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'owner'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN owner TEXT;
    END IF;
    
    -- Add reminder_sent column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'reminder_sent'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN status TEXT DEFAULT 'todo';
    END IF;
    
    -- Add position column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN position INTEGER DEFAULT 0;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Ensure title is NOT NULL
    BEGIN
        ALTER TABLE public.tasks ALTER COLUMN title SET NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    -- Ensure board_id is NOT NULL (after migration)
    BEGIN
        -- First, set a default board for any tasks without board_id
        UPDATE public.tasks t
        SET board_id = (
            SELECT b.id 
            FROM public.boards b 
            WHERE b.project_id = t.project_id 
            LIMIT 1
        )
        WHERE t.board_id IS NULL 
        AND t.project_id IS NOT NULL;
        
        -- Then make it NOT NULL if all tasks have board_id
        ALTER TABLE public.tasks ALTER COLUMN board_id SET NOT NULL;
    EXCEPTION WHEN others THEN
        -- Some tasks might not have board_id yet, that's okay
        NULL;
    END;
END $$;

-- Step 7: Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key for board_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'tasks' 
        AND constraint_name = 'tasks_board_id_fkey'
    ) THEN
        BEGIN
            ALTER TABLE public.tasks 
            ADD CONSTRAINT tasks_board_id_fkey 
            FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
    
    -- Add foreign key for project_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'tasks' 
        AND constraint_name = 'tasks_project_id_fkey'
    ) THEN
        BEGIN
            ALTER TABLE public.tasks 
            ADD CONSTRAINT tasks_project_id_fkey 
            FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
    
    -- Add foreign key for owner (references users.email)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'tasks' 
        AND constraint_name = 'tasks_owner_fkey'
    ) THEN
        BEGIN
            ALTER TABLE public.tasks 
            ADD CONSTRAINT tasks_owner_fkey 
            FOREIGN KEY (owner) REFERENCES public.users(email) ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- Step 8: Drop column_id column and its dependencies
DO $$
DECLARE
    trig_rec RECORD;
    constr_rec RECORD;
BEGIN
    -- Drop trigger that depends on column_id (specific trigger mentioned in error)
    DROP TRIGGER IF EXISTS trg_tasks_fill_hierarchy_upd ON public.tasks CASCADE;
    
    -- Drop any other triggers that might depend on column_id (hierarchy-related triggers)
    FOR trig_rec IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
        AND event_object_table = 'tasks'
        AND trigger_name LIKE '%hierarchy%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.tasks CASCADE', trig_rec.trigger_name);
    END LOOP;
    
    -- Drop foreign key constraints on column_id if they exist
    FOR constr_rec IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
        AND table_name = 'tasks'
        AND (constraint_name LIKE '%column_id%' OR constraint_name LIKE '%column%')
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS %I CASCADE', constr_rec.constraint_name);
        EXCEPTION WHEN OTHERS THEN
            -- Constraint might not exist or already dropped, continue
            NULL;
        END;
    END LOOP;
    
    -- Drop column_id column if it exists (use CASCADE to drop any remaining dependencies)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'column_id'
    ) THEN
        -- Use CASCADE to automatically drop any remaining dependencies (triggers, constraints, etc.)
        BEGIN
            ALTER TABLE public.tasks DROP COLUMN column_id CASCADE;
        EXCEPTION WHEN OTHERS THEN
            -- Column might have already been dropped or error occurred, log and continue
            RAISE NOTICE 'Could not drop column_id: %', SQLERRM;
        END;
    END IF;
END $$;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON public.tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON public.boards(project_id);

-- Step 10: Enable Row Level Security on boards table
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Create policy for boards (users can view boards for projects they're members of)
DROP POLICY IF EXISTS "Users can view boards for projects they're members of" ON public.boards;
CREATE POLICY "Users can view boards for projects they're members of" ON public.boards
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = boards.project_id
            AND pm.user_email = (SELECT email FROM public.users WHERE id = auth.uid() LIMIT 1)
        )
    );

-- Create policy for service role to manage boards
DROP POLICY IF EXISTS "Service role can manage boards" ON public.boards;
CREATE POLICY "Service role can manage boards" ON public.boards
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verification queries (run these to check the migration)
-- SELECT 'Boards created:' as info, COUNT(*) as count FROM public.boards;
-- SELECT 'Tasks with board_id:' as info, COUNT(*) as count FROM public.tasks WHERE board_id IS NOT NULL;
-- SELECT 'Tasks with project_id:' as info, COUNT(*) as count FROM public.tasks WHERE project_id IS NOT NULL;
-- SELECT 'Tasks without board_id:' as info, COUNT(*) as count FROM public.tasks WHERE board_id IS NULL;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' ORDER BY ordinal_position;

