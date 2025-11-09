import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import checkPermission from '../middleware/checkPermission';
import logAction from '../utils/LogAction';
import { Project } from '../types';
import { sendInvitationEmail } from '../utils/email';

declare global {
  namespace Express {
    interface Request {
      user?: { email?: string; [key: string]: any };
    }
  }
}

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { title, slug, summary, content = '', public: isPublic = false } = req.body as Partial<Project>;
  const ownerEmail = req.user?.email as string;
  try {
    // Use Supabase Auth user id directly from middleware
    const ownerId = (req.user as any)?.id as string | undefined;
    if (!ownerId) return res.status(401).json({ error: 'Missing authenticated user id' });

    const id = uuidv4();
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ id, title, slug, summary, content, owner_id: ownerId, public: isPublic }])
      .select()
      .single();

    if (error) throw error;
    // Add owner as admin member
    await supabase.from('project_members').insert([{ project_id: id, user_email: ownerEmail, role: 'admin' }]);

    // Create default board for the project
    const boardId = uuidv4();
    const { error: boardError } = await supabase
      .from('boards')
      .insert([{ id: boardId, project_id: id, title: 'Default Board' }]);

    if (boardError) {
      console.error('Failed to create default board:', boardError);
      // Don't fail the request if board creation fails, but log it
    }

    // Log activity
    await logAction(ownerEmail, id, `created project ${title}`);

    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

