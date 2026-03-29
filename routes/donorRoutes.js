const express = require("express");
const { toggleAvailability } = require("../controllers/donorController");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.put("/toggle-availability", protect, toggleAvailability);
module.exports = router;