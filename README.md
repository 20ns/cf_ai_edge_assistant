# Edge Assistant

A fast, helpful Cloudflare-edge AI that handles chat + voice, orchestrates tasks via Workflows, persists short- and long-term memory in Durable Objects, and never hallucinates tools or data access.

## Features

- **Multi-Modal Interaction**: Supports both chat and voice modes
- **Tool System**: 
  - `http_fetch`: Fetch public data with attribution
  - `durable_object`: Persistent memory storage (session and long-term)
  - `workflows_invoke`: Multi-step task orchestration
- **Memory Management**: Session and long-term memory via Durable Objects
- **AI Model**: Uses Cloudflare's Llama 3.3 70B Instruct FP8 Fast
- **Edge-Native**: Runs on Cloudflare Workers for global low-latency
- **Privacy-First**: Filters sensitive data, follows strict memory policies

## Architecture

```
┌─────────────────┐
│   User Request  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Worker.ts      │ ◄─── Main entry point
│  (Routes)       │
└────────┬────────┘
         │
         ├──► Chat/Voice Handler
         │    └─► Process Request
         │         ├─► Build System Prompt
         │         ├─► Get Memory Context
         │         ├─► Call Cloudflare AI
         │         ├─► Execute Tools
         │         └─► Update Memory
         │
         ├──► Tools System
         │    ├─► http_fetch
         │    ├─► durable_object
         │    └─► workflows_invoke
         │
         └──► Durable Objects
              └─► MemoryStore
                   ├─► Session Memory
                   └─► Long-term Memory
```

## API Endpoints

### POST /chat
Chat with the assistant.

**Request:**
```json
{
  "message": "Your message here",
  "user_id": "optional-user-id",
  "session_id": "optional-session-id",
  "mode": "chat"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Assistant's response",
  "citations": [
    {
      "title": "Source Title",
      "source": "https://example.com",
      "detail": "Additional context"
    }
  ],
  "tool_calls": [],
  "memory_writes": [],
  "next_actions": ["Suggested next steps"]
}
```

### POST /voice
Voice interaction (same format as /chat, mode automatically set to "voice").

### GET /memory
List memory entries for a user/session.

**Query Parameters:**
- `user_id`: User identifier (default: "anonymous")
- `session_id`: Session identifier (default: "default")

### GET /health
Health check endpoint.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Login to Cloudflare:
```bash
npx wrangler login
```

3. Configure your Cloudflare account ID in `wrangler.toml`:
```toml
account_id = "your-account-id"
```

### Development

Run the development server:
```bash
npm run dev
```

The worker will be available at `http://localhost:8787`.

### Testing

Test the chat endpoint:
```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! What can you help me with?",
    "user_id": "test-user",
    "session_id": "test-session"
  }'
```

Test with a tool call:
```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fetch data from https://api.github.com/repos/cloudflare/workers-sdk",
    "user_id": "test-user"
  }'
```

Test memory:
```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Remember that my name is Alice and I prefer metric units",
    "user_id": "test-user"
  }'

# Later, retrieve memory
curl "http://localhost:8787/memory?user_id=test-user"
```

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

Your worker will be deployed to: `https://edge-assistant.<your-subdomain>.workers.dev`

## Configuration

### Environment Variables

Set in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
```

### AI Model Configuration

The AI model and parameters are configured in `src/worker.ts`:

```typescript
const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  messages: messages,
  temperature: 0.2,
  top_p: 0.9,
  max_tokens: 1024
});
```

You can adjust:
- `temperature`: Lower values (0.0-0.5) for more focused responses
- `top_p`: Nucleus sampling parameter (0.0-1.0)
- `max_tokens`: Maximum response length

## Memory Policy

### What Gets Stored

The assistant will store:
- ✅ User preferences (tone, units, locale)
- ✅ Stable identifiers (name, company, role) *with consent*
- ✅ Goals and active tasks
- ✅ Facts about ongoing projects

### What NEVER Gets Stored

- ❌ Passwords, tokens, secrets
- ❌ Payment data
- ❌ Sensitive health or financial details

The MemoryStore Durable Object has built-in filtering to reject sensitive data.

## Tool System

### Available Tools

1. **http_fetch**: Fetch public data
   ```json
   {
     "tool": "http_fetch",
     "args": {
       "url": "https://api.example.com/data",
       "method": "GET",
       "headers": {},
       "body": null
     }
   }
   ```

2. **durable_object**: Memory operations
   ```json
   {
     "tool": "durable_object",
     "args": {
       "op": "write",
       "key": "user_preferences",
       "value": { "theme": "dark", "units": "metric" },
       "scope": "long_term"
     }
   }
   ```

3. **workflows_invoke**: Run workflows
   ```json
   {
     "tool": "workflows_invoke",
     "args": {
       "name": "find_calendar_slots",
       "input": {
         "attendees": ["user@example.com"],
         "duration_minutes": 30,
         "week_of": "2025-10-20",
         "time_preference": "morning"
       }
     }
   }
   ```

## Constraints & Guardrails

- **Truthfulness**: Cites sources and admits uncertainty
- **Privacy**: Never stores sensitive data
- **Tool Safety**: Only calls declared tools
- **No Hallucination**: Doesn't promise capabilities it doesn't have
- **Format Integrity**: Always follows the output contract

## Voice Mode

When `mode: "voice"` is specified:
- Responses are shorter and more conversational
- Avoids long lists
- Confirms irreversible actions
- Breaks responses into <15s segments

## Project Structure

```
edge-assistant/
├── src/
│   ├── worker.ts         # Main Worker entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── memory.ts         # Durable Object for memory
│   ├── tools.ts          # Tools system implementation
│   ├── prompt.ts         # System prompt and constraints
│   └── response.ts       # Response formatter
├── package.json          # Dependencies
├── wrangler.toml         # Cloudflare Workers config
├── tsconfig.json         # TypeScript config
├── PROMPT.md             # Original prompt specification
└── README.md             # This file
```

## Troubleshooting

### AI not responding
- Check that your Cloudflare account has AI enabled
- Verify the model name is correct
- Check logs: `npx wrangler tail`

### Durable Objects not working
- Ensure migrations are applied in `wrangler.toml`
- Check that `MEMORY_STORE` binding is configured
- Redeploy: `npm run deploy`

### CORS errors
- CORS is enabled by default for all origins
- Customize in `src/worker.ts` `corsHeaders()` function

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code follows the existing style
- All constraints from PROMPT.md are respected
- Memory policy is enforced
- Tools don't hallucinate capabilities

## Support

For issues or questions:
1. Check the [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
2. Review the [AI documentation](https://developers.cloudflare.com/workers-ai/)
3. Open an issue in this repository
