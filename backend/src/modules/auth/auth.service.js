export class AuthService {
  constructor({
    volunteers,
    organizations,
    admins,
    passwordHasher,
    tokenIssuer,
  }) {
    Object.assign(this, {
      volunteers,
      organizations,
      admins,
      passwordHasher,
      tokenIssuer,
    });
  }
  findAccount(role, email) {
    return role === "volunteer"
      ? this.volunteers.findOne({ email })
      : this.organizations.findOne({ email });
  }
}
