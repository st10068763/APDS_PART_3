import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

// using express-brute to prevent brute force attacks
const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

// Helper function for regex validation
const validatePattern = (pattern, value) => pattern.test(value);

// Defining regex patterns
const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/; // Allows alphanumeric characters, underscores, and hyphens (3-20 chars)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
const accountNumberPattern = /^\d{10}$/; // Exactly 10 digits
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/; // Minimum 8 chars, at least 1 letter and 1 number

// Sign up
router.post("/signup", async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            username, 
            password, 
            accountNumber, 
            idNumber 
        } = req.body;

        console.log(`Signup attempt for username: ${username}`);

        // Validate required fields with regex patterns
        if (!validatePattern(usernamePattern, username)) {
            return res.status(400).json({ message: "Invalid username format" });
        }
        if (!validatePattern(emailPattern, email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!validatePattern(accountNumberPattern, accountNumber)) {
            return res.status(400).json({ message: "Account number must be exactly 10 digits" });
        }

        const collection = await db.collection("users");

        // Check if username already exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            console.log(`Signup failed: Username ${username} already exists`);
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const newUser = {
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            accountNumber,
            idNumber,
            createdAt: new Date()
        };

        // Insert new user document into database
        const result = await collection.insertOne(newUser);

        console.log(`User registered successfully: ${username}`);
        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Signup failed" });
    }
});

//-----------------Login
router.post("/login", bruteforce.prevent, async (req, res) => {
    const { identifier, password } = req.body;

    // Validate identifier format
    if (!validatePattern(usernamePattern, identifier) &&
        !validatePattern(emailPattern, identifier) &&
        !validatePattern(accountNumberPattern, identifier)) {
        return res.status(400).json({ message: "Invalid identifier format" });
    }
    if (!validatePattern(passwordPattern, password)) {
        return res.status(400).json({ message: "Invalid password format" });
    }

    try {
        const collection = await db.collection("users");

        // Find user by username, email, or account number
        const user = await collection.findOne({ 
            $or: [
                { username: identifier },
                { email: identifier },
                { accountNumber: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check if the provided password matches the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Authentication successful",
            token,
            userId: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


//-------------------Local Payment
router.post("/local-payment", async (req, res) => {
    const { userId, recipient, amount, accountNumber, currency } = req.body;
    console.log(`Local payment attempt for user: ${userId}`);

    // Validate account number
    if (!accountNumber || accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
        console.log(`Invalid account number: ${accountNumber}`);
        return res.status(400).json({ message: "Account number must be 10 digits" });
    }

    try {
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const transactionCollection = await db.collection("transactions");
        const newTransaction = {
            userId: new ObjectId(userId),
            recipient,
            amount: parseFloat(amount),
            currency,
            accountNumber,
            type: "Local Payment",
            date: new Date()
        };

        const result = await transactionCollection.insertOne(newTransaction);

        if (result.acknowledged) {
            console.log(`Local payment processed for user: ${userId}`);
            res.status(200).json({ message: "Local payment processed successfully" });
        } else {
            console.log(`Failed to process local payment for user: ${userId}`);
            res.status(400).json({ message: "Failed to process payment" });
        }
    } catch (error) {
        console.error("Local payment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//---------------------International payment
router.post("/international-payment", async (req, res) => {
    const { userId, recipient, amount, accountNumber, currency, swiftCode } = req.body;
    const swiftCodePattern = /^[A-Z0-9]{11}$/; //regex pattern for swift code

    if (!validatePattern(accountNumberPattern, accountNumber)) {
        return res.status(400).json({ message: "Account number must be exactly 10 digits" });
    }
    if (!validatePattern(swiftCodePattern, swiftCode)) {
        return res.status(400).json({ message: "SWIFT code must be 11 characters" });
    }
    try {
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const transactionCollection = await db.collection("transactions");
        const newTransaction = {
            userId: new ObjectId(userId),
            recipient,
            amount: parseFloat(amount),
            currency,
            accountNumber,
            swiftCode,
            type: "International Payment",
            date: new Date()
        };

        const result = await transactionCollection.insertOne(newTransaction);

        if (result.acknowledged) {
            console.log(`International payment processed for user: ${userId}`);
            res.status(200).json({ message: "International payment processed successfully" });
        } else {
            console.log(`Failed to process international payment for user: ${userId}`);
            res.status(400).json({ message: "Failed to process payment" });
        }
    } catch (error) {
        console.error("International payment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//------------------Fetch user transactions
router.get("/transactions/:userId", async (req, res) => {
    const userId = req.params.userId;
    console.log(`Fetching transactions for user: ${userId}`);

    try {
        const transactionCollection = await db.collection("transactions");
        const transactions = await transactionCollection
            .find({ userId: new ObjectId(userId) })
            .sort({ date: -1 })
            .limit(10)
            .toArray();

        console.log(`Fetched ${transactions.length} transactions for user: ${userId}`);
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

//------------------------Employee Login route
router.post("/employee/login", bruteforce.prevent, async (req, res) => {
    const { identifier, password } = req.body;
    console.log(`Employee login attempt for: ${identifier}`);

    try {
        const collection = await db.collection("employees");
        const employee = await collection.findOne({ 
            $or: [{ username: identifier }, { email: identifier }]
        });

        // Check if employee exists
        if (!employee) {
            console.log(`Employee not found: ${identifier}`);
            return res.status(401).json({ message: "Employee not found" });
        }

        console.log(`Employee found: ${employee.username}`);

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, employee.password);

        if (!passwordMatch) {
            console.log(`Password mismatch for employee: ${employee.username}`);
            return res.status(401).json({ message: "Password does not match" });
        }
        
        console.log(`Password match for employee: ${employee.username}`);

        // Authentication successful
        const token = jwt.sign(
            { employeeId: employee._id, username: employee.username },
            process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is",
            { expiresIn: "1h" }
        );

        // Log the token to the console
        console.log(`Token generated for employee: ${employee.username}: ${token}`);

        // Respond to the client with the token and employee details
        res.status(200).json({ 
            message: "Authentication successful", 
            token, 
            employeeId: employee._id,
            username: employee.username,
            firstName: employee.firstName,
            lastName: employee.lastName
        });

        console.log(`Login successful for employee: ${employee.username}`);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


//-------------------Employee Dashboard 
router.get("/employee-dashboard", async (req, res) => {
    try {
        const employeeCollection = await db.collection("employees");
        const transactionCollection = await db.collection("transactions");

        // Example data to display on the dashboard
        const pendingTransactions = await transactionCollection
            .find({ status: "pending" })
            .toArray();
        const employeeCount = await employeeCollection.countDocuments();

        // Construct the response with relevant data
        res.status(200).json({
            pendingTransactions,
            employeeCount,
            message: "Employee dashboard data fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching employee dashboard data:", error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
});

//-------------------Add Employee
router.post("/add-employee", async (req, res) => {
    console.log("Request received at /add-employee");
    try {
        const { firstName, lastName, email, username, password, role } = req.body;

        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !username || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employeeCollection = await db.collection("employees");

        // Check if username or email already exists
        const existingEmployee = await employeeCollection.findOne({ 
            $or: [{ username }, { email }]
        });
        if (existingEmployee) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new employee document
        const newEmployee = {
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            role,
            createdAt: new Date()
        };

        const result = await employeeCollection.insertOne(newEmployee);
        res.status(201).json({ message: "Employee added successfully", employeeId: result.insertedId });
    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({ message: "Internal server error" });
        console.log("Request Body:", req.body);

    }
});

export default router;