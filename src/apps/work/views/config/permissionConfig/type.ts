import type { RoleInterface } from '@/apps/admin/model/role';
import type { UserInterface } from '@/common/model/User';

export type UserChangeEvent = {
  selectedUser: UserInterface,
  selectedRole: RoleInterface,
  selectedType: string
}
export type RoleChangeEvent = {
  selectedRole: RoleInterface,
  selectedType: string
}