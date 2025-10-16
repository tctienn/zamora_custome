<template>
  <div
    :class='` ${avatarOnly && "column-gap-2"} cursor-pointer ${isFlex??"flex flex-row"} gap-2`'
    @mouseenter='showUserOverlay($event)'>
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
      class='border border-round p-2'
      style='background: #F5F5F5;max-width: 40rem; min-width: 8rem'>
      <div class='font-semibold pb-1'>
        {{ user?.fullName }}
      </div>
      <div
        v-if='!message.isAttachment'
        class='pb-1'>
        {{ message.content }}
      </div>
      <div
        v-else
        class='pb-1'>
        <div
          class='flex gap-2 p-2'
          @click='downloadFileFn(message.downloadPath, message.projectId, message.name )'>
          <div>
            <img
              alt=''
              class='file-extension-icon h-2rem w-2rem'
              draggable='false'
              :src='getFileIcon(message.extension)'/>
          </div>
          <div>
            <div>{{ message.name }}</div>
            <div class='font-normal'>
              {{ message.size ? convertFileSize(message.size) : convertFileSize(0) }}
            </div>
          </div>
        </div>
      </div>
      <div>
        {{ moment(message.createdTime).format("hh:mm") }}
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { downloadFolder } from '@/apps/work/api/rest/workAttachment';
import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize, downloadFile, generateAvatarUrl, getFileIcon } from '@/common/helpers/file-utils';

const props = defineProps({
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
  },
  message: {
    type: Object as PropType<ProjectDiscussion>,
    default: null
  }

});

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed((): UserMoreInfo => usersMoreInfo.value[props.userId]);

function onAvatarError(value: boolean) {
  store.avatarError(props.userId, value);
}

function downloadFileFn(downloadPath: string, projectId: string, name: string) {
  downloadFolder(downloadPath, projectId).then((res) => {
    if (res) {
      downloadFile(res, name);
    }
  });
}

if (props.userId) {
  store.fetchUserMoreInfo(props.userId);
}

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
    } else {
      return user.value?.[info as keyof UserMoreInfo];
    }
  }).filter(i => i).join(' | ');
});

defineExpose({ user });
</script>

<script lang='ts'>
export default { name: 'AppUserLeftMessage' };
</script>
