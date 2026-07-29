const express = require("express");
const protect = require("../middlewares/authMiddlewares");
const {
  getProfile,
  saveProfile,
  scanJobDescription,
  getGoals,
  saveGoals,
} = require("../controllers/careerController");

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", saveProfile);
router.post("/jd-scan", scanJobDescription);
router.get("/goals", getGoals);
router.put("/goals", saveGoals);

module.exports = router;
