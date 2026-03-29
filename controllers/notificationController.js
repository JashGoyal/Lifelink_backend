const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        console.log("REQ.USER:", req.user); 
        
        const notifications = await Notification.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            isRead: true
        });

        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};