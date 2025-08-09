import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class EnvelopeExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let code: string | undefined = 'InternalError';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: unknown = exception.getResponse();
      message = (response as any)?.message || (exception as any).message || 'Error';
      code = (exception as any).name;
    } else if (exception instanceof QueryFailedError) {
      const driverCode: string | undefined = (exception as any)?.code;
      if (driverCode === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Unique constraint violation';
        code = 'UniqueViolation';
      } else if (driverCode === '42P01') {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database schema not initialized (table missing). Run migrations.';
        code = 'SchemaNotInitialized';
      } else if (driverCode === '08001') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection failure';
        code = 'DatabaseUnavailable';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any).message || 'Database error';
        code = driverCode || 'DatabaseError';
      }
    } else if ((exception as any)?.name && String((exception as any).name).startsWith('Mongo')) {
      const name = (exception as any).name as string;
      if (name.includes('Network')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Event store (MongoDB) unavailable';
        code = 'MongoUnavailable';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any).message || 'MongoDB error';
        code = name;
      }
    }

    const requestId: string = (request.headers['x-correlation-id'] as string) || reply.getHeader('x-correlation-id')?.toString() || '';
    const body = {
      success: false,
      error: { message, code },
      requestId,
      timestamp: new Date().toISOString(),
    };

    reply.status(status).send(body);
  }
}

