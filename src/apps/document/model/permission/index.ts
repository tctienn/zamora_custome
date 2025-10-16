import type { OrganizationInterface } from '@/apps/document/model/organization';

export type UserOrganizationRole = {
    id: string
    userId: string
    organization: OrganizationInterface
    role: Role
    delegateId?: string
}

type Role = {
    code: string
    name: string,
    permissions: string[]
}

export enum RoleType {
    VAN_THU = 'VAN_THU', LANH_DAO = 'LANH_DAO', CHUYEN_VIEN = 'CHUYEN_VIEN', TRO_LY = 'TRO_LY', THU_KY = 'THU_KY'
}

export function isClerk(role: string) {
  return role.startsWith(RoleType.VAN_THU);
}

export const roleName: Record<RoleType, string> = {
  VAN_THU: 'Văn thư',
  LANH_DAO: 'Lãnh đạo',
  CHUYEN_VIEN: 'Chuyên viên',
  TRO_LY: 'Trợ lý',
  THU_KY: 'Thư ký'
};