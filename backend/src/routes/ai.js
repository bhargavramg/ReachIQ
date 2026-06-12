const express = require('express');
const router = express.Router();
const axios = require('axios');

function fallbackRuleParser(prompt) {
  if (!prompt) return null;
  const lower = prompt.toLowerCase();
  
  const spendingMatch = lower.match(/customers spending over \D*(\d+)/);
  if (spendingMatch) {
    return [{ field: "totalSpent", operator: "gt", value: parseInt(spendingMatch[1], 10) }];
  }

  const scoreMatch = lower.match(/customers with score above \D*(\d+)/);
  if (scoreMatch) {
    return [{ field: "score", operator: "gt", value: parseInt(scoreMatch[1], 10) }];
  }

  const ordersMatch = lower.match(/customers with more than \D*(\d+) orders/);
  if (ordersMatch) {
    return [{ field: "orderCount", operator: "gt", value: parseInt(ordersMatch[1], 10) }];
  }

  const inactiveMatch = lower.match(/inactive customers for \D*(\d+) days/);
  if (inactiveMatch) {
    return [{ field: "daysSinceLastOrder", operator: "gt", value: parseInt(inactiveMatch[1], 10) }];
  }

  const cityMatch = lower.match(/customers from ([a-z]+)/);
  if (cityMatch) {
    const city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
    return [{ field: "city", operator: "equals", value: city }];
  }
  
  return null;
}

async function callGemini(prompt) {
  console.log('Gemini key exists:', !!process.env.GEMINI_API_KEY);

  const payload = {
    contents: [{ 
      parts: [{ text: prompt }] 
    }],
    generationConfig: { 
      temperature: 0.3, 
      maxOutputTokens: 1000 
    }
  };

  console.log('Gemini request payload:', JSON.stringify(payload, null, 2));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Gemini response:', JSON.stringify(response.data, null, 2));
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error response from Gemini:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

router.get('/test', (req, res) => {
  res.json({ success: true, route: 'ai' });
});

router.post('/segment', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('User prompt:', prompt);

    const fallbackFilters = fallbackRuleParser(prompt);
    if (fallbackFilters) {
      console.log('Matched rule-based fallback immediately:', fallbackFilters);
      return res.json({ filters: fallbackFilters });
    }

    const geminiPrompt = `You are a strict CRM filter generator API.
Convert the user's natural language query into a JSON array of segment filters.

CRITICAL RULES:
1. Return ONLY a raw JSON array. No markdown, no text, no backticks.
2. The output must start with [ and end with ].
3. Each object in the array must have exactly three keys: "field", "operator", "value".
4. Do NOT output example filters if they do not match the user query.

AVAILABLE FIELDS & OPERATORS:
- "city" (operator: "equals") -> values: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Jaipur, Ahmedabad, Surat
- "totalSpent" (operators: "gt", "lt", "gte", "lte") -> numeric values
- "orderCount" (operators: "gt", "lt", "gte", "lte") -> numeric values
- "score" (operators: "gt", "lt", "gte", "lte") -> numeric values
- "daysSinceLastOrder" (operators: "gt", "lt") -> numeric values

EXAMPLES:
Input: "Customers spending over 10000"
Output: [{"field":"totalSpent","operator":"gt","value":10000}]

Input: "Customers with score above 80"
Output: [{"field":"score","operator":"gt","value":80}]

Input: "Customers with more than 10 orders"
Output: [{"field":"orderCount","operator":"gt","value":10}]

Input: "Inactive customers for 90 days"
Output: [{"field":"daysSinceLastOrder","operator":"gt","value":90}]

Input: "Customers from Chennai"
Output: [{"field":"city","operator":"equals","value":"Chennai"}]

Now, convert the following input. Return ONLY the JSON array.
Input: "${prompt}"
Output:`;

    const rawText = await callGemini(geminiPrompt);
    console.log('AI raw response:', rawText); // Added requested log

    // Aggressive cleaning
    let cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();

    // Find the JSON array boundaries
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');

    if (start === -1 || end === -1) {
      console.error('No JSON array in Gemini response:', rawText);
      const fallback = fallbackRuleParser(prompt);
      if (fallback) return res.json({ filters: fallback });
      return res.json({ filters: [], error: 'Could not parse AI response' });
    }

    const jsonStr = cleaned.substring(start, end + 1);

    const filters = JSON.parse(jsonStr);
    console.log('Parsed filters:', JSON.stringify(filters, null, 2)); // Added requested log

    if (!Array.isArray(filters)) {
      console.error('Parsed result is not an array:', filters);
      const fallback = fallbackRuleParser(prompt);
      if (fallback) return res.json({ filters: fallback });
      return res.json({ filters: [], error: 'Could not parse AI response' });
    }

    res.json({ filters });

  } catch (err) {
    console.error('AI segment error:', err.message);
    const fallback = fallbackRuleParser(req.body.prompt);
    if (fallback) return res.json({ filters: fallback });
    res.json({ filters: [], error: err.message });
  }
});

