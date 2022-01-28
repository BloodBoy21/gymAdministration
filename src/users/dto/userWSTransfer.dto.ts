export class UserWsTransferDto {
  id?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  email: string;
  membership: string;
  membershipExpiration: Date;
  send?(user: UserWsTransferDto) {
    return user
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          membership: user.membership,
          membershipExpiration: user.membershipExpiration,
          email: user.email,
        }
      : ({} as UserWsTransferDto);
  }
}
