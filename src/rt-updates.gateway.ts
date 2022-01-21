import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { UserWsDto } from './users/dto/userWS.dto';
@WebSocketGateway()
export class RtUpdatesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}
  private logger: Logger = new Logger('rtupdates');
  afterInit() {
    this.logger.log('Server initialized');
  }
  handleConnection(client: Socket) {
    this.logger.log(`${client.id} connected`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`${client.id} disconnected`);
  }
  // Events to emit
  @SubscribeMessage('add')
  async handleAdd(client: Socket, payload: UserDto) {
    const newUser = await this.usersService.addUser(payload);
    return { event: 'userAdded', data: newUser };
  }
  @SubscribeMessage('getUsers')
  async handleGetUsers() {
    const users = await this.usersService.getUsers();
    return { event: 'get', data: users };
  }
  @SubscribeMessage('getUser')
  async handleGetUser(client: Socket, payload: UserWsDto) {
    const user = await this.usersService.getUser(payload.id);
    return { event: 'getUser', data: user };
  }
  @SubscribeMessage('update')
  async handleUpdate(client: Socket, payload: UserWsDto) {
    await this.usersService.updateUser(payload.id, payload.user);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: string) {
    client.emit('message', 'Te odio perra');
    this.logger.log(`Message from ${client.id}: ${payload}`);
  }
}
