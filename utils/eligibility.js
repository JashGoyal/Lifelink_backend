const isEligible = (lastDonationDate) => {

    if (!lastDonationDate) return true; // first time donor

    const lastDate = new Date(lastDonationDate);
    const today = new Date();

    const diffTime = today - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    console.log("Days since last donation:", diffDays);
console.log("Check" , diffDays >= 90)
    return diffDays >= 90;  // ✅ FIX
    // return true;
};

module.exports = isEligible;