import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { DatabaseModule } from './database/database.module';
import { RedisEventBusModule } from './messaging/redis-event-bus.module';
import { CardsModule } from './modules/cards/cards.module';
import { HoldersModule } from './modules/holders/holders.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisEventBusModule,
    CardsModule,
    HoldersModule,
    HealthModule,
    AccountsModule,
  ],
})
export class AppModule {}

