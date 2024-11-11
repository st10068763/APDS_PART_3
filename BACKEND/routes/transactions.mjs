import express from 'express';
import db from "../db/conn.mjs";

const router = express.Router();

// Mock data or database integration
const transactions = [
  { id: 1, payee: 'John Doe', account: '123456789', amount: 100, swiftCode: 'ABC123XYZ', status: 'Pending', date: '2024-11-01' },
  { id: 2, payee: 'Jane Smith', account: '987654321', amount: 250, swiftCode: 'DEF456UVW', status: 'Pending', date: '2024-11-02' },
  { id: 3, payee: 'Alice Johnson', account: '564738291', amount: 500, swiftCode: 'GHI789RST', status: 'Verified', date: '2024-11-03' },
  { id: 4, payee: 'Bob Brown', account: '102938475', amount: 350, swiftCode: 'JKL012MNO', status: 'Completed', date: '2024-11-04' },
  { id: 5, payee: 'Charlie Green', account: '564738290', amount: 150, swiftCode: 'PQR345STU', status: 'Pending', date: '2024-11-05' },
];

// Fetch all transactions or filter by user
router.get('/', (req, res) => {
  const user = req.query.user;
  if (user) {
    const userTransactions = transactions.filter(t => t.user === user);
    res.json(userTransactions);
  } else {
    res.json(transactions);
  }
});

// Verify transaction
router.post('/:id/verify', (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (transaction) {
    transaction.status = 'Verified';
    res.json({ message: `Transaction ${req.params.id} verified`, transaction });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

// Reject transaction
router.post('/:id/reject', (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (transaction) {
    transaction.status = 'Rejected';
    res.json({ message: `Transaction ${req.params.id} rejected`, transaction });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

export default router;
