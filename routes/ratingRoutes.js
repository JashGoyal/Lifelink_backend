const express = require("express");
const router = express.Router();
const { rateDonor } = require("../controllers/ratingController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, rateDonor);

module.exports = router;