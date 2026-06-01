import express from 'express';
import { getDb } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/balance', (req: AuthRequest, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, balance FROM users WHERE id = ?').get(req.userId);
  res.json({ user });
});

router.get('/', (req: AuthRequest, res) => {
  const db = getDb();
  const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC').all(req.userId);
  res.json({ transactions });
});

router.post('/deposit', (req: AuthRequest, res) => {
  const { amount, provider } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be greater than 0' });
  }
  if (!provider) {
    return res.status(400).json({ error: 'Payment provider is required' });
  }

  const db = getDb();
  const createdAt = new Date().toISOString();
  const reference = `DEP-${Date.now()}`;

  const transaction = db.prepare(
    'INSERT INTO transactions (userId, type, provider, amount, status, createdAt, reference) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, 'deposit', provider, amount, 'completed', createdAt, reference);

  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, req.userId);

  res.json({ transactionId: transaction.lastInsertRowid, status: 'completed', reference });
});

router.post('/withdraw', (req: AuthRequest, res) => {
  const { amount, provider } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Withdrawal amount must be greater than 0' });
  }
  if (!provider) {
    return res.status(400).json({ error: 'Withdrawal provider is required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
  if (!user || user.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const createdAt = new Date().toISOString();
  const reference = `WDR-${Date.now()}`;

  db.prepare('INSERT INTO transactions (userId, type, provider, amount, status, createdAt, reference) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(req.userId, 'withdraw', provider, amount, 'completed', createdAt, reference);

  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, req.userId);

  res.json({ success: true, reference });
});

export default router;
