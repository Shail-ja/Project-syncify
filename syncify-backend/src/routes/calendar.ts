import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/events', (_req, res) => {
  res.json({ events: [] });
});

export default router;


