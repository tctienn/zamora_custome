<template>
  <div
    v-if='receivers.length<=numberNameShow'>
    <template
      v-for='(receiver,idx) in receivers'
      :key='receiver.id'>
      {{ !isEmpty(receiver.toUserId) ? t(getGenderI18n(receiver.toUserId)) : "Phòng" }} <span class='font-semibold'>
        {{
          !isEmpty(receiver.toUserId) ? receiver.toUserName : receiver.toDeptName
        }}{{ idx == receivers.length - 1 ? "" : ", " }}
      </span>
    </template>
  </div>
  <div
    v-else>
    <template
      v-for='(receiver,idx) in receiversNameShow'
      :key='receiver.id'>
      {{ !isEmpty(receiver.toUserId) ? t(getGenderI18n(receiver.toUserId)) : "Phòng" }} <span class='font-semibold'>
        {{
          !isEmpty(receiver.toUserId) ? receiver.toUserName : receiver.toDeptName
        }}{{ idx == receivers.length - 1 ? "" : ", " }}
      </span>
    </template>
    {{ remainReceiverStr }}
    <AppGroupUserDeptRole
      v-if='receivers.length > numberNameShow'
      avatar-size='2'
      :overlay-visible='true'
      :user-dept-roles='receiveUserDeptRoleAvatar.slice(numberNameShow)'/>
  </div>

</template>

<script lang="ts" setup>
import { isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { DocComment } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import AppGroupUserDeptRole from '@/common/components/app/AppGroupUserDeptRole.vue';

const props = defineProps({
  receivers: {
    type: Array as PropType<DocComment[]>,
    default: () => []
  }
});
const numberNameShow = 2;
const receiversNameShow = computed(() => {
  return props.receivers.filter((value, index) => index < numberNameShow);
});
const remainReceiverStr = computed(() => {
  let name = 'người/phòng';
  const remainNumber = props.receivers.length - numberNameShow;
  if (remainNumber == 1) {
    name = props.receivers[props.receivers.length - 1].toUserId ? 'người' : 'phòng';
  }
  return `và ${remainNumber} ${name} khác `;
});
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const getGenderI18n = (userId: string | undefined) => {
  return getGender(gender(userId));
};

const gender = (userId: string | undefined): number | undefined => userId ? usersMoreInfo.value[userId]?.gender : undefined;
const { t } = useI18n();
const receiveUserDeptRoleAvatar = computed(() => {
  return props.receivers?.map((docComment: DocComment): UserDeptRoleInput => {
    return {
      deptId: docComment.toDeptId || '',
      deptName: docComment.toDeptName || '',
      roleId: docComment.toRoleId || '',
      roleName: docComment.toRoleName || '',
      type: OrganizationType.ADMINISTRATIVE || '',
      userId: docComment.toUserId || '',
      userName: docComment.toUserName || ''
    };
  }) || [];
});
</script>

<style scoped>
:deep(.group-avatar-container) {
  display: inline-flex !important;
}

</style>