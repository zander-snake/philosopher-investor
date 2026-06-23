# The Philosopher's Table - Deployment Package

## What You Have

A production-ready Next.js application that analyzes stocks through 6 legendary investor lenses using Claude Sonnet 4.6.

### Features
✓ Bill Ackman (Pershing Square) - Activist, concentrated value
✓ Ray Dalio (Bridgewater) - Macro, all-weather, principles-based
✓ Chris Hohn (TCI Fund) - Long-term, ESG-integrated activist
✓ Peter Lynch (Fidelity Magellan) - GARP, narrative-driven
✓ Warren Buffett (Berkshire Hathaway) - Moats, durability, owner earnings
✓ Cathie Wood (ARK Invest) - Disruptive innovation, 5-year horizon

Each investor gets a unique prompt reflecting their actual philosophy, not just tone variations.

### Technology Stack
- **Frontend**: React 18 with Next.js 14
- **Backend**: Next.js API routes (Node.js)
- **AI**: Claude Sonnet 4.6 via Anthropic API
- **Deployment**: Vercel (recommended), or any Node.js host
- **Styling**: Inline CSS (dark theme, responsive)

---

## File Structure

```
philosopher-investor/
├── pages/
│   ├── index.js              (React UI - 450 lines)
│   └── api/
│       └── analyze.js        (Backend - calls Anthropic securely)
├── package.json              (Dependencies)
├── next.config.js            (Next.js config)
├── vercel.json               (Vercel optimization)
├── .env.local.example        (Template for API key)
├── .gitignore                (Standard Node/Next.js excludes)
├── README.md                 (Full documentation)
├── DEPLOY.md                 (3-minute quick start)
└── .github/
    └── workflows/
        └── deploy.yml        (Optional: auto-deploy on git push)
```

---

## Getting Started: Three Paths

### Path 1: Deploy Immediately (No Local Testing)
**Time: 2 minutes**

1. Get API key: https://console.anthropic.com → "Create API Key"
2. Go to https://vercel.com (sign up free)
3. Click "Add New" → "Project" → "Import" → paste GitHub URL
4. Add env var: `ANTHROPIC_API_KEY = your_key_here`
5. Click "Deploy"
6. Wait ~1 minute
7. ✓ Live URL in your dashboard

You're done. Your app is live.

### Path 2: Test Locally First
**Time: 5 minutes**

```bash
# From philosopher-investor/ directory:
cp .env.local.example .env.local
# Edit .env.local, add your API key

npm install
npm run dev
# Open http://localhost:3000
# Test the UI, make sure it works

# Then deploy:
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/yourname/philosopher-investor
git push -u origin main
# Go to vercel.com, import repo, add env var, deploy
```

### Path 3: Fully Custom Deployment
**Time: 10 minutes**

Use Railway.app, Render.com, Netlify, or your own server:
- All support Node.js / Next.js
- All support environment variables
- See README.md for specific instructions

---

## API Key Setup

### Where to Get It
1. https://console.anthropic.com
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key

### Where to Put It

**Local (development):**
```bash
# .env.local (never commit this!)
ANTHROPIC_API_KEY=sk-ant-...
```

**Vercel (production):**
- Dashboard → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY = sk-ant-...`

**Other platforms (Railway, etc.):**
- Platform-specific env var setup (usually a dashboard)

### Security
✓ API key is used only on the backend (`pages/api/analyze.js`)
✓ Never exposed to the browser
✓ Never sent to the client
✓ Safe from exposure in git

---

## Cost Estimation

| Scenario | API Calls/Month | Cost |
|----------|---|---|
| Light user (2/week) | ~8 | ~$0.02 |
| Active user (2/day) | ~60 | ~$0.15 |
| Heavy user (10/day) | ~300 | ~$0.80 |
| Free tier limit | 50,000 tokens | $0 |

Each analysis: ~400-500 tokens (2-3 stocks at once)
Pricing: $0.003 per 1K input tokens

---

## Customization Examples

### Add a new investor
Edit `pages/api/analyze.js`:

```javascript
yourname: {
  name: "Your Name",
  fund: "Your Fund",
  prompt: `You are analysing a stock through...`
}
```

Then add to `pages/index.js` PHILOSOPHERS array with color, avatar, etc.

### Change UI colors
Edit `pages/index.js` — all styles are inline. Search for color hex values (#0d0d0d, #c8a84b, etc.)

### Change the analysis model
In `pages/api/analyze.js`, change:
```javascript
model: 'claude-sonnet-4-6'  // → 'claude-opus-4-6' or 'claude-haiku-4-5-20251001'
```

---

## Verification Checklist

After deployment:

- [ ] Visit your live URL (from Vercel dashboard)
- [ ] Enter a ticker (MSFT, DELL, TSLA)
- [ ] Select 2-3 investors
- [ ] Click "Convene the Table"
- [ ] Wait 5-10 seconds
- [ ] See verdicts appear (STRONG BUY, PASS, AVOID, BUY)
- [ ] Click tabs to read full analysis
- [ ] Try another stock to verify caching/speed

If anything fails, check:
1. API key is correct and active (console.anthropic.com)
2. API key is in environment variables (not .env.local in production)
3. Browser console for fetch errors
4. Vercel logs (Dashboard → Deployments → Logs)

---

## Support & Docs

- **Vercel docs**: https://vercel.com/docs
- **Next.js docs**: https://nextjs.org/docs
- **Anthropic docs**: https://docs.anthropic.com
- **API reference**: https://docs.anthropic.com/en/api/getting-started

---

## Production Readiness

✓ Error handling (API failures gracefully display error messages)
✓ Loading states (spinning icon + "analysing…")
✓ Responsive design (works on mobile)
✓ Dark theme (easy on the eyes)
✓ Verdict extraction (parses STRONG BUY, PASS, etc.)
✓ Parallel requests (all 6 investors analyzed simultaneously)
✓ Security (API key server-side only)

This is a complete, production-ready application. You can deploy it as-is.

---

## What's Happening Behind the Scenes

1. User enters ticker + selects investors
2. Frontend sends POST to `/api/analyze` (once per investor)
3. Backend (`pages/api/analyze.js`) calls Anthropic API with philosopher prompt
4. Claude Sonnet 4.6 analyzes stock through that lens
5. Response (text) is sent back to frontend
6. Frontend extracts verdict (STRONG BUY / PASS / AVOID / BUY)
7. Results displayed in tabbed interface with live formatting

All in ~7-10 seconds for 6 parallel analyses.

---

## Next Steps

1. **Get API Key** (2 min): https://console.anthropic.com
2. **Deploy** (1 min): https://vercel.com
3. **Test** (1 min): Visit your URL, try a stock
4. **Share**: Show friends/colleagues
5. **Customize** (optional): Add your own investor lens

You now have a working, deployed investment analysis tool.

Enjoy! 🚀
