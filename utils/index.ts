/**
 * Utility functions for the Autonomous Dev Stack
 */

/**
 * Checks if the pipeline is halted
 */
export const isPipelineHalted = (): boolean => {
    return process.env['HALT_PIPELINE'] === 'true';
  };
  
  /**
   * Formats a date to a human-readable string
   */
  export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };
  
  /**
   * Calculates the estimated cost based on usage
   */
  export const calculateCost = (usage: {
    tokens?: number;
    browserbaseMinutes?: number;
    percySnapshots?: number;
  }): number => {
    const tokenCost = (usage.tokens || 0) * 0.0001; // $0.0001 per token
    const browserbaseCost = (usage.browserbaseMinutes || 0) * 0.015; // $0.015 per minute
    const percyCost = (usage.percySnapshots || 0) * 0.01; // $0.01 per snapshot
    
    return tokenCost + browserbaseCost + percyCost;
  };
  
  /**
   * Checks if the budget is exceeded
   */
  export const isBudgetExceeded = (spent: number, budget: number): boolean => {
    return spent >= budget;
  };
  
  /**
   * Sanitizes user input to prevent XSS
   */
  export const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  };
  
  /**
   * Debounce function for performance optimization
   */
  export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  
  /**
   * Sleep function for delays
   */
  export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  /**
   * Retry function for API calls
   */
  export const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts) {
          await sleep(delay * attempt);
        }
      }
    }
    
    throw lastError!;
  };
  
  /**
   * Generates a unique ID
   */
  export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Validates email format
   */
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Truncates text with ellipsis
   */
  export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  /**
   * Parses environment variable as boolean
   */
  export const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  };
  
  /**
   * Gets environment variable with fallback
   */
  export const getEnv = (key: string, defaultValue: string = ''): string => {
    return process.env[key] || defaultValue;
  };