import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/summary', (_req, res) => {
  res.json({ summary: {} });
});

export default router;


