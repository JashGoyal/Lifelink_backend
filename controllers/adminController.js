const User = require("../models/user");
const Request = require("../models/Request");
const sendEmail = require("../utils/sendEmail");
const {
    adminApprovedTemplate,
    adminRejectedTemplate
} = require("../utils/emailTemplates");

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonors = await User.countDocuments({ role: "donor" });

        const totalRequests = await Request.countDocuments();
        const pendingRequests = await Request.countDocuments({ status: "pending" });
        const completedRequests = await Request.countDocuments({ status: "completed" });

        res.json({
            totalUsers,
            totalDonors,
            totalRequests,
            pendingRequests,
            completedRequests
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 👇 YOUR FUNCTION GOES HERE
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// BLOCK / UNBLOCK USER
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            message: `User ${user.isBlocked ? "blocked" : "unblocked"}`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL REQUESTS
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("requester", "name email")
            .populate("acceptedDonors", "name email");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminRequests = async (req, res) => {
    const users = await User.find({
        requestedRole: "admin",
        status: "pending"
    });

    res.json(users);
};

exports.approveAdmin = async (req, res) => {
    const user = await User.findById(req.params.id);

    user.role = "admin";
    user.status = "active";
    user.requestedRole = null;

    await user.save();
    await sendEmail(
        user.email,
        "Admin Approved",
        adminApprovedTemplate(user.name)
    );
    res.json({ msg: "Admin approved" });
};

exports.rejectAdmin = async (req, res) => {
    const user = await User.findById(req.params.id);

    user.requestedRole = null;
    user.status = "active";

    await user.save();
    await sendEmail(
        user.email,
        "Admin Rejected",
        adminRejectedTemplate(user.name)
    );
    res.json({ msg: "Admin request rejected" });
};