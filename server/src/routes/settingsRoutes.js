const express = require("express");
const protect = require("../middlewares/authMiddlewares");
const {
  getGoogleSheetSettings,
  saveGoogleSheetSettings,
} = require("../controllers/settingsController");

const router = express.Router();

router.use(protect);
router.get("/google-sheet", getGoogleSheetSettings);
router.put("/google-sheet", saveGoogleSheetSettings);

module.exports = router;
