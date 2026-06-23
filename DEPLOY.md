# Deploy in 3 Minutes

## Step 1: Get an API Key (2 minutes)

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key (looks like `sk-...`)

## Step 2: Deploy to Vercel (1 minute)

### Option A: Button Deploy (Simplest)
Click this button once you have your API key ready:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fphilosopher-investor&env=ANTHROPIC_API_KEY)

When prompted:
- Paste your API key in the `ANTHROPIC_API_KEY` field
- Click "Deploy"
- Wait ~1 minute
- Done! You get a live URL

### Option B: CLI Deploy
```bash
npm install -g vercel
vercel
# Follow prompts, paste API key when asked
```

### Option C: From GitHub
1. Push code to GitHub
2. Go to vercel.com
3. Click "Add New" → "Project"
4. Select your repo
5. Add `ANTHROPIC_API_KEY` env var
6. Deploy

## Step 3: Use It

Visit your new URL and start analyzing stocks!

---

**That's it.** Your app is now live and accessible worldwide.

### Local Testing First? (Optional)

```bash
cp .env.local.example .env.local
# Edit .env.local and add your API key
npm install
npm run dev
# Open http://localhost:3000
```

## Costs

- **First 50,000 tokens free per month** (plenty for testing)
- ~$0.003 per 1K tokens after that
- Typical analysis = ~400 tokens
- So: ~$0.001 per stock analysis

## FAQ

**Q: Is my API key safe?**
A: Yes. The backend (`/pages/api/analyze.js`) calls Claude, so your key never leaves the server.

**Q: Can I run this locally?**
A: Yes, follow the Local Testing section above.

**Q: Can I customize it?**
A: Absolutely. See README.md for adding new investors or changing UI.

**Q: What if I hit rate limits?**
A: Unlikely. You'd need ~50 analyses per minute. Normal usage is fine.

**Q: How long does an analysis take?**
A: ~5-10 seconds per investor (parallel requests).

---

Questions? Check the full README.md or visit docs.anthropic.com
