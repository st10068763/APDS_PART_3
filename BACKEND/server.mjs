import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import posts from "./routes/post.mjs";
import users from "./routes/user.mjs";
import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import dbClient from './db/conn.mjs';
import transactions from './routes/transactions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { db } = dbClient;
const PORT = 3001;
const app = express();

// CORS configuration to allow frontend access
app.use(cors({
  origin: 'https://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use("/api/post", posts);
app.use("/api/user", users);
app.use("/transactions", transactions);

// Route for creating an employee
app.post('/api/user/createEmployee', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = { email, password: hashedPassword, name, role };
    const employeesCollection = db.collection("employees");
    const result = await employeesCollection.insertOne(employee);

    res.status(201).json({ message: "Employee created successfully", employeeId: result.insertedId });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: "An error occurred while creating the employee" });
  }
});

// Route for logging in an employee
app.post('/api/user/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const employeesCollection = db.collection("employees");
    const employee = await employeesCollection.findOne({ email });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Employee logged in successfully" });
  } catch (error) {
    console.error('Error logging in employee:', error);
    res.status(500).json({ error: "An error occurred while logging in the employee" });
  }
});

// SSL configuration
const keyPath = path.join(__dirname, 'keys', 'privatekey.pem');
const certPath = path.join(__dirname, 'keys', 'certificate.pem');
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Start HTTPS server
const server = https.createServer(options, app);
console.log("Server is running on port:", PORT);
server.listen(PORT);
