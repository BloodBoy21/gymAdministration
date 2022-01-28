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
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';

export function parseUser(
  user: UserWsTransferDto | UserWsTransferDto[],
): UserWsTransferDto | UserWsTransferDto[] {
  if (Array.isArray(user)) {
    const users: UserWsTransferDto[] = [];
    for (const u of user) {
      users.push(parseUser(u) as UserWsTransferDto);
    }
    return users;
  }
  return new UserWsTransferDto().send(user as UserWsTransferDto);
}

@WebSocketGateway({ cors: true })
export class RtUpdatesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}
  private logger: Logger = new Logger('rtupdates');
  afterInit() {
    this.logger.log('Server initialized');
  }
  async handleConnection(client: Socket) {
    this.logger.log(`${client.id} connected`);
    client.emit('getUsers', (await this.handleGetUsers()).data);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`${client.id} disconnected`);
  }
  // Events to emit
  @SubscribeMessage('add')
  async handleAdd(client: Socket, payload: UserDto) {
    const newUser: UserWsTransferDto = await this.usersService.addUser(payload);
    return {
      event: 'userAdded',
      data: JSON.stringify(parseUser(newUser)),
    };
  }
  @SubscribeMessage('getUsers')
  async handleGetUsers() {
    const users: UserWsTransferDto[] = await this.usersService.getUsers();
    return { event: 'getUsers', data: JSON.stringify(parseUser(users)) };
  }
  @SubscribeMessage('getUser')
  async handleGetUser(client: Socket, payload: UserWsDto) {
    const user: UserWsTransferDto = await this.usersService.getUser(payload.id);
    return { event: 'getUser', data: JSON.stringify(parseUser(user)) };
  }
  @SubscribeMessage('updateUser')
  async handleUpdate(client: Socket, payload: UserWsDto) {
    const newUserData: UserWsTransferDto = await this.usersService.updateUser(
      payload.id,
      payload.user,
    );
    return {
      event: 'updateUser',
      data: JSON.stringify(parseUser(newUserData)),
    };
  }
}
