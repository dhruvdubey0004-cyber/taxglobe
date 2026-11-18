const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        businessType: { type: String, default: 'Freelancer' },
        country: { type: String, default: 'India' },
        monthlyBilling: { type: String, default: '' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        createdAt: { type: Date, default: Date.now }
    }
)

module.exports = mongoose.model("onboarding", onboardingSchema);