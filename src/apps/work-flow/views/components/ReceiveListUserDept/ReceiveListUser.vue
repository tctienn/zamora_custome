<template>
  <div
    class='relative'
    :class='$attrs.class'
    :style='$attrs.style as StyleValue'>
    <div
      class='absolute align-items-center fixed flex font-semibold justify-content-between top-0 w-full'>
      <div class='align-items-center flex gap-3'>
        <span class='text-xl'>Danh sách nhận</span>
        <span
          v-if='userIds.length>0'
          class='number-user'> {{ userIds.length }}</span>
      </div>
      <AppIcon
        v-if='!hideDeleteAll'
        v-tooltip.top="t('common.deleteAll')"
        class='cursor-pointer'
        name='delete_sweep'
        size='1.8'
        @click='deleteAll'>
      </AppIcon>
    </div>
    <div class='pt-4'>
      <Divider></Divider>
    </div>
    <div
      class='flex flex-column overflow-y-auto pt-1 w-full'
      style='height: 60vh'>
      <div
        v-for='user in mappedUsers'
        :key='user.id'
        class='align-items-center border-round flex hover:surface-hover justify-content-between p-1 userTile'>
        <AppUserDeptRole
          avatar-size='3'
          info-visible
          :infos='["positionName","roleName","deptName"]'
          name-visible
          :user-dept-role='user'>
        </AppUserDeptRole>
        <AppIcon
          class='actionButton cursor-pointer'
          name='delete'
          size='1.7'
          @click='deleteUser(user?.id)'>
        </AppIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type StyleValue } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';

defineProps({
  hideDeleteAll: {
    type: Boolean,
    default: false
  }
});

const userIds = defineModel<Array<UserDeptRoleInput & { id: string }>>({ default: [] });
const { t } = useI18n();

const mappedUsers = computed(() => {
  return userIds.value?.flatMap((user: any) => {
    if (user.__typename == 'GroupReceivingDocuments') {
      return user.users.map((u: any) => ({
        __typename: 'GroupReceivingDocuments',
        userId: u.userId,
        roleName: '',
        userName: '',
        deptName: '',
        deptId: u.deptId,
        roleId: u.roleId,
        type: 'ADMINISTRATIVE',
        id: u.id
      }));
    } else {
      return [user];
    }
  }) || [];
});

function deleteAll() {
  userIds.value = [];
}

function deleteUser(id?: string) {
  if (id) {
    userIds.value = userIds.value.filter(e => e.id != id);
  }
}
</script>

<style scoped>
.userTile {
  .actionButton {
    opacity: 0;
  }

  &:hover {
    .actionButton {
      opacity: 1;
    }
  }
}
</style>