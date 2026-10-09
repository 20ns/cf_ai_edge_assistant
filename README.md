# Edge Assistant

[![CI/CD](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml)

An AI assistant on Cloudflare Workers using Llama 3.3 70B, with tool calls and Durable Object memory.

Live demo: https://cf-ai-edge-assistant.ns-2004.workers.dev

## Highlights

- Chat and voice modes with concise, context-aware responses
- Tool calls: http_fetch, durable_object, mock workflows_invoke
- Persistent session memory with basic sensitive-keyword checks
- Structured responses with optional citations
- Runs on Cloudflare Workers
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
- src/memory.ts — Durable Object store with sensitive-keyword checks
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

Stored: conversation history and memory entries.

`MemoryStore` rejects a short list of sensitive keywords in keys and values. These checks do not guarantee that sensitive data is excluded. Conversation history is stored automatically, and writes have no explicit consent check.

## Tools (built-in)

- http_fetch — fetch public data with attribution
- durable_object — read/write stored memory
- workflows_invoke — mock calendar-slot workflow

## Troubleshooting

- No AI responses: verify Workers AI is enabled; model name matches; check `npx wrangler tail`.
- Durable Objects: confirm `MEMORY_STORE` binding and migrations; redeploy.
- CORS: enabled by default; customize in `src/worker.ts` via `corsHeaders()`.

## Tech stack

Cloudflare Workers • TypeScript • Llama 3.3 70B • Durable Objects • Vitest • GitHub Actions

## License

MIT
