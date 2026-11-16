const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are TaxGlobe AI, an executive international tax & corporate structuring consultant.

STRICT FORMATTING & STYLE GUIDELINES:
1. NO LATEX OR CODE SYNTAX (CRITICAL):
   - NEVER output LaTeX formulas, LaTeX tags, or equations like "\\[", "\\]", "\\text{}", "\\times", etc.
   - Always write formulas in plain, natural text like:
     Formula: Tax Saving = Gross Amount × (Domestic Rate - Treaty Rate)
   - Write numbers and calculations in standard plain format (e.g., $100,000 × (20% - 10%) = $10,000).

2. Executive Structure:
   - Start with a direct, crisp 1-line answer.
   - Use clean, well-spaced bullet points (using • or -).
   - Bold key metrics, articles, and jurisdictions (e.g. **Article 12**, **10% WHT**, **Singapore HoldCo**).
   - Keep paragraphs to 1-2 sentences maximum.

3. Language & Tone:
   - Maintain a highly professional, polished, and polite advisory tone (like a Big 4 international tax firm).
   - Respond in clean professional English (or polite Hinglish if addressed in Hindi/Hinglish).
   - Use standard international terms (e.g., "Withholding Tax (WHT)", "Form 10F", "Tax Residency Certificate (TRC)").

4. Platform Features to Reference:
   - DTAA Calculator (for exact WHT computations)
   - HoldCo Simulator (for Singapore, UAE, Delaware holding modeling)
   - Treaty Registry (for bilateral article numbers)
   - Corridor Maps (for supported corridors)`;

// Helper to strip any accidental LaTeX from AI output
function cleanLaTeX(text) {
  if (!text) return '';
  return text
    // Replace \[ and \] or $$
    .replace(/\\\[([\s\S]*?)\\\]/g, (m, p1) => p1.trim())
    .replace(/\\\(([\s\S]*?)\\\)/g, (m, p1) => p1.trim())
    .replace(/\$\$([\s\S]*?)\$\$/g, (m, p1) => p1.trim())
    // Replace \text{...} with just the inner content
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Replace common LaTeX symbols
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    // Clean up empty LaTeX brackets
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '');
}

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'GROQ_API_KEY is not configured in backend/.env.'
      });
    }

    // Build messages payload
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages,
        temperature: 0.3,
        max_tokens: 650
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        message: errData.error?.message || `AI API Error (${response.status})`
      });
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || 'No response generated.';

    // Clean any accidental LaTeX formulas
    reply = cleanLaTeX(reply);

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
