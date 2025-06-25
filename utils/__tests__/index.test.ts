import {
    isPipelineHalted,
    formatDate,
    calculateCost,
    isBudgetExceeded,
    sanitizeInput,
    debounce,
    sleep,
    retry,
    generateId,
    isValidEmail,
    truncate,
    getEnvBoolean,
    getEnv,
  } from '../index';
  
  describe('Utility Functions', () => {
    describe('isPipelineHalted', () => {
      const originalEnv = process.env;
  
      beforeEach(() => {
        process.env = { ...originalEnv };
      });
  
      afterAll(() => {
        process.env = originalEnv;
      });
  
      it('returns true when HALT_PIPELINE is true', () => {
        process.env.HALT_PIPELINE = 'true';
        expect(isPipelineHalted()).toBe(true);
      });
  
      it('returns false when HALT_PIPELINE is false', () => {
        process.env.HALT_PIPELINE = 'false';
        expect(isPipelineHalted()).toBe(false);
      });
  
      it('returns false when HALT_PIPELINE is not set', () => {
        delete process.env.HALT_PIPELINE;
        expect(isPipelineHalted()).toBe(false);
      });
    });
  
    describe('formatDate', () => {
      it('formats Date object correctly', () => {
        const date = new Date('2024-01-15T10:30:00');
        const formatted = formatDate(date);
        expect(formatted).toContain('January');
        expect(formatted).toContain('15');
        expect(formatted).toContain('2024');
      });
  
      it('formats date string correctly', () => {
        const formatted = formatDate('2024-01-15T10:30:00');
        expect(formatted).toContain('January');
        expect(formatted).toContain('15');
        expect(formatted).toContain('2024');
      });
    });
  
    describe('calculateCost', () => {
      it('calculates token cost correctly', () => {
        const cost = calculateCost({ tokens: 10000 });
        expect(cost).toBe(1); // 10000 * 0.0001
      });
  
      it('calculates browserbase cost correctly', () => {
        const cost = calculateCost({ browserbaseMinutes: 100 });
        expect(cost).toBe(1.5); // 100 * 0.015
      });
  
      it('calculates percy cost correctly', () => {
        const cost = calculateCost({ percySnapshots: 100 });
        expect(cost).toBe(1); // 100 * 0.01
      });
  
      it('calculates combined costs correctly', () => {
        const cost = calculateCost({
          tokens: 10000,
          browserbaseMinutes: 100,
          percySnapshots: 100,
        });
        expect(cost).toBe(3.5); // 1 + 1.5 + 1
      });
  
      it('handles missing values', () => {
        const cost = calculateCost({});
        expect(cost).toBe(0);
      });
    });
  
    describe('isBudgetExceeded', () => {
      it('returns true when spent equals budget', () => {
        expect(isBudgetExceeded(5, 5)).toBe(true);
      });
  
      it('returns true when spent exceeds budget', () => {
        expect(isBudgetExceeded(6, 5)).toBe(true);
      });
  
      it('returns false when spent is below budget', () => {
        expect(isBudgetExceeded(4, 5)).toBe(false);
      });
    });
  
    describe('sanitizeInput', () => {
      it('removes HTML tags', () => {
        expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      });
  
      it('removes javascript: protocol', () => {
        expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      });
  
      it('removes event handlers', () => {
        expect(sanitizeInput('onclick=alert("xss")')).toBe('alert("xss")');
      });
  
      it('trims whitespace', () => {
        expect(sanitizeInput('  hello world  ')).toBe('hello world');
      });
    });
  
    describe('debounce', () => {
      jest.useFakeTimers();
  
      it('delays function execution', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100);
  
        debouncedFn();
        expect(fn).not.toHaveBeenCalled();
  
        jest.advanceTimersByTime(50);
        expect(fn).not.toHaveBeenCalled();
  
        jest.advanceTimersByTime(50);
        expect(fn).toHaveBeenCalledTimes(1);
      });
  
      it('cancels previous calls', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100);
  
        debouncedFn('first');
        jest.advanceTimersByTime(50);
        debouncedFn('second');
        jest.advanceTimersByTime(100);
  
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('second');
      });
    });
  
    describe('sleep', () => {
      jest.useFakeTimers();
  
      it('resolves after specified time', async () => {
        const promise = sleep(1000);
        jest.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
      });
    });
  
    describe('retry', () => {
      it('succeeds on first attempt', async () => {
        const fn = jest.fn().mockResolvedValue('success');
        const result = await retry(fn);
        
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
      });
  
      it('retries on failure and succeeds', async () => {
        const fn = jest.fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockResolvedValueOnce('success');
        
        const result = await retry(fn, 3, 0);
        
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
      });
  
      it('throws after max attempts', async () => {
        const fn = jest.fn().mockRejectedValue(new Error('fail'));
        
        await expect(retry(fn, 3, 0)).rejects.toThrow('fail');
        expect(fn).toHaveBeenCalledTimes(3);
      });
    });
  
    describe('generateId', () => {
      it('generates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        
        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
      });
    });
  
    describe('isValidEmail', () => {
      it('validates correct emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      });
  
      it('rejects invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('test @example.com')).toBe(false);
      });
    });
  
    describe('truncate', () => {
      it('returns text unchanged if within limit', () => {
        expect(truncate('short text', 20)).toBe('short text');
      });
  
      it('truncates long text with ellipsis', () => {
        expect(truncate('this is a very long text', 10)).toBe('this is...');
      });
    });
  
    describe('getEnvBoolean', () => {
      const originalEnv = process.env;
  
      beforeEach(() => {
        process.env = { ...originalEnv };
      });
  
      afterAll(() => {
        process.env = originalEnv;
      });
  
      it('returns true for "true" value', () => {
        process.env.TEST_VAR = 'true';
        expect(getEnvBoolean('TEST_VAR')).toBe(true);
      });
  
      it('returns true for "TRUE" value', () => {
        process.env.TEST_VAR = 'TRUE';
        expect(getEnvBoolean('TEST_VAR')).toBe(true);
      });
  
      it('returns false for "false" value', () => {
        process.env.TEST_VAR = 'false';
        expect(getEnvBoolean('TEST_VAR')).toBe(false);
      });
  
      it('returns default value when not set', () => {
        expect(getEnvBoolean('MISSING_VAR', true)).toBe(true);
        expect(getEnvBoolean('MISSING_VAR', false)).toBe(false);
      });
    });
  
    describe('getEnv', () => {
      const originalEnv = process.env;
  
      beforeEach(() => {
        process.env = { ...originalEnv };
      });
  
      afterAll(() => {
        process.env = originalEnv;
      });
  
      it('returns env value when set', () => {
        process.env.TEST_VAR = 'test-value';
        expect(getEnv('TEST_VAR')).toBe('test-value');
      });
  
      it('returns default value when not set', () => {
        expect(getEnv('MISSING_VAR', 'default')).toBe('default');
      });
  
      it('returns empty string when not set and no default', () => {
        expect(getEnv('MISSING_VAR')).toBe('');
      });
    });
  });