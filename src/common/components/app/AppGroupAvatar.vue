<template>
  <div
    class='align-items-center flex flex-row group-avatar-container'
    @click.stop='userGroupDialogVisible = true'>
    <AppAvatar
      v-for='(user, index) in take(users, numberAvatarDisplay)'
      :key='user.id'
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
    <Avatar
      v-if='users.length > numberAvatarDisplay'
      class='-ml-2 cursor-pointer font-semibold size'
      :label='`+${ users.length - numberAvatarDisplay }`'
      shape='circle'
      @click.stop='userGroupDialogVisible = true'>
    </Avatar>
  </div>

  <UserGroupDialog
    v-if='userGroupDialogVisible'
    :dialog-visible='userGroupDialogVisible'
    :header='props.header'
    :user-highlight='usersHighlight'
    :users='users as User[]'
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
</template>

<script lang='ts' setup>
import { take, toNumber } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import UserGroupDialog from '@/common/components/dialog/UserGroupDialog.vue';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import type { User } from '@/common/model/User';

const props = defineProps({
  userIds: {
    type: Array as PropType<string[]>,
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
  header: {
    type: String,
    default: null
  }
});

const userGroupDialogVisible = ref(false);
const infoStore = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(infoStore);
const users = computed<UserMoreInfo[]>(() => props.userIds
  ?.map(id => usersMoreInfo.value[id])
  .filter(a => a));

props.userIds?.forEach(id => {
  if (id) {
    infoStore.fetchUserMoreInfo(id);
  }
});

function onAvatarError(userId: string, value: boolean) {
  infoStore.avatarError(userId, value);
}

const size = computed(() => {
  const size = toNumber(props.avatarSize);
  return isNaN(size) ? props.avatarSize : `${props.avatarSize}rem`;
});

function showUserOverlay(event: Event, item: UserMoreInfo) {
  EventBus.emit('user-overlay', {
    visible: true,
    user: item,
    event: event
  });
}
</script>

<script lang='ts'>
export default { name: 'AppGroupAvatar' };
</script>

<style lang='scss' scoped>
.size {
  width: v-bind(size);
  height: v-bind(size);
}
</style>