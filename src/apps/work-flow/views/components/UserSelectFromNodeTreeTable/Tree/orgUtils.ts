import type { OrgRole } from '@/apps/work-flow/model/flow';

export function getRolesByOrgId(orgId: string, orgRoles: OrgRole[]): string[] {
  return orgRoles.find(e => e.orgId === orgId)?.roles || [];
}

export function isExistOrgId(orgId: string, orgRoles: OrgRole[]): boolean {
  if (orgRoles.length === 0) {
    return false;
  }
  return orgRoles.some(e => e.orgId === orgId);
}