import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import paymentRoutes from './routes/payments';
import { initializeDatabase } from './db';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

initializeDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Future Funds Investment Platform' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
