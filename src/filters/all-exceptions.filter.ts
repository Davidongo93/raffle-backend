import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryError } from 'sequelize';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = 500;
        let message = 'Error interno del servidor';
        let errorType = 'InternalServerError';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.message;
            errorType = exception.constructor.name;
        } else if (exception instanceof QueryError) {
            status = 500;
            message = 'Error en la base de datos';
            errorType = 'DatabaseError';
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            errorType,
            message,
            details: exception instanceof HttpException
                ? exception.getResponse()
                : null,
        });
    }
}