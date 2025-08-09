import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisEventBusService } from './redis-event-bus.service';
import { RedisMicroserviceHandler } from './redis-microservice.handler';

@Module({
  imports: [ConfigModule],
  controllers: [RedisMicroserviceHandler],
  providers: [RedisEventBusService],
  exports: [RedisEventBusService],
})
export class RedisEventBusModule {}

