import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, map } from 'rxjs';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const reply = httpContext.getResponse<FastifyReply>();
    const requestId: string = (request.headers['x-correlation-id'] as string) || reply.getHeader('x-correlation-id')?.toString() || '';
    return next.handle().pipe(
      map((data: unknown) => {
        const body: SuccessEnvelope<unknown> = {
          success: true,
          data,
          requestId,
          timestamp: new Date().toISOString(),
        };
        return body;
      }),
    );
  }
}

export const responseEnvelopeInterceptor: ResponseEnvelopeInterceptor = new ResponseEnvelopeInterceptor();

