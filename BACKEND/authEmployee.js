import jwt from "jsonwebtoken";
import db from "./db/conn.mjs";
import { ObjectId } from "mongodb";

const authEmployee = async (req, res, next) => {
    try {
        // Extract token from authorization header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is");
        req.user = decoded;

        // Check if the user is an employee
        const userCollection = db.collection("users");
        const user = await userCollection.findOne({ _id: new ObjectId(req.user.userId) });

        if (!user || user.role !== "employee") {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }

        next(); // Proceed if the user is an employee
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(401).json({ message: "Invalid token or insufficient permissions" });
    }
};

export default authEmployee;
