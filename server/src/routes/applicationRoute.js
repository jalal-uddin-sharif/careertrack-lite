const express = require("express");
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getDashboardStats
} = require("../controllers/applicationController");
const protect = require("../middlewares/authMiddlewares");

const router = express.Router();

router.use(protect);

router.get("/dashboard/stats", getDashboardStats);
router.post("/applications", createApplication);
router.get("/applications", getApplications);
router.get("/applications/:id", getApplicationById);
router.patch("/applications/:id", updateApplication);
router.delete("/applications/:id", deleteApplication);

module.exports = router;
