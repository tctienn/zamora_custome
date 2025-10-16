import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

import { findRoleByUserId } from '@/apps/admin/api/graphql/role-default';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { administrativeUserOrganizationRoles, getDelegateRoles, userOrganizationRoles, } from '@/apps/document/api/graphql/permission';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import type { UserOrganizationRole } from '@/apps/document/model/permission';
import { useUserStore } from '@/common/store/user';

export const useDocumentRolesStore = defineStore(
  'document_role',
  () => {
    const administrativeRoles = computed(() => (administrativeResult.value?.userOrganizationRoles || []) as UserOrganizationRole[],);
    const documentRoles = computed(() => (docResult.value?.userOrganizationRoles || []) as UserOrganizationRole[],);
    const delegateRoles = computed(() => (delegateResult.value?.delegateRoles || []) as UserOrganizationRole[]);
    const allRoles = computed(() => [
      ...administrativeRoles.value,
      ...documentRoles.value,
    ]);
    const currentDocumentRole = ref<UserOrganizationRole>();
    const type = computed(() => currentDocumentRole.value?.organization?.type);
    const currentPermissions = computed(
      () => currentDocumentRole.value?.role?.permissions || [],
    );
    const currentOrgId = computed(
      () => currentDocumentRole.value?.organization?.id,
    );
    const defaultRoleId = computed(
      (): string => defaultResult.value?.findRoleByUserId || '',
    );
    const defaultRole = computed(() =>
      allRoles.value.find((r) => r.id === defaultRoleId.value),
    );

    const { user } = storeToRefs(useUserStore());
    const moreInfoStore = useUserMoreInfoStore();
    const { usersMoreInfo } = storeToRefs(moreInfoStore);
    moreInfoStore.fetchAllUsers();
    const {
      result: docResult,
      load: docLoad,
      refetch: docReFetch,
    } = userOrganizationRoles();
    const {
      result: administrativeResult,
      load: administrativeLoad,
      refetch: administrativeReFetch,
    } = administrativeUserOrganizationRoles();
    const {
      result: delegateResult,
      load: delegateLoad,
      refetch: delegateReFetch,
    } = getDelegateRoles();
    const {
      result: defaultResult,
      load: defaultLoad,
      refetch: defaultReFetch,
    } = findRoleByUserId(user.value?.id || '');

    watch(
      user,
      () => {
        if (user.value?.id) {
          Promise.all([
            docLoad() || docReFetch(),
            administrativeLoad() || administrativeReFetch(),
            delegateLoad() || delegateReFetch(),
            defaultLoad() || defaultReFetch({ userId: user.value?.id || '' }),
          ])?.then(() => {
            if (!currentDocumentRole.value) {
              currentDocumentRole.value =
                defaultRole.value || allRoles.value[0];
            }
            if (!(allRoles.value.find((r) => r.id === currentDocumentRole.value?.id)
              || delegateRoles.value.find((r) => r.id === currentDocumentRole.value?.id))) {
              currentDocumentRole.value =
                defaultRole.value || allRoles.value[0];
            }
          });
        } else {
          currentDocumentRole.value = undefined;
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const userDeptRole = computed(
      (): UserDeptRoleInput => ({
        userId: currentDocumentRole.value?.userId || '',
        userName: currentDocumentRole.value?.userId ? usersMoreInfo.value[currentDocumentRole.value?.userId || '']?.fullName || '' : '',
        deptId: currentDocumentRole.value?.organization?.id || '',
        deptName: currentDocumentRole.value?.organization?.name || '',
        roleId: currentDocumentRole.value?.role?.code || '',
        roleName: currentDocumentRole.value?.role?.name || '',
        type:
          currentDocumentRole.value?.organization?.type
          || OrganizationType.ADMINISTRATIVE,
        delegateId: currentDocumentRole.value?.delegateId,
      }),
    );

    function hasDocumentPermission(per: string) {
      return currentPermissions.value.some((p) => p.startsWith(per));
    }

    function resetStore() {
      currentDocumentRole.value = undefined;
    }

    return {
      allRoles,
      currentDocumentRole,
      currentOrgId,
      defaultRoleId,
      defaultRole,
      type,
      currentPermissions,
      userDeptRole,
      hasDocumentPermission,
      resetStore,
      documentRoles,
      administrativeRoles,
      delegateRoles
    };
  },
  { persist: true },
);
