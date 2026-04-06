const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "member"
  },
  customerId: {
    type: String,
    unique: true,
    sparse: true
  }
});

module.exports = mongoose.model("User", userSchema);