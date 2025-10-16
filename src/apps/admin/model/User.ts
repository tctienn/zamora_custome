import type { Permission } from '@/apps/admin/model/userGroup';

export interface UserInterface {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  locked: boolean;
  status?: string;
  birthDay?: string | Date | null;
  avatar: string;
  mainSign?: string;
  flashingSignature?: string;
  createDate?: string | Date;
  userCode?: string;
  phone?: string;
  roles: UserRole[];
  using2FA?: boolean;
  organizationCode?: string[];
  organizationName?: string[];
  organizationId?: string[];
  simCa?: string;
  gender?: number;
  active?: boolean;
  position?: string[];
  positionName?: string[];
}

export interface UserUpdateNewPasswordInterface extends UserInterface {
  updateNewPassword: boolean;
}

export interface UserEdge {
  cursor: string;
  node: UserInterface | null;
}

export interface UserMoreInfoEdge {
  cursor: string;
  node: UserMoreInfo | null;
}

export interface UserMoreInfo {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  birthDay: Date;
  phone: string;
  positionName: string[];
  employeeId: string;
  departments: Department[];
  avatarError?: boolean;
  gender?: number;
  position: string[];
  roles: string[];
  //Cho AppUserDeptRole overlay
  deptRoleName?: string;
  role?: string;
  userId?: string;
  organizationName?: string[];
  avatar2?: string;
}

export interface Department {
  code: string;
  name: string;
  id: string;
}

export interface UserInGroupInterface {
  id: string;
  level?: string;
  email: string;
  fullName: string;
  permission: Permission | null;
  positionName?: string[];
  departments?: Department[];
}

export class UserInGroup implements UserInGroupInterface {
  id: string;

  level?: string;

  email: string;

  fullName: string;

  permission: Permission | null;

  positionName?: string[];

  departments?: Department[];

  constructor(
    id: string,
    level: string,
    email: string,
    fullName: string,
    permission: Permission | null,
  ) {
    this.id = id;
    this.level = level;
    this.email = email;
    this.fullName = fullName;
    this.permission = permission;
    this.positionName = [];
    this.departments = [];
  }
}

interface UserRole {
  code: string;
  name: string;
}
