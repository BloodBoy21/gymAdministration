import { Model } from 'sequelize';

export interface User extends Model {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  email: string;
  joinedAt: Date;
  membership: string;
  membershipExpiration: Date;
}
