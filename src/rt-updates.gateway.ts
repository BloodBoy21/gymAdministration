import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4000)
export class RtUpdatesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('rtupdates');
  afterInit(server: Server) {
    this.logger.log('Server initialized');
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`${client.id} connected`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`${client.id} disconnected`);
  }
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello world!';
  }
}
