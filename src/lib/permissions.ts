export enum RoleEnum {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export interface AuthUser {
  id: string;
  userName: string;
  email: string;
  role: number;
}

export const permissions = {
  hasDashboardAccess(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    return user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN;
  },

  isSuperAdmin(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    return user.role === RoleEnum.SUPER_ADMIN;
  },

  isAdmin(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    return user.role === RoleEnum.ADMIN;
  },

  canManageAdmins(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    return user.role === RoleEnum.SUPER_ADMIN;
  },
};
