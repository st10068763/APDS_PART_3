import express from 'express';
import db from "../db/conn.mjs";

const router = express.Router();

// Mock data or database integration
const transactions = [
  { id: 1, user: 'User A', amount: 100, status: 'Pending', date: '2024-11-01' },
  { id: 2, user: 'User B', amount: 250, status: 'Pending', date: '2024-11-02' },
];

// Fetch all transactions or filter by user
router.get('/', (req, res) => {
  const userId = req.query.userId;
  if (userId) {
    const userTransactions = transactions.filter(t => t.userId === userId);
    res.json(userTransactions);
  } else {
    res.json(transactions);
  }
});

// Verify transaction
router.post('/:id/verify', (req, res) => {
  // Mark as verified
  res.json({ message: `Transaction ${req.params.id} verified` });
});

// Reject transaction
router.post('/:id/reject', (req, res) => {
  // Mark as rejected
  res.json({ message: `Transaction ${req.params.id} rejected` });
});

export default router;  
