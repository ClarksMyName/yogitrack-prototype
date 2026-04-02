const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

router.get("/getPackage", packageController.getPackage);
router.get("/getNextId", packageController.getNextId);
router.post("/add", packageController.add);
router.get("/getPackageIds", packageController.getPackageIds);
router.delete("/deletePackage", packageController.deletePackage);
router.get("/getAll", packageController.getAll);

module.exports = router;