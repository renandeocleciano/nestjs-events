import 'reflect-metadata';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import fastifyCors from '@fastify/cors';
// import fastifyHelmet from '@fastify/helmet';

import { AppModule } from './app.module';
import { responseEnvelopeInterceptor } from './common/interceptors/response.interceptor';
import { correlationIdMiddleware } from './common/middleware/correlation-id.middleware';

async function bootstrap(): Promise<void> {
  const isDev: boolean = process.env.NODE_ENV !== 'production';
  const fastifyAdapter: FastifyAdapter = new FastifyAdapter({
    logger: isDev
      ? {
          transport: { target: 'pino-pretty', options: { singleLine: true, colorize: true } },
          level: process.env.LOG_LEVEL || 'debug',
        }
      : { level: process.env.LOG_LEVEL || 'info' },
    genReqId: (req: any) => {
      const existing: string | undefined = (req.headers['x-correlation-id'] as string) || undefined;
      return existing ?? undefined;
    },
    trustProxy: true,
  } as any);

  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { bufferLogs: true },
  );

  const configService: ConfigService = app.get(ConfigService);
  await app.register(fastifyCors as unknown as any, { origin: true } as any);
  // await app.register(fastifyHelmet as unknown as any);

  app.use(correlationIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalInterceptors(responseEnvelopeInterceptor);
  const { EnvelopeExceptionFilter } = await import('./common/filters/envelope-exception.filter');
  app.useGlobalFilters(new EnvelopeExceptionFilter());

  const redisHost: string = configService.get<string>('REDIS_HOST', 'localhost');
  const redisPort: number = parseInt(configService.get<string>('REDIS_PORT', '6379'), 10);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: redisHost, port: redisPort },
  });

  await app.startAllMicroservices();

  app.setGlobalPrefix('api');

  const port: number = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen({ port, host: '0.0.0.0' });
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`Server started on http://localhost:${port}`);
    try {
      const fastify = (app.getHttpAdapter().getInstance() as any);
      if (typeof fastify.printRoutes === 'function') {
        fastify.printRoutes();
      }
    } catch {}
  }
}

bootstrap();

