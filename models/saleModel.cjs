const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  classAmount: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Sale", saleSchema);