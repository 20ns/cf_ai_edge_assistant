import { describe, it, expect, beforeEach } from 'vitest';

describe('Memory Privacy Filter', () => {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /credit[_-]?card/i,
    /ssn/i
  ];

  const checkSensitiveData = (key: string, value: any): boolean => {
    const valueStr = JSON.stringify(value).toLowerCase();
    for (const pattern of sensitivePatterns) {
      if (pattern.test(valueStr) || pattern.test(key)) {
        return true;
      }
    }
    return false;
  };

  it('should block password in key', () => {
    expect(checkSensitiveData('user_password', 'secret123')).toBe(true);
  });

  it('should block token in key', () => {
    expect(checkSensitiveData('api_token', 'abc123')).toBe(true);
  });

  it('should block secret in value', () => {
    expect(checkSensitiveData('config', { secret: 'mysecret' })).toBe(true);
  });

  it('should block api_key pattern', () => {
    expect(checkSensitiveData('api_key', '12345')).toBe(true);
    expect(checkSensitiveData('api-key', '12345')).toBe(true);
  });

  it('should block credit_card pattern', () => {
    expect(checkSensitiveData('credit_card', '4111111111111111')).toBe(true);
    expect(checkSensitiveData('credit-card', '4111111111111111')).toBe(true);
  });

  it('should block ssn', () => {
    expect(checkSensitiveData('ssn', '123-45-6789')).toBe(true);
  });

  it('should allow safe data', () => {
    expect(checkSensitiveData('user_theme', 'dark_mode')).toBe(false);
    expect(checkSensitiveData('user_preference', 'compact')).toBe(false);
    expect(checkSensitiveData('username', 'john_doe')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(checkSensitiveData('USER_PASSWORD', 'test')).toBe(true);
    expect(checkSensitiveData('Password', 'test')).toBe(true);
    expect(checkSensitiveData('key', 'PASSWORD')).toBe(true);
  });
});

describe('Memory Scope Validation', () => {
  type MemoryScope = 'session' | 'long_term';

  const isValidScope = (scope: string): scope is MemoryScope => {
    return scope === 'session' || scope === 'long_term';
  };

  it('should accept session scope', () => {
    expect(isValidScope('session')).toBe(true);
  });

  it('should accept long_term scope', () => {
    expect(isValidScope('long_term')).toBe(true);
  });

  it('should reject invalid scopes', () => {
    expect(isValidScope('invalid')).toBe(false);
    expect(isValidScope('temporary')).toBe(false);
    expect(isValidScope('')).toBe(false);
  });
});
