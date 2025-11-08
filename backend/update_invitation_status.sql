-- SQL code for updating project_invitations table when a person accepts or declines an invitation

-- ============================================
-- ACCEPT INVITATION
-- ============================================
-- When a person accepts an invitation:
-- 1. Update the invitation status to 'accepted'
-- 2. Add the user to project_members table

-- Step 1: Update invitation status to 'accepted
-- Replace 'INVITATION_ID' with the actual invitation ID
-- Replace 'INVITATION_TOKEN' with the actual invitation token
UPDATE public.project_invitations
SET 
    status = 'accepted',
    updated_at = NOW()
WHERE 
    id = 'INVITATION_ID'  -- OR use: token = 'INVITATION_TOKEN'
    AND status = 'pending'
    AND expires_at > NOW();

-- Step 2: Add user to project_members table (only if not already a member)
-- Replace 'PROJECT_ID' with the actual project ID
-- Replace 'USER_EMAIL' with the invited user's email
-- Replace 'ROLE' with the invitation role (member, manager, admin, viewer)
INSERT INTO public.project_members (project_id, user_email, role, created_at)
SELECT 
    pi.project_id,
    pi.invited_email,
    pi.role,
    NOW()
FROM public.project_invitations pi
WHERE 
    pi.id = 'INVITATION_ID'  -- OR use: pi.token = 'INVITATION_TOKEN'
    AND pi.status = 'accepted'
ON CONFLICT (project_id, user_email) DO NOTHING;  -- Prevents duplicate members

-- ============================================
-- DECLINE INVITATION
-- ============================================
-- When a person declines an invitation:
-- 1. Update the invitation status to 'declined'

-- Update invitation status to 'declined'
-- Replace 'INVITATION_ID' with the actual invitation ID
-- Replace 'INVITATION_TOKEN' with the actual invitation token
UPDATE public.project_invitations
SET 
    status = 'declined',
    updated_at = NOW()
WHERE 
    id = 'INVITATION_ID'  -- OR use: token = 'INVITATION_TOKEN'
    AND status = 'pending'
    AND expires_at > NOW();

-- ============================================
-- COMPLETE EXAMPLE WITH TOKEN-BASED QUERIES
-- ============================================

-- ACCEPT INVITATION (using token)
-- This is what the backend does when accepting:
DO $$
DECLARE
    v_invitation_id UUID;
    v_project_id UUID;
    v_invited_email TEXT;
    v_role TEXT;
BEGIN
    -- Find the invitation by token
    SELECT id, project_id, invited_email, role
    INTO v_invitation_id, v_project_id, v_invited_email, v_role
    FROM public.project_invitations
    WHERE token = 'INVITATION_TOKEN_HERE'
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF v_invitation_id IS NULL THEN
        RAISE EXCEPTION 'Invitation not found or already processed';
    END IF;
    
    -- Update invitation status to accepted
    UPDATE public.project_invitations
    SET status = 'accepted', updated_at = NOW()
    WHERE id = v_invitation_id;
    
    -- Add user to project_members (if not already a member)
    INSERT INTO public.project_members (project_id, user_email, role, created_at)
    VALUES (v_project_id, v_invited_email, v_role, NOW())
    ON CONFLICT (project_id, user_email) DO NOTHING;
    
    RAISE NOTICE 'Invitation accepted successfully';
END $$;

-- DECLINE INVITATION (using token)
-- This is what the backend does when declining:
DO $$
DECLARE
    v_invitation_id UUID;
BEGIN
    -- Find the invitation by token
    SELECT id
    INTO v_invitation_id
    FROM public.project_invitations
    WHERE token = 'INVITATION_TOKEN_HERE'
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF v_invitation_id IS NULL THEN
        RAISE EXCEPTION 'Invitation not found or already processed';
    END IF;
    
    -- Update invitation status to declined
    UPDATE public.project_invitations
    SET status = 'declined', updated_at = NOW()
    WHERE id = v_invitation_id;
    
    RAISE NOTICE 'Invitation declined successfully';
END $$;

-- ============================================
-- QUERY TO CHECK INVITATION STATUS
-- ============================================
-- View all invitations with their current status
SELECT 
    id,
    project_id,
    invited_by_email,
    invited_email,
    role,
    status,
    token,
    expires_at,
    created_at,
    updated_at,
    CASE 
        WHEN status = 'pending' AND expires_at < NOW() THEN 'expired'
        WHEN status = 'pending' AND expires_at >= NOW() THEN 'active'
        ELSE status
    END AS current_state
FROM public.project_invitations
ORDER BY created_at DESC;

-- View only accepted invitations
SELECT * FROM public.project_invitations WHERE status = 'accepted';

-- View only declined invitations
SELECT * FROM public.project_invitations WHERE status = 'declined';

-- View pending invitations
SELECT * FROM public.project_invitations WHERE status = 'pending' AND expires_at > NOW();

