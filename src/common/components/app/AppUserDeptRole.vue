<template>
  <div
    :class='`align-items-center ${avatarOnly && "column-gap-2"} cursor-pointer ${isFlex??"flex flex-row"} gap-2`'
    @mouseenter='showUserOverlay($event)'>
    <template v-if='userDeptRole.userId'>
      <AppAvatar
        :avatar='generateAvatarUrl(user?.avatar)'
        class='h-full'
        :error='user?.avatarError'
        :is-highlight='isHighlight'
        :label='user?.fullName'
        shape='circle'
        :size='avatarSize'
        @update:error='onAvatarError'/>

      <div
        v-if='!avatarOnly && (nameVisible || infoVisible)'
        class='flex'
        :class='infoInOneLine? "flex-row gap-2 align-items-baseline": "flex-column gap-1"'>
        <slot
          :display-infos='displayInfos'
          name='name'
          :user='user'>
          <span
            v-if='nameVisible'
            class='flex font-semibold justify-content-start'>{{ user?.fullName }}</span>
          <template v-if='infoInOneLine'>
            -
          </template>
          <small
            v-if='infoVisible'
            class='flex flex-row gap-2 justify-content-start opacity-80'>
            {{ displayInfos }}
          </small>
        </slot>
      </div>
    </template>
    <template v-else>
      <AppAvatar
        class='h-full'
        :is-highlight='isHighlight'
        :label='userDeptRole?.deptName'
        shape='square'
        :size='avatarSize'>
      </AppAvatar>
      <div
        v-if='!avatarOnly && (nameVisible || infoVisible)'>
        <slot
          name='dept'
          :user='userDeptRole'>
          <span
            v-if='nameVisible'
            class='flex font-semibold justify-content-start'>{{ userDeptRole?.deptName }}</span>
        </slot>
      </div>
    </template>
  </div>
</template>

<script lang='ts' setup>
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, type PropType, watch } from 'vue';

import type { Department, UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  userDeptRole: {
    type: Object as PropType<UserDeptRoleInput>,
    default: () => ({} as UserDeptRoleInput)
  },
  avatarSize: {
    type: String,
    default: '2'
  },
  avatarOnly: {
    type: Boolean,
    default: false
  },
  display: {
    type: String as PropType<'' | 'chip'>,
    default: ''
  },
  nameVisible: {
    type: Boolean,
    default: () => false
  },
  infoVisible: {
    type: Boolean,
    default: () => false
  },
  infoInOneLine: {
    type: Boolean,
    default: () => false
  },
  infos: {
    type: Array as PropType<string[]>,
    default: () => ['email']
  },
  overlayVisible: {
    type: Boolean,
    default: () => false
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  isFlex: {
    type: Boolean,
    default: null
  }
});

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed((): UserMoreInfo => usersMoreInfo.value[props.userDeptRole.userId]);

function onAvatarError(value: boolean) {
  store.avatarError(props.userDeptRole.userId, value);
}

if (props.userDeptRole.userId) {
  store.fetchUserMoreInfo(props.userDeptRole.userId);
}

watch(() => props.userDeptRole.userId, (userId) => {
  store.fetchUserMoreInfo(userId);
});

function showUserOverlay(event: Event) {
  if (props.overlayVisible) {
    EventBus.emit('user-overlay', {
      visible: true,
      user: userDeptRoleTransform.value,
      event: event
    });
  }
}

const userDeptRoleTransform = computed<UserMoreInfo>(() => {
  return {
    ...user.value,
    departments: [{
      name: props.userDeptRole.deptName,
      id: props.userDeptRole.deptId
    } as Department],
    deptRoleName: props.userDeptRole.roleName,
    positionName: []
  };
});

const displayInfos = computed(() => {
  return props.infos.map((info) => {
    if (info === 'departments') {
      return user.value?.departments.map(dept => dept.name).join(', ');
    } else if (info === 'birthDay') {
      return moment(user.value?.birthDay).format('DD/MM/YYYY');
    } else {
      try {
        return props.userDeptRole?.[info as keyof UserDeptRoleInput] || user.value?.[info as keyof UserMoreInfo];
      } catch (error) {
        return user.value?.[info as keyof UserMoreInfo];
      }
    }
  }).filter(i => i).join(' | ');
});

defineExpose({ user });
</script>

<script lang='ts'>
export default { name: 'AppUserDeptRole' };
</script>
