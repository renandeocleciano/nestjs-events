import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class RedisMicroserviceHandler {
  @MessagePattern('financial.notifications.ping')
  public handlePing(@Payload() message: unknown): { pong: true } {
    return { pong: true };
  }
}

