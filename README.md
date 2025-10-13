# Edge Assistant

[![CI/CD](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml)

A production-ready AI assistant on Cloudflare Workers using Llama 3.3 70B. It runs at the edge, orchestrates tools safely, and persists memory in Durable Objects with strict privacy filters.

Live demo: https://cf-ai-edge-assistant.ns-2004.workers.dev

## Highlights

- Chat and voice modes with concise, context-aware responses
- Tool orchestration: http_fetch, durable_object, workflows_invoke
- Persistent session and long-term memory with automatic PII/secret filtering
- Deterministic, citation-friendly responses (guardrails and output contract)
- Edge-native performance and cost efficiency on Cloudflare Workers
- TypeScript, tests, and CI/CD from day one

## Quick start

```bash
npm install
npm run dev   # http://localhost:8787
npm test
npm run deploy
```

Requirements: Node.js 18+, Cloudflare account with Workers + Workers AI, Wrangler CLI.

## API

- POST /chat
  - Body: { message, user_id?, session_id?, mode: "chat" | "voice" }
  - Response: { status: "success" | "needs_tool" | "refusal" | "error", message, citations?, tool_calls?, memory_writes?, next_actions? }

- GET /health — health and version info
- GET /memory?user_id=&session_id= — list memory entries
- POST /memory — direct memory operations

## Architecture

Core flow: Request → Worker → AI (Llama 3.3) + Tools + Memory (Durable Objects)

Key files:
- src/worker.ts — routing, orchestration, AI invocation
- src/memory.ts — Durable Object store with privacy filters
- src/tools.ts — http_fetch, durable_object, workflows_invoke
- src/prompt.ts — system constraints and behavior
- src/response.ts — output validation and formatting

Workers AI model (configurable in `src/worker.ts`):

```ts
await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  messages,
  temperature: 0.2,
  top_p: 0.9,
  max_tokens: 1024,
})
```

## Configuration

`wrangler.toml` (essentials):

```toml
name = "cf-ai-edge-assistant"
account_id = "your-account-id"

[ai]
binding = "AI"
remote = true

[[durable_objects.bindings]]
name = "MEMORY_STORE"
class_name = "MemoryStore"

[vars]
ENVIRONMENT = "production"
```

## Memory policy

Stored (with consent): preferences, identifiers (name/company/role), goals, project facts.

Never stored: passwords/tokens/secrets, payment data, PII (e.g., SSN), sensitive health/financial info. Writes are filtered in `MemoryStore`.

## Tools (built-in)

- http_fetch — fetch public data with attribution
- durable_object — read/write session and long-term memory
- workflows_invoke — trigger multi-step tasks (extensible)

## Troubleshooting

- No AI responses: verify Workers AI is enabled; model name matches; check `npx wrangler tail`.
- Durable Objects: confirm `MEMORY_STORE` binding and migrations; redeploy.
- CORS: enabled by default; customize in `src/worker.ts` via `corsHeaders()`.

## Tech stack

Cloudflare Workers • TypeScript • Llama 3.3 70B • Durable Objects • Vitest • GitHub Actions

## License

MIT
