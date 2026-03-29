const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            // ❌ FIX: handle null user
            if (!user) {
                return res.status(401).json({ msg: "User not found" });
            }

            // ❌ FIX: check blocked AFTER null check
            if (user.isBlocked) {
                return res.status(403).json({ msg: "User is blocked" });
            }

            req.user = user;

            next();

        } catch (error) {
            return res.status(401).json({ msg: "Invalid token" });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: "No token" });
    }
};

module.exports = protect;