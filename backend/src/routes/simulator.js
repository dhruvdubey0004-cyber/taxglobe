const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/structure/simulate
router.post('/simulate', auth, async (req, res) => {
  try {
    const { customer_location, investor_location, founder_location, business_type } = req.body;

    let structures = [];

    // RULE 1: Customer US + Investor US = Best Case (Tera USP)
    if (customer_location === 'US' && investor_location === 'US') {
      structures = [
        {
          name: "Direct India Structure",
          path: "India -> US",
          effective_tax_rate: 28,
          annual_savings: 0,
          setup_cost: 0,
          pros: ["Simple", "Low setup cost"],
          cons: ["High WHT 30%", "Investor ko pasand nahi"]
        },
        {
          name: "Singapore Intermediate",
          path: "India -> Singapore -> US",
          effective_tax_rate: 12.5,
          annual_savings: 155000,
          setup_cost: 2500,
          pros: ["Low WHT 10%", "Investor friendly", "DTAA benefit"],
          cons: ["Setup cost zyada", "Compliance badhega"],
          recommended: true
        },
        {
          name: "UAE Holding",
          path: "India -> UAE -> US",
          effective_tax_rate: 15,
          annual_savings: 130000,
          setup_cost: 3000,
          pros: ["0% Corporate Tax in UAE", "Good for Gulf investors"],
          cons: ["US se treaty weak hai"]
        }
      ];
    }
    // RULE 2: Customer US + Investor SG / Gulf
    else if (customer_location === 'US' && investor_location === 'SG') {
      structures = [
        {
          name: "Singapore Intermediate",
          path: "India -> Singapore -> US",
          effective_tax_rate: 12.5,
          annual_savings: 155000,
          setup_cost: 2500,
          pros: ["Best for SG investor", "Low WHT"],
          cons: ["Compliance badhega"],
          recommended: true
        },
        {
          name: "Direct India Structure",
          path: "India -> US",
          effective_tax_rate: 28,
          annual_savings: 0,
          setup_cost: 0,
          pros: ["Simple"],
          cons: ["High tax"]
        }
      ];
    }
    // RULE 3: Default - Baaki sab ke liye
    else {
      structures = [
        {
          name: "Direct Structure",
          path: `${founder_location} -> ${customer_location}`,
          effective_tax_rate: 25,
          annual_savings: 0,
          setup_cost: 0,
          pros: ["Simple", "Low cost"],
          cons: ["No treaty benefit"]
        }
      ];
    }

    res.json({
      inputs: { customer_location, investor_location, founder_location, business_type },
      structures
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;