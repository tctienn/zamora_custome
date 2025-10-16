<template>
  <div
    class='avatar-container'
    :class='`align-items-center ${avatarOnly && "column-gap-2"} cursor-pointer ${isFlex??"flex flex-row"} gap-2`'
    @mouseenter='showUserOverlay($event)'>
    <AppAvatar
      :avatar='generateAvatarUrl(user?.avatar)'
      class='h-full'
      :error='user?.avatarError'
      :is-highlight='isHighlight'
      :label='user?.fullName'
      :shape='shape'
      :size='avatarSize'
      @update:error='onAvatarError'/>

    <div
      v-if='!avatarOnly && (nameVisible || infoVisible)'
      class='app-user-info flex'
      :class='infoInOneLine? "flex-row gap-2 align-items-baseline": "flex-column gap-1"'>
      <slot
        :display-infos='displayInfos'
        name='name'
        :user='user'>
        <span
          v-if='nameVisible'
          class='flex font-semibold justify-content-start'
          :class='props.fullNameColor'>{{ user?.fullName }}</span>
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

  </div>
</template>

<script lang='ts' setup>
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, type PropType, watch } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  shape: {
    type: String as PropType<'circle' | 'square'>,
    default: 'circle'
  },
  userId: {
    type: String,
    default: ''
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
    type: Array as PropType<(keyof UserMoreInfo | string)[]>,
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
  },
  fullNameColor: {
    type: String,
    default: ''
  }
});

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed((): UserMoreInfo => usersMoreInfo.value[props.userId]);

function onAvatarError(value: boolean) {
  store.avatarError(props.userId, value);
}

if (props.userId) {
  store.fetchUserMoreInfo(props.userId);
}

watch(() => props.userId, (userId) => {
  store.fetchUserMoreInfo(userId);
});

function showUserOverlay(event: Event) {
  if (props.overlayVisible) {
    EventBus.emit('user-overlay', {
      visible: true,
      user: user.value,
      event: event
    });
  }
}

const displayInfos = computed(() => {
  return props.infos.map((info) => {
    if (info === 'departments') {
      return user.value?.departments.map(dept => dept.name).join(', ');
    } else if (info === 'birthDay') {
      return moment(user.value?.birthDay).format('DD/MM/YYYY');
    } else if (info === 'positionName') {
      return user.value?.positionName?.join(', ');
    } else {
      return user.value?.[info as keyof UserMoreInfo];
    }
  }).filter(i => i).join(' | ');
});

defineExpose({ user });
</script>

<script lang='ts'>
export default { name: 'AppUser' };
</script>
