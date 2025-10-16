import { STATUSES } from '@/common/constants';
import type { UserLevel } from '@/common/model/group';

export interface UserGroupInterface {
  id: string;
  name: string;
  description: string;
  createDate: Date;
  createBy?: string;
  isDelete: boolean;
  status: string;
  groupType: string;
  typeOfPrivacy: string;
  users: UserLevel[];
  avatar: string;
  groupLeaderId?: string;
}

export type ShortGroup = {
  id: string
  name: string
  permission: string
}

export class UserGroup implements UserGroupInterface {
  id: string;

  name: string;

  description: string;

  createDate: Date;

  createBy?: string;

  isDelete: boolean;

  status: string;

  groupType: string;

  typeOfPrivacy: string;

  users: UsersInterface[];

  avatar: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.createDate = new Date();
    this.isDelete = false;
    this.status = STATUSES.ACTIVE;
    this.groupType = '';
    this.typeOfPrivacy = '';
    this.users = [];
    this.avatar = '';
  }
}

export interface UserGroupEdge {
  cursor: string;
  node: UserGroup | null;
}

export interface UsersInterface {
  id: string;
  level?: string;
  fullName: string;
  email: string;
  position: string;
}

export enum Level {
  MANAGE,
  MEMBER
}

export enum Permission {
  VIEW = 'VIEW',
  READ = 'READ',
  CONTRIBUTE = 'CONTRIBUTE',
  EDITOR = 'EDITOR',
  FULL_CONTROL = 'FULL_CONTROL'
}

export class UserLike {
  id: string | undefined;

  name: string;

  email: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.email = '';
  }
}

export class UserGroupInfo {
  id: string;

  name: string;

  userId: string;

  username: string;

  email: string;

  fullName: string;

  birthDay: string;

  avatar: string;

  phone: string;

  roles: [];

  constructor() {
    this.id = '';
    this.name = '';
    this.userId = '';
    this.username = '';
    this.fullName = '';
    this.birthDay = '';
    this.avatar = '';
    this.phone = '';
    this.roles = [];
    this.email = '';
  }
}
