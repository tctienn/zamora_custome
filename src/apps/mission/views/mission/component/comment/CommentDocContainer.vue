<template>
  <div class='flex flex-column gap-2 h-full justify-content-between'>
    <div class='relative'>
      <TabMenu
        v-model:active-index='activeIndex'
        :model='tabMenus'
        :pt='{
          action: {
            class: "px-3 py-2"
          }
        }'>
        <template #itemicon='{item}'>
          <AppIcon
            class='mr-2'
            :name='item.icon'
            size='1.5'/>
        </template>
      </TabMenu>
    </div>
    <CommentDocContent
      :comments='comments'/>
    <div
      class='flex flex-column gap-1'
      :class="{'p-disabled': disabled}">
      <CommentDocSelectUser
        v-model:selected-users='selectedUsers'
        :users='availableUsers'/>
      <CommentDocInput
        :disabled='selectedUsers.length === 0'
        @send-message='newChatComment'/>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { cloneDeep } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { inject, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocComment } from '@/apps/mission/model/doc/doc-in';
import AppIcon from '@/common/components/app/AppIcon.vue';

import CommentDocContent from './CommentDocContent.vue';
import CommentDocInput from './CommentDocInput.vue';
import CommentDocSelectUser from './CommentDocSelectUser.vue';

defineProps({
  comments: {
    type: Array as PropType<DocComment[]>,
    default: () => []
  },
  availableUsers: {
    type: Array as PropType<UserDeptRoleInput[]>,
    default: () => []
  }
});

const emits = defineEmits<{
  (e: 'newChatComment', content: string, attachments: FileList | undefined, selectedUser: UserDeptRoleInput[]): void
  (e: 'load-default-comments'): void
}>();

const { t } = useI18n();
const selectedUsers = ref<UserDeptRoleInput[]>([]);
const tabMenus: (MenuItem & { loadFunc?: () => void })[] = [
  {
    label: t('document.comment.comments'),
    icon: 'speaker_notes',
    loadFunc() {
      emits('load-default-comments');
    },
  }
];

const activeIndex = ref(0);
watch(activeIndex, (index) => {
  tabChange(index);
});

function tabChange(index: number) {
  tabMenus[index]?.loadFunc?.();
}

function newChatComment(content: string, attachments: FileList | undefined) {
  emits('newChatComment', content, attachments, cloneDeep<UserDeptRoleInput[]>(selectedUsers.value));
}

onMounted(() => {
  tabChange(activeIndex.value);
});
const disabled = inject('disabled', false);

</script>

<style scoped>

</style>