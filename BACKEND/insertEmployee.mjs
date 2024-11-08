import bcrypt from 'bcrypt';
import { db, client } from './db/conn.mjs';

async function insertEmployee() {
  const employeesCollection = db.collection("employees");

  // Define the employee details
  const username = "DonJohn"; 
  const password = "DonEmployee123"; 
  const email = "donJohn@gmail.com";
  const name = "Don John";
  const role = "employee";

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the employee document
    const employee = {
      username,
      password: hashedPassword,
      email,
      name,
      role
    };

    const result = await employeesCollection.insertOne(employee);
    console.log("Employee inserted with _id:", result.insertedId);
  } catch (error) {
    console.error("Error inserting employee:", error);
  } finally {
    // Close the database connection
    await client.close();
  }
}

insertEmployee();
