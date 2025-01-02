import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token missing or badly formatted' });
  }

  const token = authHeader.split(' ')[1];
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      console.log('Decoded User:', req.user); // Log informasi user
      next(); 
  } catch (err) {
      if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Unauthorized: Token has expired' });
      }
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

