<template>
  <MultiSelect
    v-model='selectedUsers'
    filter
    option-label='userName'
    :options='otherUsers'
    :placeholder='t("document.comment.chooseReceivers")'
    :pt="{
      header: {
        class: 'surface-100 border-noround'
      }
    }">
    <template #option='{option}'>
      <AppUserDeptRole
        info-visible
        :infos='["roleName","deptName"]'
        name-visible
        :user-dept-role='option'/>
    </template>
    <template #header>
      <div
        class='border-round-top font-semibold pt-2 px-4 surface-100'>
        {{ t('document.comment.commentSelectUser.staffForDiscussion') }}
      </div>
    </template>
  </MultiSelect>
</template>

<script lang='ts' setup>
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';

const props = defineProps({
  users: {
    type: Array as PropType<UserDeptRoleInput[]>,
    default: () => []
  }
});
const { userDeptRole } = useDocumentRolesStore();
const otherUsers = ref<UserDeptRoleInput[]>([]);

function getOtherUsers(users: UserDeptRoleInput[]) {
  return users
    .filter(u => u.userId !== userDeptRole.userId
      || u.userId === userDeptRole.userId
      && (u.deptId !== userDeptRole.deptId
        || u.roleId !== userDeptRole.roleId)
    );
}

const { t } = useI18n();

const selectedUsers = defineModel('selectedUsers', {
  type: Array as PropType<UserDeptRoleInput[]>,
  default: () => []
});

watch(() => props.users, (users) => {
  otherUsers.value = getOtherUsers(users);
  if (otherUsers.value.length == 1) {
    selectedUsers.value = otherUsers.value;
  } else {
    selectedUsers.value = [];
  }
}, { immediate: true });
</script>

<style scoped>

</style>