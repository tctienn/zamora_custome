<template>
  <!--  {{userDeptRoleTransform}}-->
  <div
    v-tooltip.top='tooltip'
    class='align-items-center flex flex-row group-avatar-container'
    @click.stop='()=>{userGroupDialogVisible = true;emits("showDialog")}'>
    <template
      v-for='(user, index) in take(userDeptRoleTransform, numberAvatarDisplay)'
      :key='user.id'>
      <AppAvatar
        v-if='user.isUser'
        :avatar='generateAvatarUrl(user.avatar)'
        class='cursor-pointer'
        :class='{"-ml-2": index > 0}'
        :error='user.avatarError'
        :is-highlight='props.usersHighlight.includes(user.id)'
        :label='user.fullName'
        shape='circle'
        :size='avatarSize'
        @mouseenter='showUserOverlay($event, user)'
        @update:error='onAvatarError(user.id, $event)'/>
      <template v-else>
        <AppAvatar
          class='cursor-pointer h-full object-fit-cover'
          :class='{"-ml-1": index > 0}'
          :label='user?.departments?.[0]?.name'
          shape='square'
          :size='avatarSize'
          :style-avatar="{'border-width':'2px'}"
          @mouseenter='showDeptOverlay($event, user?.departments?.[0]?.name)'
          @update:error='onAvatarError(user.id, $event)'>
        </AppAvatar>
      </template>
    </template>

    <Avatar
      v-if='userDeptRoleTransform.length > numberAvatarDisplay'
      class='-ml-2 cursor-pointer font-semibold size'
      :label='`+${ userDeptRoleTransform.length - numberAvatarDisplay }`'
      shape='circle'
      @click.stop='userGroupDialogVisible = true'>
    </Avatar>
  </div>

  <template v-if='overlayVisible'>
    <slot
      name='dialog'
      :user-dept-role='userDeptRoles'
      :user-highlight='usersHighlight'
      :users='userDeptRoleTransform as User[]'>
      <UserGroupDialog
        :dialog-visible='userGroupDialogVisible'
        :user-highlight='usersHighlight'
        :users='userDeptRoleTransform as User[]'
        @hide-dialog='userGroupDialogVisible = false'>
        <template
          v-if='$slots.header'
          #header>
          <slot name='header'>
          </slot>
        </template>

        <template
          v-if='$slots.userTile'
          #userTile='{user:user}'>
          <slot
            name='userTile'
            :user='user'>
          </slot>
        </template>
      </UserGroupDialog>
    </slot>

  </template>

  <OverlayPanel
    ref='op'>
    <span class='font-semibold'>
      {{ deptNameOp }}
    </span>
  </OverlayPanel>
</template>

<script lang='ts' setup>
import { isEmpty, take, toNumber } from 'lodash';
import { storeToRefs } from 'pinia';
import OverlayPanel from 'primevue/overlaypanel';
import { computed, type PropType, ref } from 'vue';

import type { Department, UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import UserGroupDialog from '@/common/components/dialog/UserGroupDialog.vue';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import type { User } from '@/common/model/User';

const props = defineProps({
  userDeptRoles: {
    type: Array as PropType<UserDeptRoleInput[]>,
    default: () => []
  },
  avatarSize: {
    type: String,
    default: '2'
  },
  overlayVisible: {
    type: Boolean,
    default: true
  },
  numberAvatarDisplay: {
    type: Number,
    default: 3
  },
  usersHighlight: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  userOverlay: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'showDialog'): void
}>();
const userGroupDialogVisible = ref(false);
const infoStore = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(infoStore);
const userDeptRoleTransform = computed<(UserMoreInfo & { isUser: boolean })[]>(() => {
  return props.userDeptRoles.map(user => {
    return transformUserDeptRole(user);
  });
});

function onAvatarError(userId: string, value: boolean) {
  infoStore.avatarError(userId, value);
}

const size = computed(() => {
  const size = toNumber(props.avatarSize);
  return isNaN(size) ? props.avatarSize : `${props.avatarSize}rem`;
});

function showUserOverlay(event: Event, item: UserMoreInfo) {
  if (props.userOverlay) {
    EventBus.emit('user-overlay', {
      visible: true,
      user: item,
      event: event
    });
  }
}

const transformUserDeptRole = (user: UserDeptRoleInput): UserMoreInfo & { isUser: boolean } => ({
  ...usersMoreInfo.value[user.userId],
  departments: [{
    name: user.deptName,
    id: user.deptId
  } as Department],
  deptRoleName: user.roleName,
  positionName: [],
  isUser: !isEmpty(user.userId)
});
const op = ref<InstanceType<typeof OverlayPanel> | null>(null);
const deptNameOp = ref<string>('');

function showDeptOverlay($event: Event, deptName: string) {
  deptNameOp.value = deptName;
  op.value?.toggle($event);
}
</script>

<script lang='ts'>
export default { name: 'AppGroupUserDeptRole' };
</script>

<style lang='scss' scoped>
.size {
  width: v-bind(size);
  height: v-bind(size);
}
</style>