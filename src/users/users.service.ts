import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UpgradeMembershipDto } from './dto/upgradeMembership.dto';
import { UserDto } from './dto/user.dto';
import { Membership } from './membership.enum';
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

const membershipIsValid = (user: User) => {
  const today = new Date();
  const expired = new Date(user.membershipExpiration);
  return today < expired;
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
      if (!membershipIsValid(user)) {
        desactivateMembership(user);
      }
      return user;
    });
  }
  async getUser(id: string): Promise<User> {
    return await this.userModel.findByPk(id);
  }
  async updateUser(id: string, user: UserDto) {
    const updatedUser = await this.userModel.update(user, { where: { id } });
    return updatedUser[1][0];
  }
  async deleteUser(id: string) {
    await this.userModel.destroy({ where: { id } });
  }
  async upgradeMembership(id: string, data: UpgradeMembershipDto) {
    if (Membership[data.membership] === undefined) {
      throw new Error('Invalid membership');
    }
    const user = await this.userModel.findByPk(id);
    user.membership = data.membership;
    user.membershipExpiration = getExpirationDate(data.membership);
    await user.save();
  }
  async getAccess(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (!membershipIsValid(user)) {
      desactivateMembership(user);
      return false;
    }
    return true;
  }
}
