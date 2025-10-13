export interface MemoryStore {}

export type OperationStatus = 'success' | 'needs_tool' | 'refusal' | 'error';
export type MemoryScope = 'session' | 'long_term';
export type ToolName = 'workflows_invoke' | 'durable_object' | 'http_fetch';
export type DurableObjectOp = 'read' | 'write' | 'delete';

export interface Citation {
  title: string;
  source: string;
  detail?: string;
}

export interface ToolCall {
  tool: ToolName;
  args: Record<string, any>;
}

export interface MemoryWrite {
  key: string;
  value: any;
  scope: MemoryScope;
  reason: string;
}

export interface AssistantOutput {
  status: OperationStatus;
  message: string;
  citations?: Citation[];
  tool_calls?: ToolCall[];
  memory_writes?: MemoryWrite[];
  next_actions?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UserRequest {
  message: string;
  mode?: 'chat' | 'voice';
  user_id?: string;
  session_id?: string;
}

export interface Env {
  AI: any;
  MEMORY_STORE: any;
  ENVIRONMENT?: string;
}

export interface MemoryEntry {
  key: string;
  value: any;
  timestamp: number;
  scope: MemoryScope;
}
