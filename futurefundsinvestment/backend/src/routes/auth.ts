import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { signToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = getDb();

  try {
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
    const user = db.prepare('SELECT id, email, name, balance FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(user.id);
    res.json({ user, token });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email, password, name, balance FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

export default router;
