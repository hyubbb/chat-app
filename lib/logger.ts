type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogMessage[] = [];
  private readonly maxBufferSize = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
  ): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logMessage = this.formatMessage(level, message, data);

    // 로그 버퍼에 추가
    this.logBuffer.push(logMessage);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // 개발 환경에서만 콘솔에 출력
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error"
          ? console.error
          : level === "warn"
            ? console.warn
            : level === "info"
              ? console.info
              : console.debug;

      consoleMethod(
        `[${logMessage.timestamp}] ${level.toUpperCase()}: ${message}`,
        data ? data : "",
      );
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  getRecentLogs(count: number = 100): LogMessage[] {
    return this.logBuffer.slice(-count);
  }

  clearLogs() {
    this.logBuffer = [];
  }
}

export const logger = Logger.getInstance();
