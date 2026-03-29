const Request = require("../models/Request");
const User = require("../models/user");
const Notification = require("../models/Notification");

const isEligible = require("../utils/eligibility");
const isCompatible = require("../utils/bloodCompatibility");

const sendEmail = require("../utils/sendEmail");
const {
    bloodRequestTemplate,
    donorAcceptedTemplate,
    requestCompletedTemplate
} = require("../utils/emailTemplates");


// ================= CREATE REQUEST =================
exports.createRequest = async (req, res) => {
    try {
        const { bloodGroup, units, urgency, hospital } = req.body;

        // Create request
        const request = await Request.create({
            requester: req.user._id,
            bloodGroup,
            units,
            urgency
        });

        // Fetch donors
        const donors = await User.find({
            role: "donor",
            isAvailable: true,
            "location.city": {
                $regex: new RegExp(`^${req.user.location.city}$`, "i")
            }
        });

        console.log("donors ", donors)
        // Filter matching donors
        const matchedDonors = donors.filter((donor) => {
            return (
                isCompatible(donor.bloodGroup, bloodGroup) &&
                isEligible(donor.lastDonationDate)
            );
        });
        console.log("matchedDonors ", matchedDonors)

        // Save matched donors
        request.matchedDonors = matchedDonors.map(d => d._id);
        await request.save();

        // ================= DATABASE NOTIFICATIONS =================
        const notifications = matchedDonors.map(donor => ({
            user: donor._id,
            message: `Urgent blood request for ${bloodGroup} in your city`,
            type: "request"
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // ================= EMAIL NOTIFICATIONS =================
        await Promise.all(
            matchedDonors.map(donor =>
                sendEmail(
                    donor.email,
                    "🚨 Urgent Blood Needed",
                    bloodRequestTemplate(donor.name, bloodGroup)
                )
            )
        );

        res.status(201).json({
            message: "Request created successfully",
            matchedDonors,
            request,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// ================= ACCEPT REQUEST =================
exports.acceptRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: "Request not found" });
        }
        console.log(isEligible(req.user.lastDonationDate))
        // Eligibility check
        if (!isEligible(req.user.lastDonationDate)) {
            return res.status(400).json({ msg: "Not eligible yet" });
        }

        // Compatibility
        if (!isCompatible(req.user.bloodGroup, request.bloodGroup)) {
            return res.status(400).json({ msg: "Not compatible" });
        }

        // Already accepted
        if (request.acceptedDonors.includes(req.user._id)) {
            return res.status(400).json({ msg: "Already accepted" });
        }

        // Limit check
        if (request.acceptedDonors.length >= request.units) {
            return res.status(400).json({ msg: "Already fulfilled" });
        }

        // Add donor
        request.acceptedDonors.push(req.user._id);

        // Save donor availability
        req.user.isAvailable = false;
        await req.user.save();

        // ================= WHEN FULLFILLED =================
        if (request.acceptedDonors.length === request.units) {

            request.status = "accepted";

            // Get full donor details
            const donors = await User.find({
                _id: { $in: request.acceptedDonors }
            });

            const requester = await User.findById(request.requester);

            // ================= EMAIL TO RECEIVER =================
            let donorListHTML = donors.map(d =>
                `<li>${d.name} - ${d.email}</li>`
            ).join("");

            await sendEmail(
                requester.email,
                "Donors Found for Your Request",
                `
                <h2>✅ Donors Available</h2>
                <p>Below are the donors who accepted your request:</p>
                <ul>${donorListHTML}</ul>
                <p>Please contact them to proceed.</p>
                `
            );

            // ================= EMAIL TO DONORS =================
            await Promise.all(
                donors.map(donor =>
                    sendEmail(
                        donor.email,
                        "You Have Been Selected as Donor",
                        `
                        <h2>🩸 Donation Confirmed</h2>
                        <p>Hello ${donor.name},</p>
                        <p>You have been selected for a blood donation.</p>
                        <p>The receiver will contact you shortly.</p>
                        `
                    )
                )
            );
        }

        await request.save();

        res.json({
            message: "Request accepted successfully",
            request,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// ================= COMPLETE REQUEST =================
exports.completeRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate("acceptedDonors");

        if (!request) {
            return res.status(404).json({ msg: "Request not found" });
        }

        request.status = "completed";

        // Update donors
        for (let donor of request.acceptedDonors) {
            donor.lastDonationDate = new Date();
            donor.isAvailable = true;
            await donor.save();
        }

        await request.save();

        const requester = await User.findById(request.requester);

        // ================= EMAIL TO RECEIVER =================
        if (requester?.email) {
            await sendEmail(
                requester.email,
                "🎉 Request Completed",
                requestCompletedTemplate(requester.name)
            );
        }

        // ================= EMAIL TO DONORS =================
        await Promise.all(
            request.acceptedDonors.map(donor =>
                donor.email &&
                sendEmail(
                    donor.email,
                    "🎉 Donation Completed",
                    requestCompletedTemplate(donor.name)
                )
            )
        );

        res.json({
            message: "Request marked as completed",
            request,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// ================= GET REQUESTS FOR DONOR =================
exports.getAllRequestsForDonor = async (req, res) => {
    try {
        const requests = await Request.find({
            status: "pending"
        }).populate("requester", "name"); // ✅ ADD THIS

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({
            requester: req.user._id
        }).populate("acceptedDonors", "name email");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};