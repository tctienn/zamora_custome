<template>
  <AppIcon
    v-tooltip.bottom='buildRoleLabel(currentDocumentRole)'
    class='cursor-pointer text-white'
    name='manage_accounts'
    size='2'
    @click='menuRef?.toggle($event)'/>
  <Menu
    ref='menuRef'
    :model='menuRoles'
    popup>
    <template #item='{item, label}'>
      <div
        class='cursor-pointer flex gap-2 p-2'
        :class='{"text-blue-500 font-semibold": item.id === currentDocumentRole?.id}'>
        <div class='w-1rem'>
          <i :class='item.icon'/>
        </div>
        {{ label }}
      </div>

    </template>
  </Menu>
</template>

<script lang='ts' setup>
import { trimEnd } from 'lodash';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { UserOrganizationRole } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { confirm } from '@/common/helpers/custom-confirmation-service';

const props = defineProps({
  routerPush: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const router = useRouter();
const {
  allRoles,
  delegateRoles,
  currentDocumentRole
} = storeToRefs(useDocumentRolesStore());
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const menuRef = ref<InstanceType<typeof Menu>>();
const menuRoles = computed(() => {
  const ownerRoles = allRoles.value.map(role => ({
    id: role.id,
    label: buildRoleLabel(role),
    icon: role.id === currentDocumentRole.value?.id ? 'pi pi-check' : 'pi',
    disabled: () => role.id === currentDocumentRole.value?.id,
    command: () => confirmChangeRole(role)
  } as MenuItem));
  return delegateRoles.value.length > 0 ? [...ownerRoles, {
    label: t('admin.user.userDetail.delegateInfo'),
    items: delegateRoles.value.map(role => ({
      id: role.id,
      label: buildDelegateRoleLabel(role),
      icon: role.id === currentDocumentRole.value?.id ? 'pi pi-check' : 'pi',
      disabled: () => role.id === currentDocumentRole.value?.id,
      command: () => confirmChangeRole(role)
    } as MenuItem))
  } as MenuItem]
    : ownerRoles;
}
);

function buildRoleLabel(orgRole: UserOrganizationRole | undefined) {
  return orgRole ? trimEnd(orgRole.role?.name + ' - ' + orgRole.organization?.name, ' - ') : '';
}

function buildDelegateRoleLabel(orgRole: UserOrganizationRole | undefined) {
  return orgRole ? trimEnd(usersMoreInfo.value[orgRole.userId].fullName + ' - ' + orgRole.role?.name + ' - ' + orgRole.organization?.name, ' - ') : '';
}

function confirmChangeRole(orgRole: UserOrganizationRole) {
  if (currentDocumentRole.value && orgRole.id !== currentDocumentRole.value.id) {
    confirm({
      header: t('document.role.changeRole.title'),
      message: t('document.role.changeRole.message'),
      accept: () => {
        currentDocumentRole.value = orgRole;
        router.push({ name: props.routerPush });
      }
    });
  }
}
</script>

<style scoped>

</style>