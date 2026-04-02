const express = require("express");
const router = express.Router();
const checkinController = require("../controllers/checkinController.cjs");

router.get("/getCheckin", checkinController.getCheckin);
router.get("/getNextId", checkinController.getNextId);
router.post("/add", checkinController.add);
router.get("/getCheckinIds", checkinController.getCheckinIds);
router.delete("/deleteCheckin", checkinController.deleteCheckin);
router.get("/getAll", checkinController.getAll);

module.exports = router;