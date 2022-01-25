import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({ primaryKey: true, defaultValue: DataType.UUIDV4 })
  id?: string;
  @Column({ allowNull: false, validate: { is: /[a-zA-Z]/gm } })
  firstName: string;
  @Column({ allowNull: false, validate: { is: /[a-zA-Z]/gm } })
  lastName: string;
  @Column({ defaultValue: true })
  isActive: boolean;
  @Column({ unique: true, validate: { isEmail: true } })
  email: string;
  @Column({ allowNull: false, defaultValue: new Date() })
  joinedAt: Date;
  @Column
  membership: string;
  @Column
  membershipExpiration: Date;
}
