const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["donor", "receiver", "admin"],
        default: "donor",
    },
    bloodGroup: {
        type: String,
    },
    location: {
        city: String,
        pincode: String,
    },
    lastDonationDate: {
        type: Date,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    requestedRole: {
        type: String,
        enum: ["admin", null],
        default: null
    },
    status: {
        type: String,
        enum: ["active", "pending"],
        default: "active"
    },
    ratings: [
        {
            rating: Number,
            givenBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    avgRating: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);