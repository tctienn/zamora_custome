<template>
  <div
    class='flex gap-2'>
    <AppUser :user-id='comment.createdBy'></AppUser>
    <div
      class='border-round message p-3'
      :class="{['my-message']:isMine}">
      <div class='flex gap-2 justify-content-between'>
        <span
          class='font-semibold'>{{
            t(getGender(usersMoreInfo[comment.createdBy]?.gender))
          }} {{ usersMoreInfo[comment.createdBy]?.fullName }} </span>
        <i
          class='cursor-pointer hover:text-primary pi pi-ellipsis-h'
          @click='menuRef?.toggle($event)'></i>
      </div>
      <TaskCommentReply
        v-if='comment?.replyComment'
        class='p-1'
        :comment='comment.replyComment'
        :is-in-input='false'>

      </TaskCommentReply>
      <div class='white-space-normal word-break-break-word'>
        {{ comment.content }}
      </div>

      <TaskCommentItemAttachment
        :attachments='comment.attachments'/>

      <div class='flex gap-3 justify-content-between mt-1'>
        <div class='align-items-center flex gap-1 text-sm'>
          {{ formatDateTime(comment.createdTime) }}
          <!--          isEdited-->
          <AppIcon
            v-if='comment.isEdited'
            name='edit'
            size='1.2'/>
        </div>
        <!--          Da xem-->
        <AppIcon
          v-if='comment.seenUserIds?.length|| -1 >0'
          class='cursor-pointer text-green-400'
          name='done_all'
          size='1.2'
          @click='visibleDialogSeen=true'>
        </AppIcon>
      </div>
    </div>

    <Menu
      ref='menuRef'
      :model='filterActions'
      popup>
      <template #item='itemData'>
        <MenuItem
          :icon='itemData.item.icon'
          icon-size='1.2'
          :label='itemData.label'
          :style-icon='itemData.item.icon=="delete"?{color:"red"}:{}'
          :style-item='itemData.item.icon=="delete"?{color:"red"}:{}'>
        </MenuItem>
      </template>
    </Menu>

    <DialogSeenComment
      v-if='comment.seenUserIds'
      v-model:visible='visibleDialogSeen'
      :seen-user-ids='comment.seenUserIds'>
    </DialogSeenComment>
  </div>

</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem as MenuItemType } from 'primevue/menuitem';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import type { TaskComment } from '@/apps/work/model/taskComment';
import DialogSeenComment from '@/apps/work/views/task/component/comment/DialogSeenComment.vue';
import TaskCommentItemAttachment from '@/apps/work/views/task/component/comment/item/TaskCommentItemAttachment.vue';
import TaskCommentReply from '@/apps/work/views/task/component/comment/TaskCommentReply.vue';
import { formatDateTime } from '@/common/helpers/time-util';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  comment: {
    type: Object as PropType<TaskComment>,
    required: true
  }
});
const emits = defineEmits<{
  (e: 'reply', repliedComment: TaskComment): void
  (e: 'delete', deleteComment: TaskComment): void
  (e: 'edit', editComment: TaskComment): void
}>();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { user } = storeToRefs(useUserStore());
const { t } = useI18n();
const menuRef = ref<InstanceType<typeof Menu>>();
const actions = ref<MenuItemType[]>([
  {
    icon: 'reply',
    key: 'reply',
    label: t('Trả lời'),
    filterFunc() {
      return !isMine.value;
    },
    command() {
      emits('reply', props.comment);
    }
  },
  {
    icon: 'edit',
    key: 'edit',
    label: t('common.edit'),
    filterFunc() {
      return isMine.value;
    },
    command() {
      emits('edit', props.comment);
    }
  },
  {
    icon: 'delete',
    key: 'delete',
    label: t('common.delete'),
    filterFunc() {
      return isMine.value;
    },
    command() {
      emits('delete', props.comment);
    }
  },

]);
const filterActions = computed(() => actions.value.filter((a) => !a.filterFunc || a.filterFunc()));
const isMine = computed(() => props.comment?.createdBy == user.value.id);
const visibleDialogSeen = ref<boolean>(false);
</script>

<style scoped>
.my-message {
  background: #DBF4FD !important;
}

.message {
  background: #F5F5F5 !important;
}
</style>