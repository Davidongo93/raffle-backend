import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CustomLogger } from '../middleware/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: { method: string; url: string } = context
      .switchToHttp()
      .getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.debug(
      `Incoming request: ${method} ${url}`,
      'LoggingInterceptor',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Request completed: ${method} ${url} (${responseTime}ms)`,
            'LoggingInterceptor',
          );
        },
        error: (err: Error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Request failed: ${method} ${url} (${responseTime}ms)`,
            err.stack,
            'LoggingInterceptor',
          );
        },
      }),
    );
  }
}
