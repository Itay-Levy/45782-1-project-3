import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserDTO } from '../models/User';

export interface AuthRequest extends Request {
  user?: UserDTO;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserDTO;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};

export const generateToken = (user: UserDTO): string => {
  return jwt.sign(
    { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
