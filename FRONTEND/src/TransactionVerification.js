
import React, { useEffect, useState } from 'react';

const TransactionVerification = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    // Fetch transactions from backend API endpoint
    try {
      const response = await fetch('/api/transactions'); // Replace with actual endpoint
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleVerify = (id) => {
    // Add logic to verify transaction
    console.log(`Verified transaction ${id}`);
  };

  const handleReject = (id) => {
    // Add logic to reject transaction
    console.log(`Rejected transaction ${id}`);
  };

  return (
    <div>
      <h1>Transaction Verification</h1>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.user}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.status}</td>
              <td>{transaction.date}</td>
              <td>
                <button onClick={() => handleVerify(transaction.id)}>Verify</button>
                <button onClick={() => handleReject(transaction.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionVerification;
