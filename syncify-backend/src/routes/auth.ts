import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.post('/login', (_req, res) => {
  res.json({ token: 'mock-token' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

export default router;


