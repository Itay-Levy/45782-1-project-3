import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../utils/database';
import { User, UserDTO, LoginCredentials, RegisterData } from '../models/User';
import { generateToken } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password }: RegisterData = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({ message: 'Password must be at least 4 characters' });
      return;
    }

    // Check if email exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, 'user']
    );

    const userDTO: UserDTO = {
      id: result.insertId,
      firstName,
      lastName,
      email,
      role: 'user'
    };

    const token = generateToken(userDTO);
    res.status(201).json({ user: userDTO, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({ message: 'Password must be at least 4 characters' });
      return;
    }

    // Find user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ message: 'Incorrect email or password' });
      return;
    }

    const user = users[0] as User & { id: number };

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Incorrect email or password' });
      return;
    }

    const userDTO: UserDTO = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    const token = generateToken(userDTO);
    res.json({ user: userDTO, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    res.json({ exists: users.length > 0 });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
