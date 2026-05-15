export enum RoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class Role {
  private constructor(private readonly value: RoleEnum) {}

  static user(): Role {
    return new Role(RoleEnum.USER);
  }

  static admin(): Role {
    return new Role(RoleEnum.ADMIN);
  }

  static from(value: string): Role {
    if (!Object.values(RoleEnum).includes(value as RoleEnum)) {
      throw new Error(`Invalid role: ${value}`);
    }
    return new Role(value as RoleEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }

  isAdmin(): boolean {
    return this.value === RoleEnum.ADMIN;
  }
}
