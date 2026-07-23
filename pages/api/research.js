import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RESEARCH_PROMPT = `You are a financial data researcher. Your job is to gather CURRENT, factual market data on a company using web search, and present it as a compact fact sheet. You do NOT give opinions, recommendations, or analysis — facts and figures only.

Search the web for the most recent data you can find, then output a fact sheet in exactly this structure (plain text, no markdown headers):

DATA GATHERED: [today's date]

PRICE & VALUATION
- Share price: [price, currency, and the date of that price]
- Market cap: [figure]
- P/E: [trailing and/or forward, whichever you find]
- Dividend yield: [figure, or "no dividend"]

LATEST RESULTS
- Most recent reported period: [e.g. "Q3 FY2026, ended Oct 2025"]
- Revenue: [figure and year-over-year growth]
- EPS or net income: [figure and growth]
- Free cash flow: [if found]
- Note the company's fiscal year convention if it differs from the calendar year.

GUIDANCE & OUTLOOK
- [Management's most recent guidance, if any]

BALANCE SHEET
- [Net debt / cash position, if found]

RECENT DEVELOPMENTS
- [1-3 bullet points: the most significant company news from the last few months]

Rules:
- Every figure should carry its date or period so the reader knows how fresh it is.
- If you cannot find a data point, write "not found" rather than guessing or using older knowledge.
- Prefer primary or high-quality sources (company IR, major financial data sites).
- Keep the whole fact sheet under 400 words. No commentary, no opinion, no verdict.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, companyName } = req.body;

  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: RESEARCH_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 4,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Gather a current fact sheet for the listed company with ticker ${ticker.toUpperCase()}${companyName ? ` (${companyName})` : ''}. Search for its current share price, valuation, latest reported results, guidance, and recent news.`,
        },
      ],
    });

    // Keep only the text blocks; search/tool blocks are internal machinery
    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!text) {
      return res.status(502).json({ error: 'Research returned no text' });
    }

    res.status(200).json({ research: text });
  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({ error: 'Failed to gather research', details: error.message });
  }
}
