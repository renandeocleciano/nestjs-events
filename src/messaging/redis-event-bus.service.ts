import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

const DOMAIN_CHANNEL = 'financial.domain.events';

@Injectable()
export class RedisEventBusService implements OnModuleInit, OnModuleDestroy {
  private publisher!: Redis;
  private subscriber!: Redis;

  public constructor(private readonly config: ConfigService) {}

  public onModuleInit(): void {
    const host: string = this.config.get<string>('REDIS_HOST', 'localhost');
    const port: number = parseInt(this.config.get<string>('REDIS_PORT', '6379'), 10);
    const db: number = parseInt(this.config.get<string>('REDIS_DB', '0'), 10);
    this.publisher = new IORedis({ host, port, db });
    this.subscriber = new IORedis({ host, port, db });
    this.subscribe((channel, message) => {
      // eslint-disable-next-line no-console
      console.log(`[RedisEventBus] ${channel}: ${message}`);
    });
  }

  public async onModuleDestroy(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  public async publish(eventName: string, payload: Record<string, unknown>, metadata: Record<string, unknown>): Promise<number> {
    const envelope = { eventName, payload, metadata, correlationId: (metadata as any)?.correlationId, occurredAt: new Date().toISOString() };
    const message: string = JSON.stringify(envelope);
    return await this.publisher.publish(DOMAIN_CHANNEL, message);
  }

  public async subscribe(handler: (channel: string, message: string) => void): Promise<void> {
    await this.subscriber.subscribe(DOMAIN_CHANNEL);
    this.subscriber.on('message', handler);
  }
}

