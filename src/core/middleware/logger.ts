/* eslint-disable no-console */
import chalk, { ChalkInstance } from 'chalk';
import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';

@Injectable()
export class CustomLogger implements LoggerService {
  private readonly colors: Record<
    LogLevel | 'sequelize' | 'request',
    ChalkInstance
  > = {
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    log: chalk.green,
    debug: chalk.blue,
    verbose: chalk.cyan,
    sequelize: chalk.magenta,
    request: chalk.hex('#FFA500'), // naranja
  };

  log(message: string, context?: string): void {
    this.print('log', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.print('error', message, context);
    if (trace !== null) {
      console.error(this.colors.error(trace));
    }
  }

  warn(message: string, context?: string): void {
    this.print('warn', message, context);
  }

  debug(message: string, context?: string): void {
    this.print('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    this.print('verbose', message, context);
  }

  sequelize(message: string): void {
    console.log(this.colors.sequelize(`[Sequelize] ${message}`));
  }

  request(message: string): void {
    console.log(this.colors.request(`[Request] ${message}`));
  }

  private print(level: LogLevel, message: string, context?: string): void {
    const color = this.colors[level];
    const timestamp = new Date().toISOString();
    const formatedTimestamp = formatDateToLocal(timestamp);
    const contextPart = context !== null ? `[${context}]` : '';

    console.log(
      color(
        `${contextPart}     - ${formatedTimestamp}     ${level.toUpperCase()} [ ${message} ]`,
      ),
    );
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return ['log', 'warn', 'error'].includes(level);
    }
    return true;
  }
}
function formatDateToLocal(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    // timeZone: 'UTC', // Opcional: elimina esto si quieres hora local
  }).format(date);
}
