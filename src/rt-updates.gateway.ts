import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { UserWsDto } from './users/dto/userWS.dto';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';

export function parseUser(
  user: UserWsTransferDto | UserWsTransferDto[],
): UserWsTransferDto | UserWsTransferDto[] {
  if (!user) return user;
  if (Array.isArray(user)) {
    const users: UserWsTransferDto[] = [];
    user.map((u) => {
      users.push(parseUser(u) as UserWsTransferDto);
    });
    return users;
  }
  return new UserWsTransferDto().send(user);
}

@WebSocketGateway({ cors: true })
export class RtUpdatesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly usersService: UsersService;
  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }
  private logger: Logger = new Logger('rtupdates');
  @WebSocketServer() server: Server;
  afterInit(): void {
    this.logger.log('Server initialized');
  }
  async handleConnection(client: Socket): Promise<void> {
    this.logger.debug(`${client.id} connected`);
    client.emit('getUsers', (await this.handleGetUsers()).data);
  }
  handleDisconnect(client: Socket): void {
    this.logger.debug(`${client.id} disconnected`);
  }
  // Events to emit
  @SubscribeMessage('add')
  async handleAdd(client: Socket, payload: UserDto) {
    const { user, error } = await this.usersService.addUser(payload);
    if (!error) {
      (await this.server.fetchSockets()).forEach((socket) => {
        if (socket.id !== client.id) {
          socket.emit('userAdded', JSON.stringify(parseUser(user)));
        }
      });
    }
    return { event: 'userAddedStatus', data: JSON.stringify({ error }) };
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
  @SubscribeMessage('deleteUser')
  async handleDelete(client: Socket, payload: UserWsDto) {
    this.logger.debug(`Deleting user ${payload.id}`);
    const user: UserWsTransferDto = await this.usersService.getUser(payload.id);
    const deleted: boolean = await this.usersService.deleteUser(payload.id);
    (await this.server.fetchSockets()).forEach((socket) => {
      this.logger.debug(`Sending deleteUser event to ${socket.id}`);
      if (socket.id !== client.id) {
        socket.emit('deleteUser', JSON.stringify({ deleted, id: payload.id }));
      }
    });
    this.server.emit(
      'deleteUserStatus',
      JSON.stringify({ deleted, user: user.firstName }),
    );
  }
}
