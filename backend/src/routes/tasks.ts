import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import checkPermission from '../middleware/checkPermission';
import logAction from '../utils/LogAction';

const router = express.Router();

// Async wrapper to handle async route errors
const asyncHandler =
  (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>): express.RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create Task (new endpoint that uses board_id and checks assignee membership)
router.post(
  '/projects/:projectId/tasks',
  requireAuth,
  checkPermission('projectId', 'member') as express.RequestHandler,
  asyncHandler(async (req, res) => {
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

        board = newBoard;
        await logAction(userEmail, projectId, 'created default board');
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
  })
);

export default router;

