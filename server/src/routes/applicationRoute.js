const express = require("express")
const router = express.Router()

const {newApplication} = require("../controllers/applicationController")
const protect = require("../middlewares/authMiddlewares")

router.post("/new-application",protect, newApplication)
module.exports = router;