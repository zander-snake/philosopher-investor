# The Philosopher's Table
### Investment analysis through legendary investor lenses

Analyse any stock through the investment philosophies of Warren Buffett, Bill Ackman, Ray Dalio, Chris Hohn, Peter Lynch, and Cathie Wood.

## Features

- **Six investor perspectives** — Each with unique analysis framework
- **Real-time analysis** — Powered by Claude Sonnet 4.6
- **Verdict comparison** — See buy/pass/avoid ratings across all investors
- **Beautiful UI** — Dark theme with interactive tabs and live loading states

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+ and npm
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

1. **Clone or download the project**
   ```bash
   cd philosopher-investor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Enter a stock ticker (e.g., MSFT, DELL, TSLA)
   - Select philosophers and click "Convene the Table"

## Deployment to Vercel (Recommended)

### Option 1: Quick Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fphilosopher-investor&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20Key&envLink=https%3A%2F%2Fconsole.anthropic.com)

### Option 2: Manual Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/philosopher-investor.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add environment variable:
     - Name: `ANTHROPIC_API_KEY`
     - Value: Your API key from console.anthropic.com
   - Click "Deploy"

3. **Your app is live!** Vercel provides a public URL immediately.

### Option 3: Deploy from CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add ANTHROPIC_API_KEY when asked for environment variables
```

## Deployment to Other Platforms

### Railway.app
```bash
# Add railway.json to project root
echo '{"build": {"builder": "nixpacks"}}' > railway.json

# Deploy via Railway dashboard or CLI:
railway up
```

### Netlify
- Not recommended (requires API route proxy setup)

### Docker / Self-Hosted
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## API Keys

Get your Anthropic API key:
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Create an API key
4. Never commit this to git — use environment variables

**Important**: The API key is used server-side only (in `/pages/api/analyze.js`), so it's safe from exposure to the browser.

## Pricing

- Runs on Claude Sonnet 4.6 (~$3-5 per 100 analyses)
- Free tier: 50k tokens/month (plenty for testing)
- See [pricing](https://www.anthropic.com/pricing/claude) for details

## Architecture

```
├── pages/
│   ├── index.js           (React UI component)
│   └── api/
│       └── analyze.js     (Backend API route - calls Anthropic)
├── package.json
├── next.config.js
└── .env.local            (your API key, never commit this)
```

**Key design**: API calls happen on the backend, so your API key is never exposed to the browser.

## Customization

### Add a new investor philosophy

Edit `pages/api/analyze.js`:

```javascript
// Add to PHILOSOPHERS object:
yourname: {
  name: "Your Name",
  fund: "Your Fund",
  prompt: `You are analysing a stock through the lens of...`
}
```

Then add to `pages/index.js` PHILOSOPHERS array:

```javascript
{
  id: "yourname",
  name: "Your Name",
  fund: "Your Fund",
  avatar: "YN",
  color: "#yourcolor",
  accent: "#youraccent",
  tagline: "Your tagline"
}
```

### Change the UI theme
Edit the styles in `pages/index.js` — all colors use CSS hex values, easy to customize.

## Troubleshooting

**API Key not working?**
- Ensure you're using an active API key from console.anthropic.com
- Check `.env.local` is formatted correctly: `ANTHROPIC_API_KEY=sk-...`
- Restart the dev server after changing `.env.local`

**CORS errors when deployed?**
- Not an issue with this setup (API calls are server-side)
- If you see fetch errors, check the browser console for details

**Slow responses?**
- First request takes ~1-2s (cold start)
- Subsequent requests are faster
- On Vercel, add more concurrency by upgrading plan if needed

**"Method not allowed" errors?**
- Ensure you're using POST to `/api/analyze`
- Check the request body includes `ticker`, `companyName`, `philosopherId`

## Development

### Build for production
```bash
npm run build
npm start
```

### Run linter
```bash
npm run lint
```

### Environment variables
```bash
# Local development: use .env.local
# Production (Vercel): set via dashboard
# Never commit .env.local to git
```

## Future Enhancements

- [ ] Real-time financial data integration (Alpha Vantage, Finnhub)
- [ ] Verdict consensus dashboard
- [ ] Export to PDF
- [ ] Historical comparison across multiple stocks
- [ ] User accounts to save analyses
- [ ] Mobile app

## License

MIT — Use freely for personal and commercial projects.

## Support

Issues or questions?
- Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Check Next.js docs: [nextjs.org](https://nextjs.org)
- Check Anthropic docs: [docs.anthropic.com](https://docs.anthropic.com)

---

**Disclaimer**: This tool is for educational purposes. Not financial advice. Always do your own research and consult a financial advisor.
