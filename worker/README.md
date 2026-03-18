# Dev Leaderboard Worker

Cloudflare Worker that proxies leaderboard score submissions to GitHub Actions.

## Setup

1. **Install dependencies**
   ```bash
   cd worker
   npm install
   ```

2. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```

3. **Create a GitHub PAT**
   - Go to https://github.com/settings/tokens
   - Create a **classic** token with `repo` scope
   - Copy the token

4. **Deploy the worker**
   ```bash
   npx wrangler deploy
   ```

5. **Add the GitHub PAT as a secret**
   ```bash
   npx wrangler secret put GITHUB_PAT
   ```
   Paste your PAT when prompted.

6. **Update the frontend**
   After deploying, Cloudflare will give you a URL like:
   ```
   https://dev-leaderboard.YOUR-SUBDOMAIN.workers.dev
   ```
   Update `WORKER_URL` in `index.html` to match.

## How it works

```
Browser → POST score → Cloudflare Worker → repository_dispatch → GitHub Action
                                                                      ↓
Browser ← GET leaderboard.json ← GitHub Pages ← commit leaderboard.json
```

- The Worker holds your GitHub PAT secretly — users never see it
- It validates/sanitizes the score data before forwarding
- CORS is locked to your GitHub Pages origin
