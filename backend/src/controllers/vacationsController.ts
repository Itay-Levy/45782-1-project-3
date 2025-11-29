import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../utils/database';
import { Vacation, VacationInput } from '../models/Vacation';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const getAllVacations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, filter } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const now = new Date().toISOString().split('T')[0];

    if (filter === 'following' && userId) {
      whereClause = `WHERE v.id IN (SELECT vacationId FROM followers WHERE userId = ${userId})`;
    } else if (filter === 'notStarted') {
      whereClause = `WHERE v.startDate > '${now}'`;
    } else if (filter === 'active') {
      whereClause = `WHERE v.startDate <= '${now}' AND v.endDate >= '${now}'`;
    }

    // Get total count
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM vacations v ${whereClause}`
    );
    const total = countResult[0].total;

    // Get vacations with follower count and user follow status
    const [vacations] = await pool.query<RowDataPacket[]>(`
      SELECT 
        v.*,
        COUNT(DISTINCT f.userId) as followersCount,
        ${userId ? `MAX(CASE WHEN f.userId = ${userId} THEN 1 ELSE 0 END)` : '0'} as isFollowing
      FROM vacations v
      LEFT JOIN followers f ON v.id = f.vacationId
      ${whereClause}
      GROUP BY v.id
      ORDER BY v.startDate ASC
      LIMIT ? OFFSET ?
    `, [Number(limit), offset]);

    res.json({
      vacations: vacations.map(v => ({
        ...v,
        isFollowing: Boolean(v.isFollowing)
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get vacations error:', error);
    res.status(500).json({ message: 'Server error fetching vacations' });
  }
};

export const getVacationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [vacations] = await pool.query<RowDataPacket[]>(`
      SELECT 
        v.*,
        COUNT(DISTINCT f.userId) as followersCount,
        ${userId ? `MAX(CASE WHEN f.userId = ${userId} THEN 1 ELSE 0 END)` : '0'} as isFollowing
      FROM vacations v
      LEFT JOIN followers f ON v.id = f.vacationId
      WHERE v.id = ?
      GROUP BY v.id
    `, [id]);

    if (vacations.length === 0) {
      res.status(404).json({ message: 'Vacation not found' });
      return;
    }

    res.json({
      ...vacations[0],
      isFollowing: Boolean(vacations[0].isFollowing)
    });
  } catch (error) {
    console.error('Get vacation error:', error);
    res.status(500).json({ message: 'Server error fetching vacation' });
  }
};

export const createVacation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { destination, description, startDate, endDate, price }: VacationInput = req.body;

    // Validation
    if (!destination || !description || !startDate || !endDate || price === undefined) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (price < 0 || price > 10000) {
      res.status(400).json({ message: 'Price must be between 0 and 10,000' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      res.status(400).json({ message: 'Start date cannot be in the past' });
      return;
    }

    if (end < start) {
      res.status(400).json({ message: 'End date cannot be before start date' });
      return;
    }

    // Handle image upload
    let imageFileName = 'default.jpg';
    if (req.files && req.files.image) {
      const image = req.files.image as any;
      const ext = path.extname(image.name);
      imageFileName = `${uuidv4()}${ext}`;
      await image.mv(path.join(UPLOADS_DIR, imageFileName));
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO vacations (destination, description, startDate, endDate, price, imageFileName) VALUES (?, ?, ?, ?, ?, ?)',
      [destination, description, startDate, endDate, price, imageFileName]
    );

    res.status(201).json({
      id: result.insertId,
      destination,
      description,
      startDate,
      endDate,
      price,
      imageFileName,
      followersCount: 0
    });
  } catch (error) {
    console.error('Create vacation error:', error);
    res.status(500).json({ message: 'Server error creating vacation' });
  }
};

export const updateVacation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { destination, description, startDate, endDate, price }: VacationInput = req.body;

    // Validation
    if (!destination || !description || !startDate || !endDate || price === undefined) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (price < 0 || price > 10000) {
      res.status(400).json({ message: 'Price must be between 0 and 10,000' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400).json({ message: 'End date cannot be before start date' });
      return;
    }

    // Get current vacation
    const [current] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM vacations WHERE id = ?',
      [id]
    );

    if (current.length === 0) {
      res.status(404).json({ message: 'Vacation not found' });
      return;
    }

    let imageFileName = current[0].imageFileName;

    // Handle new image upload
    if (req.files && req.files.image) {
      // Delete old image if not default
      if (imageFileName !== 'default.jpg') {
        const oldPath = path.join(UPLOADS_DIR, imageFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const image = req.files.image as any;
      const ext = path.extname(image.name);
      imageFileName = `${uuidv4()}${ext}`;
      await image.mv(path.join(UPLOADS_DIR, imageFileName));
    }

    await pool.query(
      'UPDATE vacations SET destination = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageFileName = ? WHERE id = ?',
      [destination, description, startDate, endDate, price, imageFileName, id]
    );

    res.json({
      id: Number(id),
      destination,
      description,
      startDate,
      endDate,
      price,
      imageFileName
    });
  } catch (error) {
    console.error('Update vacation error:', error);
    res.status(500).json({ message: 'Server error updating vacation' });
  }
};

export const deleteVacation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get vacation to delete image
    const [vacations] = await pool.query<RowDataPacket[]>(
      'SELECT imageFileName FROM vacations WHERE id = ?',
      [id]
    );

    if (vacations.length === 0) {
      res.status(404).json({ message: 'Vacation not found' });
      return;
    }

    // Delete associated followers
    await pool.query('DELETE FROM followers WHERE vacationId = ?', [id]);

    // Delete vacation
    await pool.query('DELETE FROM vacations WHERE id = ?', [id]);

    // Delete image if not default
    const imageFileName = vacations[0].imageFileName;
    if (imageFileName !== 'default.jpg') {
      const imagePath = path.join(UPLOADS_DIR, imageFileName);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Vacation deleted successfully' });
  } catch (error) {
    console.error('Delete vacation error:', error);
    res.status(500).json({ message: 'Server error deleting vacation' });
  }
};

export const followVacation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if vacation exists
    const [vacations] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM vacations WHERE id = ?',
      [id]
    );

    if (vacations.length === 0) {
      res.status(404).json({ message: 'Vacation not found' });
      return;
    }

    // Check if already following
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM followers WHERE userId = ? AND vacationId = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      res.status(409).json({ message: 'Already following this vacation' });
      return;
    }

    await pool.query(
      'INSERT INTO followers (userId, vacationId) VALUES (?, ?)',
      [userId, id]
    );

    res.status(201).json({ message: 'Vacation followed successfully' });
  } catch (error) {
    console.error('Follow vacation error:', error);
    res.status(500).json({ message: 'Server error following vacation' });
  }
};

export const unfollowVacation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM followers WHERE userId = ? AND vacationId = ?',
      [userId, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Follow record not found' });
      return;
    }

    res.json({ message: 'Vacation unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow vacation error:', error);
    res.status(500).json({ message: 'Server error unfollowing vacation' });
  }
};

export const getVacationsReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [vacations] = await pool.query<RowDataPacket[]>(`
      SELECT 
        v.destination,
        COUNT(f.userId) as followersCount
      FROM vacations v
      LEFT JOIN followers f ON v.id = f.vacationId
      GROUP BY v.id, v.destination
      ORDER BY followersCount DESC
    `);

    res.json(vacations);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error fetching report' });
  }
};

export const downloadCsv = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [vacations] = await pool.query<RowDataPacket[]>(`
      SELECT 
        v.destination,
        COUNT(f.userId) as followersCount
      FROM vacations v
      LEFT JOIN followers f ON v.id = f.vacationId
      GROUP BY v.id, v.destination
      ORDER BY followersCount DESC
    `);

    let csv = 'Destination,Followers\n';
    vacations.forEach((v: any) => {
      csv += `${v.destination},${v.followersCount}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vacations-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Download CSV error:', error);
    res.status(500).json({ message: 'Server error generating CSV' });
  }
};
