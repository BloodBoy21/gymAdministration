import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ValidationError } from 'sequelize';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
import { Membership } from './membership.enum';
import { Op } from 'sequelize';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { join } from 'path';
import * as util from 'util';
import { parseUser } from '../rt-updates.gateway';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';
const toUnixTime = 60 * 60 * 24 * 1000;

const timePerMembership = {
  [Membership.STANDARD]: 30,
  [Membership.PREMIUM]: 90,
  [Membership.GOLD]: 180,
  [Membership.PLATINUM]: 365,
};

const isAValidDate = (date: string | Date) => {
  if (date instanceof Date) {
    return true;
  }
  return !isNaN(Date.parse(date));
};

export const getExpirationDate = (membership: string, date?: Date) => {
  const today: Date = isAValidDate(date) ? date : new Date();
  const expire =
    today.getTime() + timePerMembership[membership.toUpperCase()] * toUnixTime;
  return new Date(expire);
};

const membershipIsNotValid = (user: User) => {
  const today = new Date();
  const expired = user?.membershipExpiration;
  return today.getTime() > expired?.getTime();
};

const checkUserMembership = async (user: User) => {
  if (membershipIsNotValid(user)) {
    user.isActive = false;
    await user.save();
  }
};
const membershipTypeIsValid = (user: UserDto) => {
  if (Membership[user?.membership.toUpperCase()] === undefined) {
    throw new Error('Invalid membership');
  }
  user.membership = Membership[user.membership.toUpperCase()];
  return user;
};
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly userModel: typeof User;
  private readonly mailService: MailService;
  constructor(
    mailService: MailService,
    @InjectModel(User)
    userModel: typeof User,
  ) {
    this.userModel = userModel;
    this.mailService = mailService;
  }

  async addUser(user: UserDto) {
    try {
      user = membershipTypeIsValid(user);
      this.logger.debug(`Adding user ${user.email}`);
      const newUser = new this.userModel(user);
      newUser.membershipExpiration = getExpirationDate(user.membership);
      await newUser.save();
      await this.mailService.newMember(newUser);
      return { user: newUser, error: null };
    } catch (e) {
      const erroMessage =
        e instanceof ValidationError ? e.errors[0].message : e.message;
      this.logger.error(erroMessage);
      return { user: null, error: erroMessage };
    }
  }

  async getUsers(): Promise<UserWsTransferDto[]> {
    const users = await this.userModel.findAll({ raw: true });
    users.map(async (user) => {
      await checkUserMembership(user);
      return user;
    });
    return parseUser(users) as UserWsTransferDto[];
  }

  async getUser(id: string): Promise<UserWsTransferDto> {
    const user = await this.userModel.findByPk(id);
    await checkUserMembership(user);
    return parseUser(user) as UserWsTransferDto;
  }

  async updateUser(id: string, user: UserDto) {
    if (!(await this.userModel.findByPk(id))) {
      throw new Error('User does not exist in database');
    }
    user = membershipTypeIsValid(user);
    const updatedUser = (
      await this.userModel.update(user, {
        returning: true,
        where: { id },
      })
    )[1][0];
    this.logger.debug(`Updating user ${user.email}`);
    updatedUser.membershipExpiration = getExpirationDate(
      user.membership,
      user?.date,
    );
    await updatedUser.save();
    this.logger.debug(`User ${user.email} updated`);
    return parseUser(updatedUser) as UserWsTransferDto;
  }

  async deleteUser(id: string) {
    const deletedUsersCount = await this.userModel.destroy({ where: { id } });
    return deletedUsersCount > 0;
  }

  async reActivateMembership(id: string, membership?: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new Error('User does not exist in database');
    user.membership = membership ?? user.membership;
    user.membershipExpiration = getExpirationDate(user.membership);
    user.isActive = true;
    await user.save();
    this.logger.debug(`User ${user.email} re-activated`);
    return user;
  }

  //Get Users with membership expired to send email
  async getUsersToSendMail(date: Date) {
    const users: User[] = await this.userModel.findAll({
      where: {
        membershipExpiration: {
          [Op.lt]: date,
        },
      },
    });
    return users;
  }

  //Exporting users to csv
  async exportUsersToCsv(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const users = await this.userModel.toCsv();
      const csvPath = join(__dirname, '../', 'csvFolder');
      if (!fs.existsSync(csvPath)) {
        await util.promisify(fs.mkdir)(csvPath, { recursive: true });
      }
      const creationDate = new Date().toLocaleDateString().replace(/\//g, '-');
      csv
        .writeToPath(`${csvPath}/users-${creationDate}.csv`, users, {
          headers: true,
        })
        .on('finish', () => {
          resolve(`${csvPath}/users-${creationDate}.csv`);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
