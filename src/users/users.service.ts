import { Injectable } from '@nestjs/common';
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
  const expired = today.getTime() + timePerMembership[membership] * toUnixTime;
  return new Date(expired);
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

@Injectable()
export class UsersService {
  constructor(
    private readonly mailService: MailService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async addUser(user: UserDto): Promise<User> {
    const newUser = new this.userModel(user);
    newUser.membershipExpiration = getExpirationDate(user.membership);
    await this.mailService.newMember(newUser);
    return await newUser.save();
  }
  async getUsers(): Promise<User[]> {
    const users = await this.userModel.findAll();
    return users.map((user) => {
      if (membershipIsNotValid(user)) {
        desactivateMembership(user);
      }
      return user;
    });
  }
  async getUser(id: string): Promise<User> {
    //TODO: check if user membership is valid and if not desactivate it
    return await this.userModel.findByPk(id);
  }
  async updateUser(id: string, user: UserDto) {
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