// Get all projects for authenticated user (owned or member of)
router.get('/', requireAuth, async (req, res) => {
  const userEmail = req.user?.email as string;
  const userId = (req.user as any)?.id as string | undefined;
  
  try {
    if (!userId) return res.status(401).json({ error: 'Missing authenticated user id' });
    
    // Get projects where user is owner
    const { data: ownedProjects, error: ownedErr } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (ownedErr) throw ownedErr;
    
    // Get projects where user is a member
    const { data: memberProjects, error: memberErr } = await supabase
      .from('project_members')
      .select('project_id, projects:project_id (*)')
      .eq('user_email', userEmail);
    
    if (memberErr) throw memberErr;
    
    // Combine owned and member projects, removing duplicates
    const memberProjectIds = (memberProjects || []).map((mp: any) => mp.projects?.id).filter(Boolean);
    const allProjectIds = new Set([
      ...(ownedProjects || []).map((p: any) => p.id),
      ...memberProjectIds
    ]);
    
    // Fetch all unique projects
    const { data: allProjects, error: allErr } = await supabase
      .from('projects')
      .select('*')
      .in('id', Array.from(allProjectIds))
      .order('created_at', { ascending: false });
    
    if (allErr) throw allErr;
    
    res.json({ projects: allProjects || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('public', true).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ projects: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

router.post('/:id/invite', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { email, role = 'member' } = req.body as { email: string; role?: string };
  const inviterEmail = req.user?.email as string;
  const inviterId = (req.user as any)?.id as string | undefined;
  
  try {
    if (!inviterId) return res.status(401).json({ error: 'Missing authenticated user id' });
    
    // Check if project exists and get owner_id
    const { data: project, error: projectErr } = await supabase
      .from('projects')
      .select('id, title, owner_id')
      .eq('id', id)
      .single();
    
    if (projectErr || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Only the project owner (creator) can invite members
    if (project.owner_id !== inviterId) {
      return res.status(403).json({ error: 'Only the project creator can invite team members' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Validate role
    const validRoles = ['viewer', 'member', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be one of: viewer, member, manager, admin' });
    }
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('user_email')
      .eq('project_id', id)
      .eq('user_email', email)
      .maybeSingle();
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }
    
    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('project_invitations')
      .select('id, status')
      .eq('project_id', id)
      .eq('invited_email', email)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation has already been sent to this email' });
    }
    
    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationId = uuidv4();
    
    // Create invitation record
    const { data: invitation, error: inviteErr } = await supabase
      .from('project_invitations')
      .insert([{
        id: invitationId,
        project_id: id,
        invited_by_email: inviterEmail,
        invited_email: email,
        role: role,
        status: 'pending',
        token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }])
      .select()
      .single();
    
    if (inviteErr) throw inviteErr;
    
    // Get inviter name for email
    const { data: inviterUser } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('email', inviterEmail)
      .maybeSingle();
    
    const inviterName = inviterUser?.first_name && inviterUser?.last_name
      ? `${inviterUser.first_name} ${inviterUser.last_name}`
      : inviterUser?.first_name || undefined;
    
    // Send invitation email
    try {
      await sendInvitationEmail({
        invitedEmail: email,
        projectTitle: project.title || 'Untitled Project',
        inviterEmail,
        inviterName,
        role,
        invitationToken,
        projectId: id
      });
    } catch (emailErr) {
      console.error('Failed to send invitation email:', emailErr);
      // Don't fail the request if email fails, but log it
    }
    
    // Log activity
    await logAction(inviterEmail, id, `invited ${email} as ${role}`);
    
    res.json({ 
      ok: true, 
      invitation: {
        id: invitation.id,
        invited_email: invitation.invited_email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at
      }
    });
  } catch (err: any) {
    console.error('Invite error:', err);
    res.status(500).json({ error: err.message || 'Failed to send invitation' });
  }
});

// Create Task (new endpoint that uses board_id and checks assignee membership)
router.post(
  '/:projectId/tasks',
  requireAuth,
  checkPermission('projectId', 'member') as express.RequestHandler,
  async (req, res) => {
    const { projectId } = req.params;
    const { title, description = '', assignee = null, due_date = null } = req.body;
    const userEmail = req.user?.email as string;
    const userId = (req.user as any)?.id as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Missing authenticated user id' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    try {
      // Check if assignee exists in project_members if assignee is provided
      if (assignee) {
        const { data: member, error: memberError } = await supabase
          .from('project_members')
          .select('user_email')
          .eq('project_id', projectId)
          .eq('user_email', assignee.toLowerCase().trim())
          .maybeSingle();

        if (memberError) {
          throw memberError;
        }

        if (!member) {
          return res.status(400).json({ 
            error: `Assignee ${assignee} is not a member of this project. Please invite them first.` 
          });
        }
      }

      // Get or create a board for this project
      let { data: board, error: boardError } = await supabase
        .from('boards')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (boardError) {
        throw boardError;
      }

      // Create a default board if one doesn't exist
      if (!board) {
        const boardId = uuidv4();
        const { data: newBoard, error: createBoardError } = await supabase
          .from('boards')
          .insert([{ 
            id: boardId, 
            project_id: projectId, 
            title: 'Default Board' 
          }])
          .select()
          .single();

        if (createBoardError) {
          throw createBoardError;
        }

        if (!newBoard) {
          throw new Error('Failed to create default board');
        }

        board = newBoard;
        await logAction(userEmail, projectId, 'created default board');
      }

      // At this point, board must exist (either found or created)
      if (!board || !board.id) {
        throw new Error('Board is required but not available');
      }

      // Get the maximum position for tasks in this board
      const { data: maxPositionData } = await supabase
        .from('tasks')
        .select('position')
        .eq('board_id', board.id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = maxPositionData?.position !== undefined 
        ? (maxPositionData.position + 1) 
        : 0;

      // Create the task
      const taskId = uuidv4();
      const taskData: any = {
        id: taskId,
        project_id: projectId,
        board_id: board.id,
        title,
        description,
        assignee: assignee ? assignee.toLowerCase().trim() : null,
        owner: userEmail,
        due_date: due_date || null,
        reminder_sent: false,
        status: 'todo',
        position: nextPosition,
        created_at: new Date().toISOString(),
      };

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (taskError) {
        throw taskError;
      }

      await logAction(userEmail, projectId, `created task ${title}`);
      res.json({ task });
    } catch (err: any) {
      console.error('Create task error:', err);
      res.status(500).json({ error: err.message || 'Failed to create task' });
    }
  }
);

export default router;
