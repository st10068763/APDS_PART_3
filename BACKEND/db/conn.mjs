import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

let db;

try {
    await client.connect();
    console.log('mongoDB is CONNECTED!!!');
    db = client.db("users"); 
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

// Default export of db and client
export default { db, client }; 
