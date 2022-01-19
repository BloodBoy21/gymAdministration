import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
@WebSocketGateway(4000)
export class RtUpdatesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}
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
  @SubscribeMessage('add')
  async handleMessage(client: Socket, payload: UserDto) {
    const newUser = await this.usersService.addUser(payload);
    return { event: 'add', data: newUser };
  }
}
