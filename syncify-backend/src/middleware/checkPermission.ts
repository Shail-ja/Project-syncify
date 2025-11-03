import { Request, Response, NextFunction } from 'express';

export function checkPermission(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = req.authUser?.roles || [];
    if (!roles.includes(requiredRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}


