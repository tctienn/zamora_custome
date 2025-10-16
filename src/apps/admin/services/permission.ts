import { getRolePermissions } from '@/apps/admin/api/rest/role';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';

const DOC_CODE = '/DOCUMENT';

function loadPermission() {
  getRolePermissions().then((data) => {
    if (data) {
      usePermissionStore().permissions = data;
    }
  });
}

function hasPermission(per: string) {
  if (per.includes(DOC_CODE)) {
    return useDocumentRolesStore().hasDocumentPermission(per);
  } else {
    return usePermissionStore().hasPermission(per);
  }
}

export { hasPermission, loadPermission };