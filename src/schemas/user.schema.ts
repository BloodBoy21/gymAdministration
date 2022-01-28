import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  underscored: true,
  tableName: 'users',
  updatedAt: false,
  createdAt: false,
})
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
  static async toCsv() {
    type Override<T1, T2> = Omit<T1, keyof T2> & T2;
    type csvUser = Override<
      User,
      { membershipExpiration: string; joinedAt: string }
    >;
    const users = await this.findAll({ raw: true });
    return users.map((user) => {
      const userCsv = user as unknown as csvUser;
      userCsv.membershipExpiration = new Date(
        user.membershipExpiration,
      ).toLocaleDateString();
      userCsv.joinedAt = new Date(user.joinedAt).toLocaleDateString();
      return userCsv;
    });
  }
}
