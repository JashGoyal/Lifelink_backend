const User = require("../models/user");

exports.toggleAvailability = async (req, res) => {
    const user = await User.findById(req.user._id);

    user.isAvailable = !user.isAvailable;

    await user.save();

    res.json({ isAvailable: user.isAvailable });
};