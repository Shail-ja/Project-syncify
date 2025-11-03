import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/history', (_req, res) => {
  res.json({ messages: [] });
});

export default router;


