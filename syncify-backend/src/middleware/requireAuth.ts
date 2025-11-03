import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Replace with real auth (e.g., Supabase, JWT)
  const authHeader = req.header('authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Mock user
  req.authUser = { id: 'user_1', email: 'user@example.com', roles: ['user'] };
  next();
}


