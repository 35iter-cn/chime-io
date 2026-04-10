import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 消息来源 Agent 类型
 */
export type LogAgent = 'claude' | 'opencode' | 'unknown';

/**
 * 消息类型
 */
export type LogMessageType =
  | 'session_complete'
  | 'error'
  | 'permission'
  | 'notification'
  | 'tool_use'
  | 'subagent'
  | 'question'
  | 'system';

/**
 * 日志条目结构
 */
export interface LogEntry {
  /** ISO 格式时间戳 */
  timestamp: string;
  /** 用户时区格式化的时间 */
  localTime: string;
  /** 消息来源 Agent */
  agent: LogAgent;
  /** 消息类型 */
  messageType: LogMessageType;
  /** 日志级别 */
  level: LogLevel;
  /** 日志标题/摘要 */
  title: string;
  /** 详细消息内容 */
  details: Record<string, unknown>;
  /** 会话ID（如果有） */
  sessionId?: string;
}

/**
 * Logger 配置选项
 */
export interface LoggerOptions {
  /** 日志文件路径 */
  logFilePath: string;
  /** 最大文件大小（字节），默认 10MB */
  maxFileSize?: number;
  /** 最大日志行数，默认 10000 行 */
  maxLines?: number;
  /** 保留的日志文件数量，默认 5 个 */
  maxBackups?: number;
  /** 用户时区，默认使用系统时区 */
  timeZone?: string | undefined;
  /** 最小日志级别，默认 'info' */
  minLevel?: LogLevel;
}

/**
 * Logger 接口
 */
export interface Logger {
  debug(message: string, details?: Record<string, unknown>): Promise<void>;
  info(message: string, details?: Record<string, unknown>): Promise<void>;
  warn(message: string, details?: Record<string, unknown>): Promise<void>;
  error(message: string, details?: Record<string, unknown>): Promise<void>;
  log(entry: Omit<LogEntry, 'timestamp' | 'localTime'>): Promise<void>;
}

/** 日志级别优先级 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 格式化时间为用户时区
 */
function formatLocalTime(timeZone?: string): string {
  const now = new Date();
  try {
    return now.toLocaleString('zh-CN', {
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    // 如果时区无效，使用系统默认
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
}

/**
 * 检查文件大小
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * 获取文件行数
 */
async function getFileLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * 轮转日志文件
 */
async function rotateLogFile(
  filePath: string,
  maxBackups: number,
): Promise<void> {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  // 删除最旧的备份
  const oldestBackup = path.join(dir, `${base}.${maxBackups}${ext}`);
  try {
    await fs.unlink(oldestBackup);
  } catch {
    // 文件可能不存在，忽略错误
  }

  // 移动其他备份
  for (let i = maxBackups - 1; i >= 1; i--) {
    const oldPath = path.join(dir, `${base}.${i}${ext}`);
    const newPath = path.join(dir, `${base}.${i + 1}${ext}`);
    try {
      await fs.rename(oldPath, newPath);
    } catch {
      // 文件可能不存在，忽略错误
    }
  }

  // 移动当前日志文件
  const backupPath = path.join(dir, `${base}.1${ext}`);
  try {
    await fs.rename(filePath, backupPath);
  } catch {
    // 文件可能不存在，忽略错误
  }
}

/**
 * 检查并执行日志轮转
 */
async function checkAndRotate(
  filePath: string,
  maxFileSize: number,
  maxLines: number,
  maxBackups: number,
): Promise<void> {
  const size = await getFileSize(filePath);
  const lines = await getFileLines(filePath);

  if (size > maxFileSize || lines > maxLines) {
    await rotateLogFile(filePath, maxBackups);
  }
}

/**
 * 确保日志目录存在
 */
async function ensureLogDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // 目录可能已存在，忽略错误
  }
}

/**
 * 创建结构化 Logger
 */
export function createLogger(options: LoggerOptions): Logger {
  const {
    logFilePath,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    maxLines = 10000,
    maxBackups = 5,
    timeZone,
    minLevel = 'info',
  } = options;

  const minLevelPriority = LOG_LEVEL_PRIORITY[minLevel];

  async function writeLog(entry: LogEntry): Promise<void> {
    // 检查日志级别
    if (LOG_LEVEL_PRIORITY[entry.level] < minLevelPriority) {
      return;
    }

    try {
      await ensureLogDir(logFilePath);
      await checkAndRotate(logFilePath, maxFileSize, maxLines, maxBackups);

      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(logFilePath, logLine, 'utf8');
    } catch {
      // 日志写入失败时不应中断主流程
    }
  }

  return {
    async debug(message, details = {}) {
      const now = new Date();
      await writeLog({
        timestamp: now.toISOString(),
        localTime: formatLocalTime(timeZone),
        agent: 'unknown',
        messageType: 'system',
        level: 'debug',
        title: message,
        details,
      });
    },

    async info(message, details = {}) {
      const now = new Date();
      await writeLog({
        timestamp: now.toISOString(),
        localTime: formatLocalTime(timeZone),
        agent: 'unknown',
        messageType: 'system',
        level: 'info',
        title: message,
        details,
      });
    },

    async warn(message, details = {}) {
      const now = new Date();
      await writeLog({
        timestamp: now.toISOString(),
        localTime: formatLocalTime(timeZone),
        agent: 'unknown',
        messageType: 'system',
        level: 'warn',
        title: message,
        details,
      });
    },

    async error(message, details = {}) {
      const now = new Date();
      await writeLog({
        timestamp: now.toISOString(),
        localTime: formatLocalTime(timeZone),
        agent: 'unknown',
        messageType: 'system',
        level: 'error',
        title: message,
        details,
      });
    },

    async log(entry) {
      const now = new Date();
      await writeLog({
        ...entry,
        timestamp: now.toISOString(),
        localTime: formatLocalTime(timeZone),
      });
    },
  };
}

/**
 * 创建 Agent 专用的 Logger 包装器
 */
export function createAgentLogger(
  baseLogger: Logger,
  agent: LogAgent,
): Logger {
  return {
    async debug(message, details = {}) {
      await baseLogger.log({
        agent,
        messageType: 'system',
        level: 'debug',
        title: message,
        details,
      });
    },

    async info(message, details = {}) {
      await baseLogger.log({
        agent,
        messageType: 'system',
        level: 'info',
        title: message,
        details,
      });
    },

    async warn(message, details = {}) {
      await baseLogger.log({
        agent,
        messageType: 'system',
        level: 'warn',
        title: message,
        details,
      });
    },

    async error(message, details = {}) {
      await baseLogger.log({
        agent,
        messageType: 'system',
        level: 'error',
        title: message,
        details,
      });
    },

    async log(entry) {
      await baseLogger.log({ ...entry, agent });
    },
  };
}
