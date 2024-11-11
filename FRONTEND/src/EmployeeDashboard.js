import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';

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
            await axios.post(`https://localhost:3001/transactions/${transactionId}/verify`)
            .catch(err => console.error("API call failed:", err));

            setTransactions(transactions.map(t => 
                t._id === transactionId ? { ...t, status: "Verified" } : t
            ));
        } catch (error) {
            console.error("Verification failed:", error);
        }
    };

    const rejectTransaction = async (transactionId) => {
        try {
            await axios.post(`https://localhost:3001/transactions/${transactionId}/reject`)
            .catch(err => console.error("API call failed:", err));

            setTransactions(transactions.map(t => 
                t._id === transactionId ? { ...t, status: "Rejected" } : t
            ));
        } catch (error) {
            console.error("Rejection failed:", error);
        }
    };

    const submitToSwift = async () => {
        setSubmitting(true);
        try {
            const verifiedIds = transactions.filter(t => t.status === "Verified").map(t => t._id);
            await axios.post('https://localhost:3001/transactions/submit-to-swift', { transactionIds: verifiedIds });
            alert("Verified transactions submitted to SWIFT successfully.");
            await fetchTransactions();
        } catch (error) {
            console.error("Submit to SWIFT failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <h2 style={styles.navTitle}>Employee Dashboard</h2>
                <button style={styles.logoutButton} onClick={() => window.location.href = "/employee-login"}>
                    Logout
                </button>

            </nav>
            {error && <p style={styles.error}>{error}</p>}
            {loading ? (
                <Loader style={styles.loader} />
            ) : (
                <div style={styles.cardContainer}>
                    {transactions.map(transaction => (
                        <div key={transaction._id} style={styles.card}>
                            <div style={styles.cardRow}>
                                <p><strong>ID:</strong> {transaction._id}</p>
                                <p><strong>Payee:</strong> {transaction.recipient}</p>
                                <p><strong>Account:</strong> {transaction.accountNumber}</p>
                                <p><strong>Amount:</strong> {transaction.amount} {transaction.currency}</p>
                                <p><strong>SWIFT Code:</strong> {transaction.swiftCode}</p>
                                <p><strong>Status:</strong> 
                                    <span style={
                                        transaction.status === "Verified" 
                                        ? styles.verified 
                                        : transaction.status === "Rejected" 
                                        ? styles.rejected 
                                        : styles.pending
                                    }>
                                        {transaction.status || "Pending"}
                                    </span>
                                </p>
                                <div style={styles.buttonContainer}>
                                    {transaction.status !== "Verified" && transaction.status !== "Rejected" && (
                                        <>
                                            <button 
                                                style={styles.verifyButton} 
                                                onClick={() => verifyTransaction(transaction._id)}
                                            >
                                                Verify
                                            </button>
                                            <button 
                                                style={styles.rejectButton} 
                                                onClick={() => rejectTransaction(transaction._id)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <button 
                onClick={submitToSwift} 
                style={styles.submitButton} 
                disabled={submitting}
            >
                {submitting ? "Submitting..." : "Submit Verified to SWIFT"}
            </button>
        <p style={styles.message}>{submitting ? "Submitting transactions to SWIFT..." : ""}</p>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#22333B',
        padding: '10px 20px',
        color: 'white',
    },
    navTitle: {
        fontSize: '24px',
    },
    logoutButton: {
        backgroundColor: '#ff4b4b',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        border: 'none',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    loader: {
        display: 'block',
        margin: '50px auto',
        fontSize: '2rem',
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#EAE0D5',
    },
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
    },
    cardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        flexWrap: 'wrap',
    },
    verified: {
        color: 'green',
    },
    pending: {
        color: 'orange',
    },
    rejected: {
        color: 'red',
    },
    buttonContainer: {
        marginTop: '10px',
        display: 'flex',
        gap: '10px',
    },
    verifyButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        border: 'none',
    },
    rejectButton: {
        backgroundColor: '#FF6347',
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
