import express from 'express';
import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';  // Import ObjectId for MongoDB

const router = express.Router();

// Fetch all transactions or filter by user
router.get('/', async (req, res) => {
  const user = req.query.user;

  try {
    let transactions;
    if (user) {
      // Fetch transactions based on userId (assumed 'user' is the userId)
      transactions = await db.collection('transactions').find({ userId: user }).toArray();
    } else {
      // Fetch all transactions if no user query is provided
      transactions = await db.collection('transactions').find().toArray();
    }
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err });
  }
});

// Verify transaction
router.post('/:id/verify', async (req, res) => {
    console.log(`Verifying transaction: ${req.params.id}`);
    try {
        // Ensure the ID is properly converted to ObjectId
        const transaction = await db.collection('transactions').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },  // Convert the string ID to ObjectId
            { $set: { status: 'Verified' } },
            { returnDocument: 'after' }
        );
        if (transaction.value) {
            res.json({ message: `Transaction ${req.params.id} verified`, transaction: transaction.value });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Verification failed', error });
    }
});

// Reject transaction
router.post('/:id/reject', async (req, res) => {
    try {
        // Ensure the ID is properly converted to ObjectId
        const transaction = await db.collection('transactions').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },  // Convert the string ID to ObjectId
            { $set: { status: 'Rejected' } },
            { returnDocument: 'after' }
        );
        if (transaction.value) {
            res.json({ message: `Transaction ${req.params.id} rejected`, transaction: transaction.value });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Rejection failed', error });
    }
});

export default router;
