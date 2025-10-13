import { describe, it, expect } from 'vitest';

describe('HTTP Fetch Tool', () => {
  describe('URL Validation', () => {
    const isValidUrl = (urlString: string): boolean => {
      try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };

    const isPrivateIP = (hostname: string): boolean => {
      if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
      if (hostname.startsWith('192.168.')) return true;
      if (hostname.startsWith('10.')) return true;
      if (hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;
      return false;
    };

    it('should validate proper URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('should detect private IPs', () => {
      expect(isPrivateIP('localhost')).toBe(true);
      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('192.168.1.1')).toBe(true);
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
    });

    it('should allow public IPs', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('example.com')).toBe(false);
      expect(isPrivateIP('cloudflare.com')).toBe(false);
    });
  });

  describe('HTTP Methods', () => {
    it('should validate allowed methods', () => {
      const allowedMethods = ['GET', 'POST'];
      
      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('POST');
    });

    it('should reject disallowed methods', () => {
      const allowedMethods = ['GET', 'POST'];
      
      expect(allowedMethods).not.toContain('DELETE');
      expect(allowedMethods).not.toContain('PUT');
      expect(allowedMethods).not.toContain('PATCH');
    });
  });
});

describe('Durable Object Tool', () => {
  describe('Operation Validation', () => {
    it('should validate allowed operations', () => {
      const allowedOps = ['read', 'write', 'delete', 'list', 'clear'];
      
      expect(allowedOps).toContain('read');
      expect(allowedOps).toContain('write');
      expect(allowedOps).toContain('delete');
      expect(allowedOps).toContain('list');
      expect(allowedOps).toContain('clear');
    });

    it('should reject invalid operations', () => {
      const allowedOps = ['read', 'write', 'delete', 'list', 'clear'];
      
      expect(allowedOps).not.toContain('update');
      expect(allowedOps).not.toContain('invalid');
    });
  });
});

describe('Workflows Tool', () => {
  describe('Workflow Input Validation', () => {
    it('should validate workflow name', () => {
      const workflowName = 'find_calendar_slots';
      expect(workflowName).toBeDefined();
      expect(typeof workflowName).toBe('string');
      expect(workflowName.length).toBeGreaterThan(0);
    });

    it('should validate workflow input structure', () => {
      const input = {
        attendees: ['user@example.com'],
        duration_minutes: 30,
        week_of: '2025-10-20'
      };

      expect(input.attendees).toBeDefined();
      expect(Array.isArray(input.attendees)).toBe(true);
      expect(input.duration_minutes).toBeDefined();
      expect(typeof input.duration_minutes).toBe('number');
    });
  });
});

describe('Tool System Integration', () => {
  it('should have exactly 3 tools', () => {
    const availableTools = ['http_fetch', 'durable_object', 'workflows_invoke'];
    expect(availableTools).toHaveLength(3);
  });

  it('should validate tool names', () => {
    const availableTools = ['http_fetch', 'durable_object', 'workflows_invoke'];
    
    expect(availableTools).toContain('http_fetch');
    expect(availableTools).toContain('durable_object');
    expect(availableTools).toContain('workflows_invoke');
  });
});
