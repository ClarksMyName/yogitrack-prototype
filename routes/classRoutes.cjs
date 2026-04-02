const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.get("/getClass", classController.getClass);
router.get("/getNextId", classController.getNextId);
router.post("/add", classController.add);
router.get("/getClassIds", classController.getClassIds);
router.delete("/deleteClass", classController.deleteClass);
router.get("/getAll", classController.getAll);

module.exports = router;