router.post('/draft', async (req, res) => {
  try {
    const { segmentDescription, prompt, channel, brandName } = req.body;
    console.log('Incoming prompt:', prompt); // Log User prompt

    const sysPrompt = `You are a marketing copywriter for an Indian D2C brand called ${brandName}. Write exactly 3 short personalized campaign message variants for ${channel}.
Target audience: ${segmentDescription}
Campaign Goal / Details: ${prompt || 'Create an engaging message for this audience'}

Rules:
- Generate exactly 3 unique variants.
- Visibly include details from the user prompt (discount percentage, coupon code, cashback amount, expiry date, segment).
- Maximum 160 characters each.
- Use {{name}} for customer name personalization.
- Warm, friendly, conversational Indian tone.
- Include a clear call to action.
- Use ₹ for currency if mentioning prices.

Return ONLY valid JSON.
Format:
{
  "variants": [
    "message 1",
    "message 2",
    "message 3"
  ]
}

No markdown.
No code blocks.
No explanations.
Only JSON.`;

    let text = await callGemini(sysPrompt);
    console.log('AI raw response:', text); // Log raw AI response

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let drafts = [];
    try {
      const parsed = JSON.parse(text);
      if (parsed.variants && Array.isArray(parsed.variants)) {
        drafts = parsed.variants;
      } else if (Array.isArray(parsed)) {
        drafts = parsed;
      } else {
        throw new Error("Missing 'variants' array in JSON");
      }
    } catch(err) {
      console.error("Gemini parse error", err);
      console.error("Raw Gemini response:", text);
      return res.json({ error: "AI generation failed due to invalid JSON formatting. Please try again." });
    }

    console.log('Parsed variants:', drafts); // Log parsed variants

    if (drafts.length === 0) {
      return res.json({ error: "AI failed to generate variants." });
    }

    res.json({ drafts });
  } catch (error) {
    console.error('Draft generation error:', error.message);
    
    let exactReason = "AI generation unavailable.";
    if (!process.env.GEMINI_API_KEY) {
      exactReason = "Missing API key.";
    } else if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        exactReason = "Rate limit exceeded.";
      } else if (status === 400) {
        exactReason = "Invalid request.";
      } else {
        exactReason = `API Error: ${status}`;
      }
    } else if (error.request) {
      exactReason = "Network error.";
    } else {
      exactReason = `Error: ${error.message}`;
    }

    res.json({ 
      error: `${exactReason} Using fallback templates.`, 
      drafts: [
        'Hi {{name}}, check our latest offers!',
        'Hey {{name}}, exclusive deals just for you!',
        'Hi {{name}}, don\'t miss out on our special discounts!'
      ] 
    });
  }
});

