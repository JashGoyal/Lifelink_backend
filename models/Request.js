const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bloodGroup: {
        type: String,
        required: true,
    },
    units: {
        type: Number,
        required: true,
    },
    urgency: {
        type: String,
        enum: ["normal", "urgent", "emergency"],
        default: "normal",
    },
    hospital: {
        name: String,
        address: String,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "completed"],
        default: "pending",
    },
    matchedDonors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    acceptedDonors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    ratedDonors: [
        {
            donorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            rating: Number
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);