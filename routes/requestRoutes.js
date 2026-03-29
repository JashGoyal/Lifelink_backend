const express = require("express");
const router = express.Router();

const {
    createRequest,
    acceptRequest,
    completeRequest,
    getAllRequestsForDonor, 
    getMyRequests
} = require("../controllers/requestController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// CREATE REQUEST (Receiver)
router.post("/", protect, authorizeRoles("receiver", "admin"), createRequest);

// ACCEPT REQUEST (Donor)
router.put("/:id/accept", protect, authorizeRoles("donor"), acceptRequest);

// COMPLETE REQUEST (Receiver/Admin)
router.put("/:id/complete", protect, authorizeRoles("receiver", "admin"), completeRequest);

router.get("/", protect, authorizeRoles("donor"), getAllRequestsForDonor);
router.get("/my", protect, getMyRequests);

module.exports = router;