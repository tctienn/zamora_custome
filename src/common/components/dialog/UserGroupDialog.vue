<template>
  <Dialog
    v-model:visible='dialogVisible'
    :header='header||t("common.list")'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {"width": "60vw"}}'
    @hide='emits("hide-dialog")'>

    <div class='flex flex-column row-gap-3'>
      <div class='flex flex-column'>
        <InputText
          v-model='searchKeyword'
          :placeholder='t("common.search")'
          @change='searchUser'/>
      </div>
      <slot name='header'></slot>
      <div class='flex flex-column row-gap-3'>
        <div
          v-for='user in searchUsers'
          :key='user.id'
          class='align-items-center column-gap-2 flex flex-row justify-content-between'>
          <slot
            name='userTile'
            :user='user'>
            <AppAvatar
              :avatar='generateAvatarUrl(user.avatar)'
              :is-highlight='user.id?userHighlight.includes(user.id):false'
              :label='user.fullName'
              shape='circle'
              size='3'></AppAvatar>

            <div class='flex flex-1 flex-column'>
              <span class='font-bold pb-1'>
                {{ user.fullName }}
              </span>
              <small class='opacity-80'>
                {{ user.email }} | {{ user.positionName.join(', ') }}
              </small>
            </div>
          </slot>
          <!--          <AppIcon
                      v-if='currentUser.id !== user.id'
                      class='cursor-pointer'
                      name='chat_bubble'
                      size='1.5'
                      @click='gotoChat(user.id!)'/>
                    <div
                      v-else
                      style='width:21px'>
                    </div>-->
        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { filter } from 'lodash';
import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppAvatar from '@/common/components/app/AppAvatar.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { convertAlias } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  header: {
    type: String,
    default: undefined
  },
  // dialogVisible: {
  //   type: Boolean,
  //   default: () => false
  // },
  users: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  avatarSize: {
    type: String,
    default: '2'
  },
  userHighlight: {
    type: Array as PropType<string[]>,
    default: () => []
  }
});

const emits = defineEmits(['hide-dialog']);
const { user: currentUser } = useUserStore();
const dialogVisible = defineModel('dialogVisible', { default: false });
// const visible = ref(props.dialogVisible);
const searchKeyword = ref('');
const searchUsers = ref<any[]>(props.users);

const { t } = useI18n();
const router = useRouter();

const userGroupDialogFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};
provide('dialogFooterButtons', userGroupDialogFooterButtons);

function searchUser() {
  searchUsers.value = filter(props.users, user => convertAlias(user.fullName as string).includes(convertAlias(searchKeyword.value))
    || convertAlias(user.email as string).includes(convertAlias(searchKeyword.value)));
}

function gotoChat(userId: string) {
  const route = router.resolve({
    name: 'AppChat',
    params: { conversationId: userId }
  });
  window.open(route.href, '_blank');
}
</script>

<script lang='ts'>
export default { name: 'UserGroupDialog' };
</script>