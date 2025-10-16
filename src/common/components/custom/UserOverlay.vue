<template>
  <OverlayPanel
    ref='overlay'>
    <div class='flex flex-row gap-3'>
      <AppAvatar
        :avatar='generateAvatarUrl(user.avatar)'
        :error='user?.avatarError'
        :label='user.fullName'
        size='5'
        @update:error='onAvatarError'/>

      <div class='flex flex-column row-gap-2'>
        <div class='flex flex-column row-gap-1'>
          <span class='font-bold'>{{ user.fullName }}</span>
          <small
            v-if='user.positionName && user.positionName.length > 0'
            class='align-items-center flex gap-1'>
            <AppIcon name='badge'/>
            {{ user.positionName.join(', ') }}</small>
          <small
            v-if='user.email'
            class='align-items-center flex gap-1'>
            <AppIcon name='alternate_email'/>
            {{ user.email }}</small>
          <small
            v-if='user.phone'
            class='align-items-center flex gap-1'>
            <AppIcon name='phone'/>
            {{ user.phone }}</small>
          <small
            v-if='user.deptRoleName'
            class='align-items-center flex gap-1'>
            <AppIcon name='admin_panel_settings'/>
            {{ user.deptRoleName }}</small>
          <small
            v-if='user.departments && user.departments.length'
            class='align-items-center flex gap-1'>
            <AppIcon name='domain'/>
            {{ user.departments.map(d => d.name).join(', ') }}</small>
        </div>

        <div class='column-gap-2 flex flex-row-reverse'>
          <ButtonIcon
            v-if='user.id !== storedUser.id'
            class='p-0'
            icon='chat_bubble'
            rounded
            severity='secondary'
            text
            @click='gotoChat(user.id!)'/>
        </div>
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang='ts'>
import { nextTick, type PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  user: {
    type: Object as PropType<UserMoreInfo>,
    default: {} as UserMoreInfo
  }
});

const router = useRouter();
const { user: storedUser } = useUserStore();

const overlay = ref();

function show(event: Event) {
  if (overlay.value.visible) {
    overlay.value.hide();
  }

  nextTick(() => {
    overlay.value.show(event);
    nextTick(() => {
      overlay.value.alignOverlay();
    });
  });
}

function hide() {
  overlay.value.hide();
}

function gotoChat(userId: string) {
  const route = router.resolve({
    name: 'AppChat',
    params: { conversationId: userId }
  });
  window.open(route.href, '_blank');
}

function onAvatarError(value: boolean) {
  useUserMoreInfoStore().avatarError(props.user.id, value);
}

defineExpose({
  show,
  hide
});
</script>

<script lang='ts'>
export default { name: 'UserOverlay' };
</script>

