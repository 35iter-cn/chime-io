import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  createLogger,
  createAgentLogger,
  type LogEntry,
} from '../core/logger.js';

async function createTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'logger-test-'));
}

async function readLogFile(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

describe('createLogger', () => {
  test('should create logger with default options', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({ logFilePath: logFile });
    await logger.info('test message');

    const lines = await readLogFile(logFile);
    assert.strictEqual(lines.length, 1);

    const entry = JSON.parse(lines[0]!) as LogEntry;
    assert.strictEqual(entry.title, 'test message');
    assert.strictEqual(entry.level, 'info');
    assert.ok(entry.timestamp);
    assert.ok(entry.localTime);

    await fs.rm(tempDir, { recursive: true });
  });

  test('should write different log levels', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({ logFilePath: logFile, minLevel: 'debug' });

    await logger.debug('debug msg');
    await logger.info('info msg');
    await logger.warn('warn msg');
    await logger.error('error msg');

    const lines = await readLogFile(logFile);
    assert.strictEqual(lines.length, 4);

    const levels = lines.map((l) => (JSON.parse(l) as LogEntry).level);
    assert.deepStrictEqual(levels, ['debug', 'info', 'warn', 'error']);

    await fs.rm(tempDir, { recursive: true });
  });

  test('should respect minLevel filter', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({ logFilePath: logFile, minLevel: 'warn' });

    await logger.debug('debug');
    await logger.info('info');
    await logger.warn('warn');
    await logger.error('error');

    const lines = await readLogFile(logFile);
    assert.strictEqual(lines.length, 2);

    const levels = lines.map((l) => (JSON.parse(l) as LogEntry).level);
    assert.deepStrictEqual(levels, ['warn', 'error']);

    await fs.rm(tempDir, { recursive: true });
  });

  test('should include details in log entry', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({ logFilePath: logFile });
    await logger.info('test', { foo: 'bar', count: 42 });

    const lines = await readLogFile(logFile);
    const entry = JSON.parse(lines[0]!) as LogEntry;

    assert.strictEqual(entry.details.foo, 'bar');
    assert.strictEqual(entry.details.count, 42);

    await fs.rm(tempDir, { recursive: true });
  });

  test('should use specified timezone', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({
      logFilePath: logFile,
      timeZone: 'Asia/Shanghai',
    });
    await logger.info('test');

    const lines = await readLogFile(logFile);
    const entry = JSON.parse(lines[0]!) as LogEntry;

    // 检查 localTime 格式（应包含日期和时间）
    assert.ok(entry.localTime.includes('/'));
    assert.ok(entry.localTime.includes(':'));

    await fs.rm(tempDir, { recursive: true });
  });

  test('should rotate log when maxLines exceeded', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({
      logFilePath: logFile,
      maxLines: 3,
      maxBackups: 2,
    });

    // 写入超过 maxLines 的日志
    await logger.info('line1');
    await logger.info('line2');
    await logger.info('line3');
    await logger.info('line4'); // 触发轮转

    // 检查是否有备份文件
    const backupFile = path.join(tempDir, 'test.1.log');
    const backupExists = await fs
      .stat(backupFile)
      .then(() => true)
      .catch(() => false);
    assert.ok(backupExists, 'backup file should exist');

    const backupLines = await readLogFile(backupFile);
    assert.ok(backupLines.length >= 3);

    await fs.rm(tempDir, { recursive: true });
  });

  test('should rotate log when maxFileSize exceeded', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({
      logFilePath: logFile,
      maxFileSize: 50, // 50 bytes - 足够小以触发轮转
      maxBackups: 2,
    });

    // 先写入一个小日志，确保文件创建
    await logger.info('initial');

    // 然后写入超过 maxFileSize 的日志
    await logger.info('a'.repeat(200));

    // 检查是否有备份文件
    const backupFile = path.join(tempDir, 'test.1.log');
    const backupExists = await fs
      .stat(backupFile)
      .then(() => true)
      .catch(() => false);
    assert.ok(backupExists, 'backup file should exist after size rotation');

    await fs.rm(tempDir, { recursive: true });
  });

  test('should handle log method with custom entry', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({ logFilePath: logFile });
    await logger.log({
      agent: 'claude',
      messageType: 'session_complete',
      level: 'info',
      title: 'session completed',
      details: { sessionId: 'abc123' },
      sessionId: 'abc123',
    });

    const lines = await readLogFile(logFile);
    const entry = JSON.parse(lines[0]!) as LogEntry;

    assert.strictEqual(entry.agent, 'claude');
    assert.strictEqual(entry.messageType, 'session_complete');
    assert.strictEqual(entry.sessionId, 'abc123');

    await fs.rm(tempDir, { recursive: true });
  });

  test('should handle invalid timezone gracefully', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const logger = createLogger({
      logFilePath: logFile,
      timeZone: 'Invalid/Timezone',
    });
    await logger.info('test');

    const lines = await readLogFile(logFile);
    assert.strictEqual(lines.length, 1);

    const entry = JSON.parse(lines[0]!) as LogEntry;
    assert.ok(entry.localTime);

    await fs.rm(tempDir, { recursive: true });
  });
});

describe('createAgentLogger', () => {
  test('should prefix all logs with agent name', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const baseLogger = createLogger({ logFilePath: logFile });
    const agentLogger = createAgentLogger(baseLogger, 'claude');

    await agentLogger.info('message from claude');
    await agentLogger.warn('warning from claude');

    const lines = await readLogFile(logFile);
    assert.strictEqual(lines.length, 2);

    const entries = lines.map((l) => JSON.parse(l) as LogEntry);
    assert.strictEqual(entries[0]!.agent, 'claude');
    assert.strictEqual(entries[1]!.agent, 'claude');

    await fs.rm(tempDir, { recursive: true });
  });

  test('should support different agents', async () => {
    const tempDir = await createTempDir();
    const logFile = path.join(tempDir, 'test.log');

    const baseLogger = createLogger({ logFilePath: logFile });
    const claudeLogger = createAgentLogger(baseLogger, 'claude');
    const opencodeLogger = createAgentLogger(baseLogger, 'opencode');

    await claudeLogger.info('claude msg');
    await opencodeLogger.info('opencode msg');

    const lines = await readLogFile(logFile);
    const entries = lines.map((l) => JSON.parse(l) as LogEntry);

    assert.strictEqual(entries[0]!.agent, 'claude');
    assert.strictEqual(entries[1]!.agent, 'opencode');

    await fs.rm(tempDir, { recursive: true });
  });
});
