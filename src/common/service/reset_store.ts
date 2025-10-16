import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useEcmPermissions } from '@/apps/ecm/store/ecm_group_permissions';
import { logout } from '@/common/api/rest/authApi';
import { toastWarn } from '@/common/helpers/custom-toast-service';
import i18n from '@/common/i18n';
import router from '@/common/router';
import { useMenuStore } from '@/common/store/menu';
import { useUserStore } from '@/common/store/user';

const { t } = i18n.global;

export function logoutAndRedirectToLogin() {
  const { authentication } = useUserStore();
  if (authentication) {
    logout().finally(resetStoreAndRedirectToLogin);
  } else {
    resetStoreAndRedirectToLogin();
  }
}

export function resetStoreAndRedirectToLogin() {
  resetStore();
  router.replace({ name: 'Login' }).then(() => {
    toastWarn({ message: t('common.sessionTimeout') });
  });
}

export function resetStore() {
  //localStorage.clear();
  // Clear store
  useUserStore().resetUserStore();
  useMenuStore().resetMenuStore();
  usePermissionStore().resetStore();
  useEcmPermissions().resetStore();
  useDocumentRolesStore().resetStore();
  useUserMoreInfoStore().resetStore();
}