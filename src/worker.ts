import { Env, UserRequest, ChatMessage, AssistantOutput } from './types';
import { MemoryStore } from './memory';
import { ToolsSystem } from './tools';
import { buildSystemPrompt } from './prompt';
import { ResponseFormatter } from './response';

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export { MemoryStore };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);

    if (url.pathname === '/chat' && request.method === 'POST') {
      return await handleChat(request, env, ctx);
    }

    if (url.pathname === '/voice' && request.method === 'POST') {
      return await handleVoice(request, env, ctx);
    }

    if (url.pathname === '/memory' && request.method === 'GET') {
      return await handleMemoryList(request, env, ctx);
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({
        name: 'Edge Assistant',
        version: '1.0.0',
        endpoints: {
          '/chat': 'POST - Chat with the assistant',
          '/voice': 'POST - Voice interaction',
          '/memory': 'GET - List memory entries',
          '/health': 'GET - Health check'
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const body = await request.json() as UserRequest;
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const userId = body.user_id || 'anonymous';
    const sessionId = body.session_id || generateSessionId();
    const mode = body.mode || 'chat';

    const result = await processRequest(body.message, mode, userId, sessionId, env);

    return new Response(ResponseFormatter.toJSON(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      ResponseFormatter.toJSON(ResponseFormatter.error('An error occurred processing your request', error as Error)),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      }
    );
  }
}

async function handleVoice(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const body = await request.json() as UserRequest;
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const userId = body.user_id || 'anonymous';
    const sessionId = body.session_id || generateSessionId();

    const result = await processRequest(body.message, 'voice', userId, sessionId, env);

    return new Response(ResponseFormatter.toJSON(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  } catch (error) {
    console.error('Voice error:', error);
    return new Response(
      ResponseFormatter.toJSON(ResponseFormatter.error('An error occurred processing your voice request', error as Error)),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      }
    );
  }
}

async function handleMemoryList(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id') || 'anonymous';
    const sessionId = url.searchParams.get('session_id') || 'default';

    const tools = new ToolsSystem(env, userId, sessionId);
    const entries = await tools.listMemory();

    return new Response(JSON.stringify({ entries }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  } catch (error) {
    console.error('Memory list error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list memory entries' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      }
    );
  }
}

// Core processing: builds conversation history, calls AI, executes tools, stores memories
async function processRequest(
  message: string,
  mode: 'chat' | 'voice',
  userId: string,
  sessionId: string,
  env: Env
): Promise<AssistantOutput> {
  const tools = new ToolsSystem(env, userId, sessionId);

  const systemPrompt = buildSystemPrompt(mode);
  const conversationHistory = await tools.getMemory('conversation_history') || [];
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-5),
    { role: 'user', content: message }
  ];

  const aiResponse = await callCloudflareAI(env, messages);

  let output: AssistantOutput;
  try {
    output = ResponseFormatter.parseAIResponse(aiResponse);
  } catch (error) {
    output = {
      status: 'success',
      message: aiResponse
    };
  }

  if (output.tool_calls && output.tool_calls.length > 0) {
    const toolResults = [];
    
    for (const toolCall of output.tool_calls) {
      try {
        const result = await tools.executeTool(toolCall);
        toolResults.push({
          tool: toolCall.tool,
          success: true,
          result
        });
      } catch (error) {
        toolResults.push({
          tool: toolCall.tool,
          success: false,
          error: (error as Error).message
        });
      }
    }

    if (toolResults.length > 0) {
      const toolResultsMessage = `Tool execution results:\n${JSON.stringify(toolResults, null, 2)}`;
      
      const followUpMessages: ChatMessage[] = [
        ...messages,
        { role: 'assistant', content: output.message },
        { role: 'user', content: toolResultsMessage }
      ];

      const followUpResponse = await callCloudflareAI(env, followUpMessages);
      output = ResponseFormatter.parseAIResponse(followUpResponse);
    }
  }

  if (output.memory_writes && output.memory_writes.length > 0) {
    for (const memWrite of output.memory_writes) {
      try {
        await tools.setMemory(memWrite.key, memWrite.value, memWrite.scope);
      } catch (error) {
        console.error('Memory write error:', error);
      }
    }
  }

  const updatedHistory = [
    ...conversationHistory.slice(-5),
    { role: 'user', content: message },
    { role: 'assistant', content: output.message }
  ];
  
  try {
    await tools.setMemory('conversation_history', updatedHistory, 'session');
  } catch (error) {
    console.error('Failed to update conversation history:', error);
  }

  return output;
}

async function callCloudflareAI(env: Env, messages: ChatMessage[]): Promise<string> {
  try {
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1024
    });

    if (response && response.response) {
      return response.response;
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Cloudflare AI error:', error);
    throw new Error(`AI call failed: ${(error as Error).message}`);
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function handleCORS(): Response {
  return new Response(null, {
    headers: corsHeaders()
  });
}
