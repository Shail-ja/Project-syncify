import express from 'express';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import logAction from '../utils/LogAction';

const router = express.Router();

// Get invitation by token (for frontend to check invitation status)
// This must come BEFORE parameterized routes like /:projectId/*
router.get('/invitations/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    const { data: invitation, error } = await supabase
      .from('project_invitations')
      .select(`
        id,
        project_id,
        invited_by_email,
        invited_email,
        role,
        status,
        expires_at,
        created_at,
        projects:project_id (
          id,
          title
        )
      `)
      .eq('token', token)
      .single();
    
    if (error || !invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    // Check if expired
    if (invitation.status === 'pending' && new Date(invitation.expires_at) < new Date()) {
      // Update to expired
      await supabase
        .from('project_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      invitation.status = 'expired';
    }
    
    res.json({ invitation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

// Accept invitation
router.post('/invitations/accept', requireAuth, async (req, res) => {
  const { token } = req.body as { token: string };
  const userEmail = req.user?.email as string;
  const userId = (req.user as any)?.id as string | undefined;
  
  try {
    if (!token) return res.status(400).json({ error: 'Invitation token is required' });
    if (!userId) return res.status(401).json({ error: 'Missing authenticated user id' });
    
    // Find invitation by token
    const { data: invitation, error: inviteErr } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
    
    if (inviteErr || !invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('project_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      return res.status(400).json({ error: 'Invitation has expired' });
    }
    
    // Verify the email matches the authenticated user
    if (invitation.invited_email.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('user_email')
      .eq('project_id', invitation.project_id)
      .eq('user_email', userEmail)
      .maybeSingle();
    
    if (existingMember) {
      // Mark invitation as accepted even if already a member
      await supabase
        .from('project_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
      return res.status(400).json({ error: 'You are already a member of this project' });
    }
    
    // Add user to project_members
    const { error: memberErr } = await supabase
      .from('project_members')
      .insert([{
        project_id: invitation.project_id,
        user_email: userEmail,
        role: invitation.role
      }]);
    
    if (memberErr) throw memberErr;
    
    // Update invitation status to accepted
    const { error: updateErr } = await supabase
      .from('project_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
    
    if (updateErr) throw updateErr;
    
    // Log activity
    await logAction(userEmail, invitation.project_id, `accepted invitation and joined project as ${invitation.role}`);
    
    // Get project info for response
    const { data: project } = await supabase
      .from('projects')
      .select('id, title')
      .eq('id', invitation.project_id)
      .single();
    
    res.json({ 
      ok: true, 
      message: 'Invitation accepted successfully',
      project: project
    });
  } catch (err: any) {
    console.error('Accept invitation error:', err);
    res.status(500).json({ error: err.message || 'Failed to accept invitation' });
  }
});

// Decline invitation
router.post('/invitations/decline', requireAuth, async (req, res) => {
  const { token } = req.body as { token: string };
  const userEmail = req.user?.email as string;
  
  try {
    if (!token) return res.status(400).json({ error: 'Invitation token is required' });
    
    // Find invitation by token
    const { data: invitation, error: inviteErr } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
    
    if (inviteErr || !invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
    // Verify the email matches the authenticated user
    if (invitation.invited_email.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }
    
    // Update invitation status to declined
    const { error: updateErr } = await supabase
      .from('project_invitations')
      .update({ status: 'declined' })
      .eq('id', invitation.id);
    
    if (updateErr) throw updateErr;
    
    // Log activity (optional - you might not want to log declines)
    
    res.json({ 
      ok: true, 
      message: 'Invitation declined successfully'
    });
  } catch (err: any) {
    console.error('Decline invitation error:', err);
    res.status(500).json({ error: err.message || 'Failed to decline invitation' });
  }
});

// Get project members
router.get('/:projectId/members', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data, error } = await supabase.from('project_members').select('*').eq('project_id', projectId);
    if (error) throw error;
    res.json({ members: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

// Get pending invitations for a project (only project owner can see)
router.get('/:projectId/invitations', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  const userId = (req.user as any)?.id as string | undefined;
  
  try {
    if (!userId) return res.status(401).json({ error: 'Missing authenticated user id' });
    
    // Check if user is the project owner
    const { data: project, error: projectErr } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();
    
    if (projectErr || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.owner_id !== userId) {
      return res.status(403).json({ error: 'Only the project owner can view invitations' });
    }
    
    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ invitations: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;