router.post('/insight', async (req, res) => {
  try {
    const { campaignName, stats } = req.body;
    const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0;
    const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0;

    const sysPrompt = `You are a CRM performance analyst for an Indian D2C brand.
Campaign: ${campaignName}
Stats: Sent=${stats.sent}, Delivered=${stats.delivered}, Opened=${stats.opened}, Clicked=${stats.clicked}, Failed=${stats.failed}
Open rate: ${openRate}%, Click rate: ${clickRate}%

Write exactly 2 sentences:
1. What the numbers mean (be specific with percentages)
2. One concrete recommended next action

Be direct, no fluff. Mention specific numbers.`;

    const insight = await callGemini(sysPrompt);
    res.json({ insight: insight.trim() });
  } catch (error) {
    console.error(error);
    res.json({ insight: "Data suggests average performance. Continue monitoring and consider A/B testing next time." });
  }
});

router.post('/copilot', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (message === 'mock_429') {
      return res.status(429).json({
        success: false,
        errorType: "RATE_LIMIT",
        retryAfter: 48,
        reply: `Gemini API rate limit reached.\nPlease retry in 48 seconds.`
      });
    }
    let sysPrompt;
    if (message.toLowerCase().includes('generate campaign') || message.toLowerCase().includes('create campaign')) {
      sysPrompt = `You are an AI CRM copilot for ReachIQ, an Indian D2C brand marketing platform.
Generate a marketing campaign for the current audience context:
- Audience Name: ${context.audience?.name || 'High Value Churn Risk'}
- Customer Count: ${context.audience?.customerCount || '43'}
- Revenue Opportunity: ${context.audience?.revenueOpportunity || '₹45,000'}

Please generate:
1. Campaign Name: A creative, catchy campaign name.
2. Recommended Channel: The best channel (e.g., WhatsApp, Email, or SMS).
3. Subject Line: An engaging subject line (especially if Email is recommended).
4. Message Body: A personalized message body (using {{name}} for name personalization) with a warm D2C Indian brand tone.
5. CTA: A clear, compelling call to action.

Format your output exactly as follows (using markdown bolding):
**Campaign Name:** [Campaign Name]
**Recommended Channel:** [Recommended Channel]
**Subject Line:** [Subject Line]
**Message Body:** [Message Body]
**CTA:** [CTA]

Be concise and direct.`;
    } else {
      sysPrompt = `You are an AI CRM copilot for ReachIQ, an Indian D2C brand marketing platform. You have access to this data:
- Total customers: ${context.totalCustomers}
- Total campaigns: ${context.totalCampaigns}
- Recent campaign stats: ${JSON.stringify(context.recentStats)}
- Current audience context:
  * Name: ${context.audience?.name || 'N/A'}
  * Customer count: ${context.audience?.customerCount || 'N/A'}
  * Revenue opportunity: ${context.audience?.revenueOpportunity || 'N/A'}
  * Campaign metrics: ${JSON.stringify(context.audience?.campaignMetrics || {})}

The marketer asks: '${message}'

Respond helpfully in 2-3 sentences max.
If they ask to find customers or create a segment, suggest specific filter rules (e.g. totalSpent > 10000, days_since_last_order > 60).
If they ask about performance, give specific numbers from the context.
Be conversational and actionable.`;
    }

    const reply = await callGemini(sysPrompt);
    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("Gemini Copilot Error Details:", error.response ? JSON.stringify(error.response.data, null, 2) : error);
    
    if (error.response && error.response.status === 429) {
      const retryAfterHeader = error.response.headers?.['retry-after'];
      let retryAfter = 48; // default to 48s as requested
      if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed)) retryAfter = parsed;
      }
      return res.status(429).json({
        success: false,
        errorType: "RATE_LIMIT",
        retryAfter: retryAfter,
        reply: `Gemini API rate limit reached.\nPlease retry in ${retryAfter} seconds.`
      });
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const detailedError = isDev 
      ? `Error calling Gemini API: ${error.message}${error.response ? ' - ' + JSON.stringify(error.response.data) : ''}`
      : "I'm having trouble analyzing the data right now, please try again later.";
    res.status(500).json({ error: detailedError, reply: detailedError });
  }
});

module.exports = router;
