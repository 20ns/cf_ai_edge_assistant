# Quick Fix for Pages Deployment

## Issue
Pages is deploying with `--env development` which doesn't have AI and Durable Objects bindings.

## Solution

### Update Pages Settings:

1. Go to your Pages project settings
2. Find "Build & deploy commands"
3. Change **Deploy command** from:
   ```
   npx wrangler deploy --env development
   ```
   To:
   ```
   npx wrangler deploy
   ```

4. Change **Non-production branch deploy command** from:
   ```
   npx wrangler deploy --env development
   ```
   To:
   ```
   npx wrangler deploy
   ```

OR just use production for both since this is a Worker, not a typical web app.

## Current Deployment

Your worker is live but missing AI and Durable Objects:
**https://cf-ai-edge-assistant.ns-2004.workers.dev**

After fixing the deploy command, trigger a new deployment and you'll have full functionality!
