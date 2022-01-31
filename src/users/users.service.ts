import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
import { Membership } from './membership.enum';
import { Op } from 'sequelize';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { join } from 'path';
import * as util from 'util';
const toUnixTime = 60 * 60 * 24 * 1000;

const timePerMembership = {
  [Membership.STANDARD]: 30,
  [Membership.PREMIUM]: 90,
  [Membership.GOLD]: 180,
  [Membership.PLATINUM]: 365,
};

const getExpirationDate = (membership: string) => {
  const today = new Date();
  const expire = today.getTime() + timePerMembership[membership] * toUnixTime;
  return new Date(expire);
};

const membershipIsNotValid = (user: User) => {
  const today = new Date();
  const expired = new Date(user.membershipExpiration);
  return today.getTime() > expired.getTime();
};
const desactivateMembership = (user: User) => {
  user.isActive = false;
  user.membership = null;
  user.save();
};
const checkUserMembership = (user: User) => {
  if (membershipIsNotValid(user)) {
    desactivateMembership(user);
  }
};
const membershipTypeIsValid = (user: UserDto) => {
  user.membership = user?.membership.toUpperCase();
  if (Membership[user.membership] === undefined) {
    throw new Error('Invalid membership');
  }
  return user;
};
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly mailService: MailService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async addUser(user: UserDto) {
    user = membershipTypeIsValid(user);
    this.logger.debug(`Adding user ${user.email}`);
    try {
      const newUser = new this.userModel(user);
      newUser.membershipExpiration = getExpirationDate(user.membership);
      await newUser.save();
      await this.mailService.newMember(newUser);
      return { user: newUser, error: null };
    } catch (e) {
      const erroMessage = e.errors[0].message;
      this.logger.error(erroMessage);
      return { user: null, error: erroMessage };
    }
  }
  async getUsers(): Promise<User[]> {
    const users = await this.userModel.findAll({ raw: true });
    return users.map((user) => {
      checkUserMembership(user);
      return user;
    });
  }
  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    checkUserMembership(user);
    return user;
  }
  async updateUser(id: string, user: UserDto) {
    user = membershipTypeIsValid(user);
    const updatedUser = await this.userModel.update(user, { where: { id } });
    return updatedUser[1][0];
  }
  async deleteUser(id: string) {
    const deletedUsersCount = await this.userModel.destroy({ where: { id } });
    return deletedUsersCount > 0;
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
