import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'leaddork_super_secret_key_123';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};
