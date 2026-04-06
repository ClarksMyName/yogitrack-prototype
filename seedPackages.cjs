const mongoose = require("mongoose");
const Package = require("./models/packageModel.cjs");

const MONGODB_URI = process.env.MONGODB_URI || "PASTE_YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE";
const packages = [
  {
    packageId: "P001",
    packageName: "4 Class Pass",
    description: "Valid for 1 month",
    price: 70,
    classAmount: 4
  },
  {
    packageId: "S001",
    packageName: "4 Class Pass for seniors",
    description: "Valid for 1 month",
    price: 60,
    classAmount: 4
  },
  {
    packageId: "P002",
    packageName: "10 Class Pass",
    description: "Valid for 3 months",
    price: 140,
    classAmount: 10
  },
  {
    packageId: "S002",
    packageName: "10 Class Pass for seniors",
    description: "Valid for 3 months",
    price: 120,
    classAmount: 10
  },
  {
    packageId: "P003",
    packageName: "3 months unlimited",
    description: "Valid for 3 months",
    price: 400,
    classAmount: 999
  },
  {
    packageId: "S003",
    packageName: "3 months unlimited for seniors",
    description: "Valid for 3 months",
    price: 360,
    classAmount: 999
  }
];

async function seedPackages() {
  try {
    await mongoose.connect(MONGODB_URI);

    for (const pkg of packages) {
      await Package.updateOne(
        { packageId: pkg.packageId },
        { $set: pkg },
        { upsert: true }
      );
    }

    console.log("Packages seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seedPackages();