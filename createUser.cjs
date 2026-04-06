const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Models/userModel.cjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/yogidb";

async function createUser() {
  try {
    await mongoose.connect(MONGODB_URI);

    const username = "admin";
    const plainPassword = "test123";

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await User.create({
      username,
      passwordHash,
      role: "admin"
    });

    console.log("User created successfully.");
    console.log("Username: admin");
    console.log("Password: test123");

    process.exit(0);
  } catch (err) {
    console.error("Error creating user:", err.message);
    process.exit(1);
  }
}

createUser();