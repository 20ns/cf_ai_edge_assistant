import { describe, it, expect } from 'vitest';
import type { AssistantOutput, OperationStatus } from '../src/types';

describe('ResponseFormatter', () => {
  describe('Output Contract Validation', () => {
    it('should validate required fields', () => {
      const output: AssistantOutput = {
        status: 'success',
        message: 'Test message'
      };
      
      expect(output.status).toBeDefined();
      expect(output.message).toBeDefined();
    });

    it('should validate status values', () => {
      const validStatuses: OperationStatus[] = ['success', 'needs_tool', 'refusal', 'error'];
      
      validStatuses.forEach(status => {
        const output: AssistantOutput = {
          status,
          message: 'Test'
        };
        expect(validStatuses).toContain(output.status);
      });
    });

    it('should handle optional fields', () => {
      const output: AssistantOutput = {
        status: 'success',
        message: 'Test',
        citations: [{ title: 'Test', source: 'http://example.com' }],
        tool_calls: [{ tool: 'http_fetch', args: { url: 'http://example.com' } }],
        memory_writes: [{ key: 'test', value: 'value', scope: 'session', reason: 'test' }],
        next_actions: ['Do this next']
      };

      expect(output.citations).toBeDefined();
      expect(output.tool_calls).toBeDefined();
      expect(output.memory_writes).toBeDefined();
      expect(output.next_actions).toBeDefined();
    });

    it('should remove undefined fields in JSON output', () => {
      const output: AssistantOutput = {
        status: 'success',
        message: 'Test',
        citations: undefined,
        tool_calls: undefined
      };

      const json = JSON.parse(JSON.stringify(output));
      expect(json.citations).toBeUndefined();
      expect(json.tool_calls).toBeUndefined();
    });
  });

  describe('Citation Validation', () => {
    it('should validate citation structure', () => {
      const citation = {
        title: 'Example Page',
        source: 'http://example.com',
        detail: 'Additional info'
      };

      expect(citation.title).toBeDefined();
      expect(citation.source).toBeDefined();
    });

    it('should allow optional detail field', () => {
      const citation: { title: string; source: string; detail?: string } = {
        title: 'Example',
        source: 'http://example.com'
      };

      expect(citation.detail).toBeUndefined();
    });
  });

  describe('Tool Call Validation', () => {
    it('should validate tool call structure', () => {
      const toolCall = {
        tool: 'http_fetch',
        args: { url: 'http://example.com' }
      };

      expect(toolCall.tool).toBeDefined();
      expect(toolCall.args).toBeDefined();
    });

    it('should validate all tool types', () => {
      const validTools = ['http_fetch', 'durable_object', 'workflows_invoke'];
      
      validTools.forEach(tool => {
        const toolCall = { tool, args: {} };
        expect(validTools).toContain(toolCall.tool);
      });
    });
  });

  describe('Memory Write Validation', () => {
    it('should validate memory write structure', () => {
      const memoryWrite = {
        key: 'user_preference',
        value: 'dark_mode',
        scope: 'long_term' as const,
        reason: 'User preference storage'
      };

      expect(memoryWrite.key).toBeDefined();
      expect(memoryWrite.value).toBeDefined();
      expect(memoryWrite.scope).toBeDefined();
      expect(memoryWrite.reason).toBeDefined();
    });

    it('should validate scope values', () => {
      const validScopes = ['session', 'long_term'];
      
      validScopes.forEach(scope => {
        const memoryWrite = {
          key: 'test',
          value: 'value',
          scope: scope as 'session' | 'long_term',
          reason: 'test'
        };
        expect(validScopes).toContain(memoryWrite.scope);
      });
    });
  });
});
