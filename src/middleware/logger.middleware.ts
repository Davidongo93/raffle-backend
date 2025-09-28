import { Injectable, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';

import { CustomLogger } from './logger';

interface ExtendedRequest extends Request {
  body: unknown;
}

interface ExtendedResponse extends Response {
  locals: {
    responseBody?: unknown;
  };
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new CustomLogger();

  use(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): void {
    // Función para formatear JSON con colores
    const formatJson = (obj: unknown): string => {
      if (obj === null || obj === undefined) {
        return chalk.gray('null');
      }
      if (typeof obj !== 'object') {
        return chalk.green(JSON.stringify(obj));
      }

      const jsonString = JSON.stringify(obj, null, 2);
      return jsonString
        .replace(/"([^"]+)":/g, chalk.magentaBright('"$1":'))
        .replace(/: ("[^"]+")/g, `: ${chalk.greenBright('$1')}`)
        .replace(/: (-?\d+\.?\d*)/g, `: ${chalk.yellowBright('$1')}`)
        .replace(/: (true|false)/g, `: ${chalk.blueBright('$1')}`)
        .replace(/: null/g, `: ${chalk.gray('null')}`);
    };

    // Formato mejorado con información visualmente organizada
    morgan((tokens, req: ExtendedRequest, res: ExtendedResponse) => {
      const method = tokens.method(req, res) ?? 'UNKNOWN';
      const url = tokens.url(req, res) ?? '/';
      const rawStatus = tokens.status(req, res) ?? '0';
      const status = parseInt(rawStatus, 10);
      const responseTime = tokens['response-time'](req, res) ?? '0';
      const contentLength = tokens.res(req, res, 'content-length') ?? '0';
      const remoteAddr = tokens['remote-addr'](req, res) ?? '0.0.0.0';
      const userAgent =
        tokens['user-agent'](req, res)?.slice(0, 40) ?? 'No User Agent';
      const timestamp = new Date().toISOString();

      // Colores dinámicos basados en valores
      const coloredMethod = this.getColoredMethod(method);
      const coloredStatus = this.getColoredStatus(status);
      const coloredResponseTime = this.getColoredResponseTime(
        parseFloat(responseTime),
      );
      const coloredContentLength = this.getColoredContentLength(contentLength);

      // Obtener cuerpos de solicitud/respuesta con manejo seguro de tipos
      const requestBody =
        typeof req.body !== 'undefined' && req.body !== null
          ? formatJson(req.body)
          : chalk.gray('No body');

      const responseBody =
        typeof res.locals.responseBody !== 'undefined' &&
          res.locals.responseBody !== undefined
          ? formatJson(res.locals.responseBody)
          : chalk.gray('No response body');

      // Diseño visual mejorado
      const separator = chalk.hex('#FF6D00')('│');
      const horizontalLine = chalk.hex('#FF6D00')('├' + '─'.repeat(78) + '┤');
      const topLine = chalk.hex('#FF6D00')('┌' + '─'.repeat(78) + '┐');
      const bottomLine = chalk.hex('#FF6D00')('└' + '─'.repeat(78) + '┘');

      const logOutput = [
        topLine,
        `${separator} ${chalk.bold.hex('#00B4D8')('Request:')} ${coloredMethod} ${chalk.underline(url)} ${separator}`,
        `${separator} ${chalk.bold.hex('#00B4D8')('Status:')} ${coloredStatus} | ${chalk.bold.hex('#00B4D8')('Time:')} ${coloredResponseTime} | ${chalk.bold.hex('#00B4D8')('Size:')} ${coloredContentLength} ${separator}`,
        `${separator} ${chalk.bold.hex('#00B4D8')('From:')} ${chalk.hex('#9D4EDD')(remoteAddr)} | ${chalk.bold.hex('#00B4D8')('Agent:')} ${chalk.hex('#FF9E00')(userAgent)} ${separator}`,
        `${separator} ${chalk.bold.hex('#00B4D8')('Timestamp:')} ${chalk.hex('#4CC9F0')(timestamp)} ${separator}`,
        horizontalLine,
        `${separator} ${chalk.bold.hex('#FF9E00')('Request Body:')} ${separator}`,
        ...requestBody
          .split('\n')
          .map(line => `${separator} ${line} ${separator}`),
        horizontalLine,
        `${separator} ${chalk.bold.hex('#FF9E00')('Response Body:')} ${separator}`,
        ...responseBody
          .split('\n')
          .map(line => `${separator} ${line} ${separator}`),
        bottomLine,
      ].join('\n');

      // También registrar en el logger estándar para archivos
      this.logger.log(`${method} ${url} ${status} ${responseTime}ms`, 'HTTP');

      return logOutput;
    })(req, res, next);
  }

  private getColoredMethod(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return chalk.bold.hex('#4CC9F0')(method);
      case 'POST':
        return chalk.bold.hex('#52B788')(method);
      case 'PUT':
        return chalk.bold.hex('#FFD166')(method);
      case 'DELETE':
        return chalk.bold.hex('#EF476F')(method);
      case 'PATCH':
        return chalk.bold.hex('#A06CD5')(method);
      default:
        return chalk.bold.hex('#7209B7')(method);
    }
  }

  private getColoredStatus(status: number): string {
    if (status >= 500) {
      return chalk.bold.hex('#EF233C')(status.toString());
    }
    if (status >= 400) {
      return chalk.hex('#FF9E00')(status.toString());
    }
    if (status >= 300) {
      return chalk.hex('#3A86FF')(status.toString());
    }
    if (status >= 200) {
      return chalk.hex('#70E000')(status.toString());
    }
    return chalk.hex('#7209B7')(status.toString());
  }

  private getColoredResponseTime(time: number): string {
    if (time > 1000) {
      return chalk.bold.hex('#EF233C')(`${time}ms`);
    }
    if (time > 500) {
      return chalk.hex('#FF9E00')(`${time}ms`);
    }
    if (time > 200) {
      return chalk.hex('#FFD700')(`${time}ms`);
    }
    return chalk.hex('#70E000')(`${time}ms`);
  }

  private getColoredContentLength(size: string): string {
    const bytes = parseInt(size, 10);
    if (bytes > 1000000) {
      return chalk.bold.hex('#EF233C')(`${(bytes / 1000000).toFixed(1)}MB`);
    }
    if (bytes > 100000) {
      return chalk.hex('#FF9E00')(`${(bytes / 1000).toFixed(1)}KB`);
    }
    if (bytes > 10000) {
      return chalk.hex('#FFD700')(`${(bytes / 1000).toFixed(1)}KB`);
    }
    return chalk.hex('#70E000')(`${bytes}B`);
  }
}
