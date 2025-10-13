import { MemoryEntry, MemoryScope } from './types';

interface DurableObjectState {
  storage: DurableObjectStorage;
  id: any;
  waitUntil(promise: Promise<any>): void;
}

interface DurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T = unknown>(): Promise<Map<string, T>>;
  deleteAll(): Promise<void>;
}

export class MemoryStore {
  private state: DurableObjectState;
  private env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const op = url.searchParams.get('op');

      switch (op) {
        case 'read':
          return await this.handleRead(request);
        case 'write':
          return await this.handleWrite(request);
        case 'delete':
          return await this.handleDelete(request);
        case 'list':
          return await this.handleList(request);
        case 'clear':
          return await this.handleClear(request);
        default:
          return new Response(JSON.stringify({ error: 'Invalid operation' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleRead(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const value = await this.state.storage.get<MemoryEntry>(key);
    
    return new Response(JSON.stringify({ value }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleWrite(request: Request): Promise<Response> {
    const data = await request.json() as {
      key: string;
      value: any;
      scope: MemoryScope;
    };

    if (!data.key || data.value === undefined) {
      return new Response(JSON.stringify({ error: 'Key and value are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Privacy filter - reject sensitive data patterns
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /api[_-]?key/i,
      /credit[_-]?card/i,
      /ssn/i
    ];

    const valueStr = JSON.stringify(data.value).toLowerCase();
    for (const pattern of sensitivePatterns) {
      if (pattern.test(valueStr) || pattern.test(data.key)) {
        return new Response(JSON.stringify({ 
          error: 'Cannot store sensitive data',
          message: 'Detected potentially sensitive information. Storage denied per privacy policy.'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const entry: MemoryEntry = {
      key: data.key,
      value: data.value,
      timestamp: Date.now(),
      scope: data.scope || 'session'
    };

    await this.state.storage.put(data.key, entry);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleDelete(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await this.state.storage.delete(key);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleList(request: Request): Promise<Response> {
    const entries = await this.state.storage.list<MemoryEntry>();
    const result: MemoryEntry[] = [];

    for (const [key, value] of entries) {
      result.push(value);
    }

    return new Response(JSON.stringify({ entries: result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleClear(request: Request): Promise<Response> {
    await this.state.storage.deleteAll();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
