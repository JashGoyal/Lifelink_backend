const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const {
    welcomeTemplate,
    adminPendingTemplate
} = require("../utils/emailTemplates");

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role: userRole, bloodGroup, location } = req.body;

        // Check user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let role = userRole;
        let requestedRole = null;
        let status = "active";

        // Admin request logic
        if (userRole === "admin") {
            requestedRole = "admin";
            role = "donor";   // fallback
            status = "pending";
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            requestedRole,
            status,
            bloodGroup,
            location,
        });

        // Welcome email
        await sendEmail(
            user.email,
            "Welcome to Blood Donation System",
            welcomeTemplate(user.name)
        );

        // Admin pending email
        if (user.status === "pending") {
            await sendEmail(
                user.email,
                "Admin Request Pending",
                adminPendingTemplate(user.name)
            );
        }

        res.status(201).json({
            token: generateToken(user._id),
            user,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        if (user.status === "pending") {
            return res.status(403).json({
                msg: "Admin request pending approval"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ msg: "User is blocked by admin" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        res.json({
            token: generateToken(user._id),
            user,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};