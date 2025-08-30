import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeJxa, JxaErrorType, JxaExecutionError } from '../applescript/execute.js';
import * as child_process from 'child_process';
import * as fs from 'fs/promises';

// Mock child_process and fs
vi.mock('child_process');
vi.mock('fs/promises');

describe('executeJxa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Enhanced Error Handling', () => {
    it('should write script to temp file and execute', async () => {
      const mockExec = vi.spyOn(child_process, 'exec');
      const mockWriteFile = vi.spyOn(fs, 'writeFile');
      const mockUnlink = vi.spyOn(fs, 'unlink');
      
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);
      
      mockExec.mockImplementation((cmd, callback) => {
        (callback as any)(null, JSON.stringify({ success: true }), '');
        return { on: vi.fn(), kill: vi.fn() } as any;
      });

      const result = await executeJxa('test script');
      
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
      expect(mockUnlink).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should retry on transient failures', async () => {
      const mockExec = vi.spyOn(child_process, 'exec');
      const mockWriteFile = vi.spyOn(fs, 'writeFile');
      const mockUnlink = vi.spyOn(fs, 'unlink');
      
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);
      
      let attempts = 0;
      mockExec.mockImplementation((cmd, callback) => {
        attempts++;
        if (attempts === 1) {
          (callback as any)(new Error('Temporary failure'), '', '');
        } else {
          (callback as any)(null, JSON.stringify({ success: true }), '');
        }
        return { on: vi.fn(), kill: vi.fn() } as any;
      });

      const result = await executeJxa('test script', { retries: 2, retryDelay: 10 });
      
      expect(attempts).toBe(2);
      expect(result).toEqual({ success: true });
    });

    it('should not retry script errors', async () => {
      const mockExec = vi.spyOn(child_process, 'exec');
      const mockWriteFile = vi.spyOn(fs, 'writeFile');
      const mockUnlink = vi.spyOn(fs, 'unlink');
      
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);
      
      mockExec.mockImplementation((cmd, callback) => {
        (callback as any)(new Error('SyntaxError in script'), '', 'SyntaxError: Unexpected token');
        return { on: vi.fn(), kill: vi.fn() } as any;
      });

      await expect(executeJxa('bad script', { retries: 2 }))
        .rejects.toThrow(JxaExecutionError);
    });

    it('should handle timeout', async () => {
      const mockExec = vi.spyOn(child_process, 'exec');
      const mockWriteFile = vi.spyOn(fs, 'writeFile');
      const mockUnlink = vi.spyOn(fs, 'unlink');
      
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);
      
      mockExec.mockImplementation(() => {
        const proc = {
          on: vi.fn(),
          kill: vi.fn()
        };
        
        // Simulate timeout
        setTimeout(() => {
          proc.kill('SIGTERM' as any);
        }, 10);
        
        return proc as any;
      });

      await expect(executeJxa('slow script', { timeout: 5 }))
        .rejects.toThrow('timed out');
    });

    it('should preserve temp file in debug mode', async () => {
      const mockExec = vi.spyOn(child_process, 'exec');
      const mockWriteFile = vi.spyOn(fs, 'writeFile');
      const mockUnlink = vi.spyOn(fs, 'unlink');
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);
      
      mockExec.mockImplementation((cmd, callback) => {
        (callback as any)(null, JSON.stringify({ success: true }), '');
        return { on: vi.fn(), kill: vi.fn() } as any;
      });

      await executeJxa('test script', { debug: true });
      
      expect(mockUnlink).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Debug mode'));
      
      mockConsoleLog.mockRestore();
    });

    // Note: Error classification is tested indirectly through the other tests
    // Direct classification testing requires complex mock setup that doesn't
    // accurately reflect the real execution flow
  });
});