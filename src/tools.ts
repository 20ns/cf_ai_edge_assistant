import { Env, ToolCall, Citation, MemoryWrite, MemoryScope } from './types';

export class ToolsSystem {
  private env: Env;
  private userId: string;
  private sessionId: string;

  constructor(env: Env, userId: string, sessionId: string) {
    this.env = env;
    this.userId = userId;
    this.sessionId = sessionId;
  }

  async executeTool(toolCall: ToolCall): Promise<any> {
    switch (toolCall.tool) {
      case 'http_fetch':
        return await this.httpFetch(toolCall.args as any);
      case 'durable_object':
        return await this.durableObjectOp(toolCall.args as any);
      case 'workflows_invoke':
        return await this.workflowsInvoke(toolCall.args as any);
      default:
        throw new Error(`Unknown tool: ${toolCall.tool}`);
    }
  }

  private async httpFetch(args: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<{ data: any; citation: Citation }> {
    const { url, method = 'GET', headers = {}, body } = args;

    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL provided');
    }

    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.')) {
      throw new Error('Cannot fetch from private or local addresses');
    }

    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'EdgeAssistant/1.0',
        ...headers
      },
      body: body ? body : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const urlObj = new URL(url);
    const citation: Citation = {
      title: urlObj.hostname,
      source: url,
      detail: `Fetched via HTTP ${method}`
    };

    return { data, citation };
  }

  private async durableObjectOp(args: {
    op: 'read' | 'write' | 'delete';
    key: string;
    value?: any;
    scope?: MemoryScope;
  }): Promise<any> {
    const { op, key, value, scope = 'session' } = args;

    const id = this.env.MEMORY_STORE.idFromName(`${this.userId}:${this.sessionId}`);
    const stub = this.env.MEMORY_STORE.get(id);

    let url: string;
    let request: Request;

    switch (op) {
      case 'read':
        url = `https://memory/?op=read&key=${encodeURIComponent(key)}`;
        request = new Request(url);
        break;

      case 'write':
        url = `https://memory/?op=write`;
        request = new Request(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, scope })
        });
        break;

      case 'delete':
        url = `https://memory/?op=delete&key=${encodeURIComponent(key)}`;
        request = new Request(url);
        break;

      default:
        throw new Error(`Unknown durable_object operation: ${op}`);
    }

    const response = await stub.fetch(request);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Durable Object operation failed');
    }

    return result;
  }

  // Mock workflow implementation - replace with real Cloudflare Workflows in production
  private async workflowsInvoke(args: {
    name: string;
    input: Record<string, any>;
  }): Promise<any> {
    const { name, input } = args;

    switch (name) {
      case 'find_calendar_slots':
        return await this.findCalendarSlots(input);
      
      default:
        throw new Error(`Workflow '${name}' not found. Available workflows: find_calendar_slots`);
    }
  }

  private async findCalendarSlots(input: {
    attendees?: string[];
    duration_minutes?: number;
    week_of?: string;
    time_preference?: string;
  }): Promise<any> {
    const { attendees = [], duration_minutes = 30, week_of, time_preference } = input;

    const slots = [];
    const baseDate = week_of ? new Date(week_of) : new Date();
    
    for (let day = 0; day < 5; day++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + day);
      
      if (!time_preference || time_preference === 'morning') {
        for (let hour = 9; hour < 12; hour++) {
          slots.push({
            start: `${date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`,
            duration_minutes,
            attendees
          });
        }
      }
      
      if (!time_preference || time_preference === 'afternoon') {
        for (let hour = 14; hour < 17; hour++) {
          slots.push({
            start: `${date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`,
            duration_minutes,
            attendees
          });
        }
      }
    }

    return {
      available_slots: slots.slice(0, 10),
      total_found: slots.length
    };
  }

  async getMemory(key: string): Promise<any> {
    const result = await this.durableObjectOp({
      op: 'read',
      key
    });
    return result.value?.value;
  }

  async setMemory(key: string, value: any, scope: MemoryScope = 'session'): Promise<void> {
    await this.durableObjectOp({
      op: 'write',
      key,
      value,
      scope
    });
  }

  async listMemory(): Promise<any[]> {
    const id = this.env.MEMORY_STORE.idFromName(`${this.userId}:${this.sessionId}`);
    const stub = this.env.MEMORY_STORE.get(id);
    const url = 'https://memory/?op=list';
    const response = await stub.fetch(new Request(url));
    const result = await response.json();
    return result.entries || [];
  }
}
