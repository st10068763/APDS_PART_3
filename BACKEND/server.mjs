import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import posts from "./routes/post.mjs";
import users from "./routes/user.mjs";
import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import dbClient from './db/conn.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { db, client } = dbClient;
const PORT = 3001;
const app = express();

// Enable CORS to allow requests from frontend
app.use(cors({
    origin: 'https://localhost:3000', // Allow your frontend's domain
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Middleware to parse incoming JSON requests

// Set CORS headers manually
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Routes
app.use("/post", posts);
app.use("/user", users);

//-----------Route to create an employee
app.post('/createEmployee', async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Get the employees collection from the DB
      const employeesCollection = db.collection("employees");
  
      // Create the employee object
      const employee = {
        email,
        password: hashedPassword,
        name,
        role
      };
  // Insert the employee into the database
  const result = await employeesCollection.insertOne(employee);
    
  // Respond with success
  res.status(201).json({ message: "Employee created successfully", employeeId: result.insertedId });
} catch (error) {
  console.error('Error creating employee:', error);
  res.status(500).json({ error: "An error occurred while creating the employee" });
}
});
//-----------------Route to login an employee
app.post('/loginEmployee', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Get the employees collection from the DB
      const employeesCollection = db.collection("employees");
  
      // Find the employee by email
      const employee = await employeesCollection.findOne({ email });
  
      // If the employee is not found
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      // Compare the passwords
      const isMatch = await bcrypt.compare(password, employee.password);
  
      // If the passwords don't match
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Respond with success
      res.status(200).json({ message: "Employee logged in successfully" });
    } catch (error) {
      console.error('Error logging in employee:', error);
      res.status(500).json({ error: "An error occurred while logging in the employee" });
    }
  });

// Read SSL certificate and key
const keyPath = path.join(__dirname, 'keys', 'privatekey.pem');
const certPath = path.join(__dirname, 'keys', 'certificate.pem');

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

// Create HTTPS server
const server = https.createServer(options, app);

console.log("Server is running on port:", PORT);

// Start the HTTPS server
server.listen(PORT);