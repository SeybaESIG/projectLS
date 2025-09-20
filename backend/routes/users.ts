import express from 'express';
import type { Request, Response, NextFunction } from 'express';
const router = express.Router();
router.get('/', (_req: Request, res: Response, _next: NextFunction) => {
  res.send('respond with a resource');
});

export default router;