const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  datetime: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Checkin", checkinSchema);