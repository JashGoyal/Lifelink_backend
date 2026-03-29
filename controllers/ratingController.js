const User = require("../models/user");
const Request = require("../models/Request");

exports.rateDonor = async (req, res) => {
    try {
        const { donorId, requestId, rating } = req.body;

        const donor = await User.findById(donorId);
        const request = await Request.findById(requestId).populate("acceptedDonors");

        if (!donor || !request) {
            return res.status(404).json({ msg: "Data not found" });
        }

        // ✅ check donor exists
        const exists = request.acceptedDonors.find(
            (d) => d._id.toString() === donorId.toString()
        );

        if (!exists) {
            return res.status(400).json({ msg: "Donor not part of request" });
        }

        if (!request.ratedDonors) request.ratedDonors = [];

        const alreadyRated = request.ratedDonors.some(
            (r) => r.donorId.toString() === donorId.toString()
        );

        if (alreadyRated) {
            return res.status(400).json({ msg: "Already rated" });
        }

        // add rating
        donor.ratings.push({
            rating,
            givenBy: req.user._id
        });

        // update avg
        const total = donor.ratings.reduce((sum, r) => sum + r.rating, 0);
        donor.avgRating = Number((total / donor.ratings.length).toFixed(2));

        // 🔥 STORE RATING INFO HERE
        request.ratedDonors.push({
            donorId: donor._id,
            rating: rating
        });

        await donor.save();
        await request.save();
        res.json({ msg: "Rating submitted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};