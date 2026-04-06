const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true,
    unique: true
  },
  className: {
    type: String,
    required: true
  },
  instructorId: {
    type: String,
    default: ""
  },
  classType: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  daytime: [
    {
      day: String,
      time: String,
      duration: Number
    }
  ]
});

module.exports = mongoose.model("YogaClass", classSchema);