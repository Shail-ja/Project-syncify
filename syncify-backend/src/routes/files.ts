import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { storage } from '../config/storage';

const router = Router();
router.use(requireAuth);

router.post('/upload', async (_req, res) => {
  const url = await storage.upload('path/to/file.txt', Buffer.from('hello'));
  res.json({ url });
});

export default router;


