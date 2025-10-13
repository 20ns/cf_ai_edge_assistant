# Edge Assistant# Edge Assistant# Edge Assistant# Edge Assistant



[![CI/CD](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml)



A conversational AI assistant running on Cloudflare Workers with Llama 3.3 70B, featuring persistent memory via Durable Objects and a flexible tool system.[![CI/CD](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/20ns/cf_ai_edge_assistant/actions/workflows/ci-cd.yml)



**Live:** [cf-ai-edge-assistant.ns-2004.workers.dev](https://cf-ai-edge-assistant.ns-2004.workers.dev)



## FeaturesA production-ready AI assistant built on Cloudflare Workers that combines conversational AI with persistent memory and intelligent tool orchestration. Designed for low-latency edge deployment with strict privacy guarantees.A production-ready AI assistant built on Cloudflare Workers that combines conversational AI with persistent memory and intelligent tool orchestration. Designed for low-latency edge deployment with strict privacy guarantees.A fast, helpful Cloudflare-edge AI that handles chat + voice, orchestrates tasks via Workflows, persists short- and long-term memory in Durable Objects, and never hallucinates tools or data access.



- Multi-modal interface (chat/voice) with context-aware responses

- Persistent memory with automatic privacy filtering (blocks credentials, PII, payment data)

- Tool orchestration (HTTP fetch, memory ops, workflow invocations)## Overview

- Edge-native deployment with <50ms latency globally

- Full test coverage (47 tests) with automated CI/CD



## Quick StartEdge Assistant demonstrates modern serverless architecture by integrating Cloudflare's AI inference, Durable Objects for state management, and a flexible tool system—all running at the edge for sub-50ms global response times. The project emphasizes security, maintainability, and adherence to well-defined behavioral constraints.## Overview## Features



```bash

npm install

npm run dev          # Local development**Live Demo:** [https://cf-ai-edge-assistant.ns-2004.workers.dev](https://cf-ai-edge-assistant.ns-2004.workers.dev)

npm test            # Run tests

npm run deploy      # Deploy to Cloudflare

```

## Key FeaturesEdge Assistant demonstrates modern serverless architecture by integrating Cloudflare's AI inference, Durable Objects for state management, and a flexible tool system—all running at the edge for sub-50ms global response times. The project emphasizes security, maintainability, and adherence to well-defined behavioral constraints.- **Multi-Modal Interaction**: Supports both chat and voice modes

## API



**POST /chat**

```json- **Multi-Modal AI Interface**: Supports both text chat and optimized voice interactions using Llama 3.3 70B- **Tool System**: 

{

  "message": "your question",- **Persistent Memory**: Session and long-term storage via Durable Objects with built-in privacy filtering

  "user_id": "optional",

  "session_id": "optional",- **Tool Orchestration**: Extensible system for HTTP requests, memory operations, and workflow invocations**Live Demo:** [https://cf-ai-edge-assistant.ns-2004.workers.dev](https://cf-ai-edge-assistant.ns-2004.workers.dev)  - `http_fetch`: Fetch public data with attribution

  "mode": "chat|voice"

}- **Edge-Native Performance**: Deployed globally on Cloudflare's network for consistent low latency

```

- **Production-Grade**: Comprehensive test coverage (47 passing tests), automated CI/CD, proper error handling, and TypeScript throughout  - `durable_object`: Persistent memory storage (session and long-term)

Response follows a strict contract: `status`, `message`, plus optional `citations`, `tool_calls`, `memory_writes`, `next_actions`.



**Other endpoints:** `/health`, `/memory` (GET/POST)

## Architecture## Key Features  - `workflows_invoke`: Multi-step task orchestration

## Architecture



```

Request → Worker → AI (Llama 3.3) + Tools + Memory (Durable Objects)The system follows a clean, modular design:- **Memory Management**: Session and long-term memory via Durable Objects

```



- `worker.ts` - Routing and orchestration

- `memory.ts` - Durable Object with privacy filters```- **Multi-Modal AI Interface**: Supports both text chat and optimized voice interactions using Llama 3.3 70B- **AI Model**: Uses Cloudflare's Llama 3.3 70B Instruct FP8 Fast

- `tools.ts` - HTTP fetch, memory ops, workflow execution

- `prompt.ts` - System constraints and behavioral rulesUser Request → Worker Router → Request Processor

- `response.ts` - Output validation

                                      ↓- **Persistent Memory**: Session and long-term storage via Durable Objects with built-in privacy filtering- **Edge-Native**: Runs on Cloudflare Workers for global low-latency

## CI/CD

                    ┌─────────────────┼─────────────────┐

GitHub Actions runs tests on every push and auto-deploys to Cloudflare when tests pass. Setup requires two secrets:

- `CLOUDFLARE_API_TOKEN`                    ↓                 ↓                 ↓- **Tool Orchestration**: Extensible system for HTTP requests, memory operations, and workflow invocations- **Privacy-First**: Filters sensitive data, follows strict memory policies

- `CLOUDFLARE_ACCOUNT_ID`

              AI Inference      Tool System    Durable Objects

See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for details.

              (Llama 3.3)     (HTTP, Memory)    (Persistence)- **Edge-Native Performance**: Deployed globally on Cloudflare's network for consistent low latency

## Tech Stack

```

Cloudflare Workers • TypeScript • Llama 3.3 70B • Durable Objects • Vitest • GitHub Actions

- **Production-Grade**: Comprehensive test coverage (47 passing tests), proper error handling, and TypeScript throughout## Architecture

---

**Core Components:**

Built to demonstrate serverless edge computing, responsible AI design, and production-ready TypeScript patterns.

- `worker.ts` - Request routing and orchestration

- `memory.ts` - Durable Object implementation with privacy filters

- `tools.ts` - Tool execution engine (HTTP fetch, memory ops, workflows)## Architecture```

- `prompt.ts` - System prompts and behavioral constraints

- `response.ts` - Output contract validation and formatting┌─────────────────┐



## API ReferenceThe system follows a clean, modular design:│   User Request  │



### Chat Endpoint└────────┬────────┘

```bash

POST /chat```         │

Content-Type: application/json

User Request → Worker Router → Request Processor         v

{

  "message": "Your question here",                                      ↓┌─────────────────┐

  "user_id": "optional-user-id",

  "session_id": "optional-session-id",                     ┌─────────────────┼─────────────────┐│  Worker.ts      │ ◄─── Main entry point

  "mode": "chat" // or "voice"

}                    ↓                 ↓                 ↓│  (Routes)       │

```

              AI Inference      Tool System    Durable Objects└────────┬────────┘

**Response Contract:**

```json              (Llama 3.3)     (HTTP, Memory)    (Persistence)         │

{

  "status": "success|needs_tool|refusal|error",```         ├──► Chat/Voice Handler

  "message": "Natural language response",

  "citations": [...],      // optional: sources referenced         │    └─► Process Request

  "tool_calls": [...],     // optional: tools to be executed

  "memory_writes": [...],  // optional: data to persist**Core Components:**         │         ├─► Build System Prompt

  "next_actions": [...]    // optional: suggested next steps

}- `worker.ts` - Request routing and orchestration         │         ├─► Get Memory Context

```

- `memory.ts` - Durable Object implementation with privacy filters         │         ├─► Call Cloudflare AI

### Additional Endpoints

- `GET /health` - Health check and version info- `tools.ts` - Tool execution engine (HTTP fetch, memory ops, workflows)         │         ├─► Execute Tools

- `GET /memory?user_id=x&session_id=y` - Retrieve stored memories

- `POST /memory` - Direct memory operations- `prompt.ts` - System prompts and behavioral constraints         │         └─► Update Memory



## Privacy & Security- `response.ts` - Output contract validation and formatting         │



The system implements strict data handling policies:         ├──► Tools System



**Automatically Filtered:**## API Reference         │    ├─► http_fetch

- Passwords, API tokens, and secrets

- Payment card information         │    ├─► durable_object

- Social security numbers and PII

- Sensitive health/financial data### Chat Endpoint         │    └─► workflows_invoke



**Memory Policy:**```bash         │

- Stores user preferences and project context with explicit consent

- Session memory cleared after timeoutPOST /chat         └──► Durable Objects

- All storage operations logged and auditable

Content-Type: application/json              └─► MemoryStore

## CI/CD Pipeline

                   ├─► Session Memory

The project includes automated GitHub Actions workflows:

{                   └─► Long-term Memory

- ✅ **Automated Testing**: Runs 47 unit tests on every push and pull request

- 🚀 **Continuous Deployment**: Auto-deploys to Cloudflare Workers when tests pass  "message": "Your question here",```

- 🔒 **Quality Gates**: Deployment only proceeds if all tests pass

- 📊 **Build Status**: Visible badge shows current build health  "user_id": "optional-user-id",



See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for configuration details.  "session_id": "optional-session-id", ## API Endpoints



## Technical Highlights  "mode": "chat" // or "voice"



**Testing:** 47 unit tests covering privacy filters, tool validation, output contracts, and configuration}### POST /chat

```bash

npm test  # Runs full test suite via Vitest```Chat with the assistant.

```



**Type Safety:** Full TypeScript implementation with strict mode enabled

**Response Contract:****Request:**

**Performance:** 

- Edge deployment reduces latency to <50ms globally```json```json

- Efficient caching of conversation context (last 5 messages)

- Optimized token usage (1024 token limit with smart truncation){{



**Reliability:**  "status": "success|needs_tool|refusal|error",  "message": "Your message here",

- Graceful error handling with detailed logging

- Automatic retry logic for transient failures  "message": "Natural language response",  "user_id": "optional-user-id",

- CORS support for browser-based clients

  "citations": [...],      // optional: sources referenced  "session_id": "optional-session-id",

## Development

  "tool_calls": [...],     // optional: tools to be executed  "mode": "chat"

```bash

# Install dependencies  "memory_writes": [...],  // optional: data to persist}

npm install

  "next_actions": [...]    // optional: suggested next steps```

# Run locally (http://localhost:8787)

npm run dev}



# Run tests```**Response:**

npm test

```json

# Deploy to production

npm run deploy### Additional Endpoints{

```

- `GET /health` - Health check and version info  "status": "success",

**Requirements:**

- Node.js 18+- `GET /memory?user_id=x&session_id=y` - Retrieve stored memories  "message": "Assistant's response",

- Cloudflare account with Workers AI enabled

- Wrangler CLI (`npm install -g wrangler`)- `POST /memory` - Direct memory operations  "citations": [



## Configuration    {



The system is configured via `wrangler.toml`:## Privacy & Security      "title": "Source Title",



```toml      "source": "https://example.com",

name = "cf-ai-edge-assistant"

account_id = "your-account-id"The system implements strict data handling policies:      "detail": "Additional context"



[ai]    }

binding = "AI"

remote = true**Automatically Filtered:**  ],



[[durable_objects.bindings]]- Passwords, API tokens, and secrets  "tool_calls": [],

name = "MEMORY_STORE"

class_name = "MemoryStore"- Payment card information  "memory_writes": [],

```

- Social security numbers and PII  "next_actions": ["Suggested next steps"]

AI parameters (temperature: 0.2, top_p: 0.9, max_tokens: 1024) are optimized for factual, concise responses but can be adjusted in `worker.ts`.

- Sensitive health/financial data}

## Design Decisions

```

**Why Cloudflare Workers?**

- Global edge deployment without managing infrastructure**Memory Policy:**

- Native AI and Durable Objects integrations

- Cost-effective scaling (pay-per-request model)- Stores user preferences and project context with explicit consent### POST /voice



**Why Llama 3.3 70B?**- Session memory cleared after timeoutVoice interaction (same format as /chat, mode automatically set to "voice").

- Strong reasoning capabilities for tool selection

- Fast inference time (FP8 quantization)- All storage operations logged and auditable

- Good balance of quality and latency

### GET /memory

**Why Durable Objects?**

- Strong consistency for user memory## Technical HighlightsList memory entries for a user/session.

- Low-latency reads/writes (co-located with compute)

- Built-in persistence without external databases



## Future Enhancements**Testing:** 47 unit tests covering privacy filters, tool validation, output contracts, and configuration**Query Parameters:**



- Integration with real calendar APIs (currently mocked)```bash- `user_id`: User identifier (default: "anonymous")

- RAG (Retrieval Augmented Generation) for knowledge base queries

- Multi-user conversation threadsnpm test  # Runs full test suite via Vitest- `session_id`: Session identifier (default: "default")

- Analytics dashboard for usage patterns

- Rate limiting and abuse prevention```



## Project Context### GET /health



This project was built to demonstrate:**Type Safety:** Full TypeScript implementation with strict mode enabledHealth check endpoint.

1. Practical application of serverless edge computing

2. Responsible AI system design with privacy guarantees

3. Clean architecture principles in TypeScript

4. Production-ready code with comprehensive testing and CI/CD**Performance:** ## Setup



The implementation follows the specification in `PROMPT.md`, which defines behavioral constraints, memory policies, and output contracts to ensure reliable, predictable AI interactions.- Edge deployment reduces latency to <50ms globally



---- Efficient caching of conversation context (last 5 messages)### Prerequisites



**Built with:** Cloudflare Workers, TypeScript, Llama 3.3 70B, Durable Objects, Vitest, GitHub Actions- Optimized token usage (1024 token limit with smart truncation)



**Live URL:** https://cf-ai-edge-assistant.ns-2004.workers.dev- [Node.js](https://nodejs.org/) (v18 or later)



**Test:** `curl https://cf-ai-edge-assistant.ns-2004.workers.dev/health`**Reliability:**- [Cloudflare account](https://dash.cloudflare.com/sign-up)


- Graceful error handling with detailed logging- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

- Automatic retry logic for transient failures

- CORS support for browser-based clients### Installation



## Development1. Install dependencies:

```bash

```bashnpm install

# Install dependencies```

npm install

2. Login to Cloudflare:

# Run locally (http://localhost:8787)```bash

npm run devnpx wrangler login

```

# Run tests

npm test3. Configure your Cloudflare account ID in `wrangler.toml`:

```toml

# Deploy to productionaccount_id = "your-account-id"

npm run deploy```

```

### Development

**Requirements:**

- Node.js 18+Run the development server:

- Cloudflare account with Workers AI enabled```bash

- Wrangler CLI (`npm install -g wrangler`)npm run dev

```

## Configuration

The worker will be available at `http://localhost:8787`.

The system is configured via `wrangler.toml`:

### Testing

```toml

name = "cf-ai-edge-assistant"Test the chat endpoint:

account_id = "your-account-id"```bash

curl -X POST http://localhost:8787/chat \

[ai]  -H "Content-Type: application/json" \

binding = "AI"  -d '{

remote = true    "message": "Hello! What can you help me with?",

    "user_id": "test-user",

[[durable_objects.bindings]]    "session_id": "test-session"

name = "MEMORY_STORE"  }'

class_name = "MemoryStore"```

```

Test with a tool call:

AI parameters (temperature: 0.2, top_p: 0.9, max_tokens: 1024) are optimized for factual, concise responses but can be adjusted in `worker.ts`.```bash

curl -X POST http://localhost:8787/chat \

## Design Decisions  -H "Content-Type: application/json" \

  -d '{

**Why Cloudflare Workers?**    "message": "Fetch data from https://api.github.com/repos/cloudflare/workers-sdk",

- Global edge deployment without managing infrastructure    "user_id": "test-user"

- Native AI and Durable Objects integrations  }'

- Cost-effective scaling (pay-per-request model)```



**Why Llama 3.3 70B?**Test memory:

- Strong reasoning capabilities for tool selection```bash

- Fast inference time (FP8 quantization)curl -X POST http://localhost:8787/chat \

- Good balance of quality and latency  -H "Content-Type: application/json" \

  -d '{

**Why Durable Objects?**    "message": "Remember that my name is Alice and I prefer metric units",

- Strong consistency for user memory    "user_id": "test-user"

- Low-latency reads/writes (co-located with compute)  }'

- Built-in persistence without external databases

# Later, retrieve memory

## Future Enhancementscurl "http://localhost:8787/memory?user_id=test-user"

```

- Integration with real calendar APIs (currently mocked)

- RAG (Retrieval Augmented Generation) for knowledge base queries### Deployment

- Multi-user conversation threads

- Analytics dashboard for usage patternsDeploy to Cloudflare Workers:

- Rate limiting and abuse prevention```bash

npm run deploy

## Project Context```



This project was built to demonstrate:Your worker will be deployed to: `https://edge-assistant.<your-subdomain>.workers.dev`

1. Practical application of serverless edge computing

2. Responsible AI system design with privacy guarantees## Configuration

3. Clean architecture principles in TypeScript

4. Production-ready code with comprehensive testing### Environment Variables



The implementation follows the specification in `PROMPT.md`, which defines behavioral constraints, memory policies, and output contracts to ensure reliable, predictable AI interactions.Set in `wrangler.toml`:



---```toml

[vars]

**Built with:** Cloudflare Workers, TypeScript, Llama 3.3 70B, Durable Objects, VitestENVIRONMENT = "production"

```

**Live URL:** https://cf-ai-edge-assistant.ns-2004.workers.dev

### AI Model Configuration

**Test:** `curl https://cf-ai-edge-assistant.ns-2004.workers.dev/health`

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
