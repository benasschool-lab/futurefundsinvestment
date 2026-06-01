import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/paypal', (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero' });
  }

  // Stubbed PayPal payment flow.
  res.json({
    provider: 'PayPal',
    amount,
    status: 'ready',
    nextStep: 'visitPayPalDashboardToCompleteOrIntegrateSDK',
    reference: `PP-${Date.now()}`
  });
});

router.post('/mobile-money', (req: AuthRequest, res) => {
  const { amount, network, phoneNumber } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero' });
  }
  if (!network || !['MTN', 'AT', 'Telecel'].includes(network)) {
    return res.status(400).json({ error: 'Unsupported mobile money network' });
  }
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Stubbed mobile money payment flow.
  res.json({
    provider: 'MobileMoney',
    network,
    amount,
    phoneNumber,
    status: 'pending',
    reference: `MM-${Date.now()}`
  });
});

export default router;
