/**
 * Path Security Utilities for MCP Server
 * 
 * Provides security validation for file paths to prevent unauthorized access
 * to sensitive system files and directories.
 */

import path from 'path';
import os from 'os';

// Dangerous system paths that should be blocked
const BLOCKED_PATHS = [
  // System configuration files
  '/etc/passwd',
  '/etc/shadow',
  '/etc/sudoers',
  '/etc/hosts',
  '/etc/ssh/',
  
  // System logs
  '/var/log/',
  '/private/var/log/',
  
  // System binaries and libraries
  '/bin/',
  '/sbin/',
  '/usr/bin/',
  '/usr/sbin/',
  '/System/',
  
  // Root and system user directories
  '/root/',
  '/var/root/',
  '/private/var/db/',
  
  // User security-sensitive directories
  '/.ssh/',
  '/.aws/',
  '/.gnupg/',
  '/Library/Keychains/',
  '/Library/Application Support/1Password/',
  '/Library/Application Support/Keychain Access/',
  
  // Shell history files
  '/.bash_history',
  '/.zsh_history',
  '/.fish_history',
  
  // Environment files
  '/.env',
  '/.env.local',
  '/.env.production',
];

// Additional patterns to block
const BLOCKED_PATTERNS = [
  // Path traversal attempts
  /\.\.[\/\\]/,
  
  // Hidden files in sensitive locations
  /^\/Users\/[^\/]+\/\.[^\/]+$/,
  
  // System library paths
  /^\/System\//,
  /^\/Library\/System/,
  
  // Temporary system files
  /^\/tmp\/\..*$/,
  /^\/var\/tmp\/\..*$/,
];

// Safe directories that are generally acceptable
const SAFE_DIRECTORIES = [
  '~/Documents/',
  '~/Desktop/',
  '~/Downloads/',
  '~/Projects/',
  '/tmp/', // Only for specific files, not system temp files
  '/Users/', // User home directories (with additional validation)
];

export interface PathValidationOptions {
  allowUserHome?: boolean;
  allowTempFiles?: boolean;
  allowRelativePaths?: boolean;
  additionalBlockedPaths?: string[];
  additionalSafePaths?: string[];
}

export interface PathValidationResult {
  isValid: boolean;
  reason?: string;
  sanitizedPath?: string;
  securityRisk: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Validates a file path for security risks
 */
export function validateFilePath(
  filePath: string, 
  options: PathValidationOptions = {}
): PathValidationResult {
  const {
    allowUserHome = true,
    allowTempFiles = false,
    allowRelativePaths = false,
    additionalBlockedPaths = [],
    additionalSafePaths = []
  } = options;

  // Normalize the path
  const normalizedPath = path.resolve(filePath);
  const homeDir = os.homedir();

  // Check for relative path traversal if not allowed
  if (!allowRelativePaths && (filePath.includes('../') || filePath.includes('..\\'))) {
    return {
      isValid: false,
      reason: 'Path traversal attempts are not allowed',
      securityRisk: 'high'
    };
  }

  // Check against blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalizedPath) || pattern.test(filePath)) {
      return {
        isValid: false,
        reason: 'Path matches blocked security pattern',
        securityRisk: 'critical'
      };
    }
  }

  // Check against specific blocked paths (including additional ones)
  const allBlockedPaths = [...BLOCKED_PATHS, ...additionalBlockedPaths];
  for (const blockedPath of allBlockedPaths) {
    const expandedBlockedPath = blockedPath.startsWith('~') 
      ? blockedPath.replace('~', homeDir)
      : blockedPath;
    
    if (normalizedPath.startsWith(expandedBlockedPath)) {
      return {
        isValid: false,
        reason: `Access to sensitive path is blocked: ${blockedPath}`,
        securityRisk: 'critical'
      };
    }
  }

  // Check if it's in a user's home directory
  if (normalizedPath.startsWith(homeDir)) {
    if (!allowUserHome) {
      return {
        isValid: false,
        reason: 'Access to user home directory is not allowed',
        securityRisk: 'medium'
      };
    }
    
    // Check for sensitive files in home directory
    const relativeToHome = normalizedPath.replace(homeDir, '');
    if (relativeToHome.startsWith('/.ssh/') || 
        relativeToHome.startsWith('/.aws/') ||
        relativeToHome.startsWith('/.gnupg/')) {
      return {
        isValid: false,
        reason: 'Access to sensitive files in home directory is blocked',
        securityRisk: 'critical'
      };
    }
    
    return {
      isValid: true,
      sanitizedPath: normalizedPath,
      securityRisk: 'low'
    };
  }

  // Check temp files
  if (normalizedPath.startsWith('/tmp/') || normalizedPath.startsWith('/var/tmp/')) {
    if (!allowTempFiles) {
      return {
        isValid: false,
        reason: 'Access to temporary files is not allowed',
        securityRisk: 'medium'
      };
    }
    
    // Block hidden temp files
    const filename = path.basename(normalizedPath);
    if (filename.startsWith('.')) {
      return {
        isValid: false,
        reason: 'Access to hidden temporary files is blocked',
        securityRisk: 'high'
      };
    }
    
    return {
      isValid: true,
      sanitizedPath: normalizedPath,
      securityRisk: 'medium'
    };
  }

  // Check against safe directories (including additional ones)
  const allSafePaths = [...SAFE_DIRECTORIES, ...additionalSafePaths];
  for (const safePath of allSafePaths) {
    const expandedSafePath = safePath.startsWith('~') 
      ? safePath.replace('~', homeDir)
      : safePath;
    
    if (normalizedPath.startsWith(expandedSafePath)) {
      return {
        isValid: true,
        sanitizedPath: normalizedPath,
        securityRisk: 'low'
      };
    }
  }

  // Default: block everything else as potentially dangerous
  return {
    isValid: false,
    reason: 'Path is not in an allowed directory',
    securityRisk: 'high'
  };
}

/**
 * Validates multiple file paths
 */
export function validateFilePaths(
  filePaths: string[], 
  options: PathValidationOptions = {}
): { valid: string[]; invalid: Array<{ path: string; result: PathValidationResult }> } {
  const valid: string[] = [];
  const invalid: Array<{ path: string; result: PathValidationResult }> = [];

  for (const filePath of filePaths) {
    const result = validateFilePath(filePath, options);
    if (result.isValid && result.sanitizedPath) {
      valid.push(result.sanitizedPath);
    } else {
      invalid.push({ path: filePath, result });
    }
  }

  return { valid, invalid };
}

/**
 * Creates a user-friendly security message
 */
export function createSecurityMessage(result: PathValidationResult): string {
  const riskEmoji = {
    low: '⚠️',
    medium: '🔒',
    high: '🚫',
    critical: '🔴'
  };

  return `${riskEmoji[result.securityRisk]} Security: ${result.reason}`;
}