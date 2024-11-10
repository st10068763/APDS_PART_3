import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const EmployeeDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://localhost:3001/transactions');
            setTransactions(response.data);
            setError("");
        } catch (error) {
            setError("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const verifyTransaction = async (transactionId) => {
        try {
            await axios.patch(`https://localhost:3001/transactions/${transactionId}/verify`);
            setTransactions(transactions.map(t => 
                t._id === transactionId ? { ...t, verified: true } : t
            ));
        } catch (error) {
            console.error("Verification failed:", error);
        }
    };

    const submitToSwift = async () => {
        setSubmitting(true);
        try {
            const verifiedIds = transactions.filter(t => t.verified).map(t => t._id);
            await axios.post('https://localhost:3001/transactions/submit-to-swift', { transactionIds: verifiedIds });
            alert("Verified transactions submitted to SWIFT successfully.");
            fetchTransactions();
        } catch (error) {
            console.error("Submit to SWIFT failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Employee Dashboard</h2>
            {error && <p style={styles.error}>{error}</p>}
            {loading ? (
                <Loader style={styles.loader} />
            ) : (
                <div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Payee</th>
                                <th>Account</th>
                                <th>Amount</th>
                                <th>SWIFT Code</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction._id} style={styles.row}>
                                    <td>{transaction.payee}</td>
                                    <td>{transaction.account}</td>
                                    <td>{transaction.amount}</td>
                                    <td>{transaction.swiftCode}</td>
                                    <td style={transaction.verified ? styles.verified : styles.pending}>
                                        {transaction.verified ? (
                                            <CheckCircle color="green" />
                                        ) : (
                                            <XCircle color="orange" />
                                        )}
                                    </td>
                                    <td>
                                        {!transaction.verified && (
                                            <button 
                                                style={styles.verifyButton} 
                                                onClick={() => verifyTransaction(transaction._id)}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button 
                        onClick={submitToSwift} 
                        style={styles.submitButton} 
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Verified to SWIFT"}
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        color: '#333',
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
    },
    row: {
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
    },
    verified: {
        color: 'green',
    },
    pending: {
        color: 'orange',
    },
    loader: {
        display: 'block',
        margin: '50px auto',
        fontSize: '2rem',
    },
    verifyButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        border: 'none',
    },
    submitButton: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        border: 'none',
        display: 'block',
        margin: '20px auto',
    },
};

export default EmployeeDashboard;
