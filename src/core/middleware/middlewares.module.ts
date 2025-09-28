import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { CustomLogger } from './logger';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // <-- Usamos nuestro interceptor
    },
    CustomLogger, // <-- Proveemos el logger directamente
    LoggerMiddleware,
  ],
})
export class MiddlewaresModule implements NestModule {
  constructor(private configService: ConfigService) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
