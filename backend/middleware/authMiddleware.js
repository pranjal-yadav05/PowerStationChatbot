// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { secret } from '../jwtConfig.js';

function authenticateJWT(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

export default authenticateJWT;
