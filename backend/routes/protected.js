// routes/protected.mjs
import { Router } from 'express';
import authenticateJWT from '../middleware/authMiddleware.js';

const router = Router();

router.get('/protected-route', authenticateJWT, (req, res) => {
  res.json({ message: 'You have access to this protected route!' });
});

export default router;
