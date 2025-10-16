<template>
  <div
    class='flex gap-2'>
    <AppUser :user-id='comment.createdBy'></AppUser>
    <div class='flex flex-column gap-2 w-full'>
      <div
        class='border-round message p-3 w-full'
        :class="[{['my-message']:isMine}, flashClass ]"
        style='color: black'>
        <div class='flex gap-2 justify-content-between'>
          <span
            class='font-semibold'>{{
              t(getGender(usersMoreInfo[comment.createdBy]?.gender))
            }} {{ usersMoreInfo[comment.createdBy]?.fullName }} </span>
          <i
            class='cursor-pointer menu-message pi pi-ellipsis-h'
            @click='menuRef?.toggle($event)'></i>
        </div>

        <div class='white-space-normal word-break-break-word'>
          {{ comment.content }}
        </div>

        <ProjectCommentItemAttachment
          :attachments='comment.attachments'/>

        <div class='flex gap-3 justify-content-between mt-1'>
          <div class='align-items-center flex gap-1 text-sm'>
            {{ formatDateTime(comment.createdTime) }}
            <!--          isEdited-->
            <AppIcon
              v-if='comment?.isEdited'
              name='edit'
              size='1.2'/>
          </div>
          <!--          Da xem-->
          <AppIcon
            v-if='comment?.seenUserIds?.length|| -1 >0'
            class='cursor-pointer text-green-400'
            name='done_all'
            size='1.2'
            @click='visibleDialogSeen=true'>
          </AppIcon>
        </div>
      </div>
      <ProjectTreeReplyCommentItem
        :children='comment.children'
        @delete='deleteComment'
        @edit='editComment'
        @reply='replyComment'>
      </ProjectTreeReplyCommentItem>
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

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem as MenuItemType } from 'primevue/menuitem';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import ProjectCommentItemAttachment
  from '@/apps/work/views/project/component/comment/item/ProjectCommentItemAttachment.vue';
import ProjectTreeReplyCommentItem
  from '@/apps/work/views/project/component/comment/item/ProjectTreeReplyCommentItem.vue';
import DialogSeenComment from '@/apps/work/views/task/component/comment/DialogSeenComment.vue';
import { formatDateTime } from '@/common/helpers/time-util';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  comment: {
    type: Object as PropType<TreeNode>,
    required: true
  },
  isFlashing: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits<{
  (e: 'reply', repliedComment: ProjectDiscussion): void
  (e: 'delete', deleteComment: ProjectDiscussion): void
  (e: 'edit', editComment: ProjectDiscussion): void
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
      replyComment(props.comment);
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
      editComment(props.comment);
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
      deleteComment(props.comment);
    }
  },

]);
const filterActions = computed(() => actions.value.filter((a) => !a.filterFunc || a.filterFunc()));
const isMine = computed(() => props.comment?.createdBy == user.value.id);
const visibleDialogSeen = ref<boolean>(false);

function deleteComment(treeNode: TreeNode) {
  emits('delete', treeNode as ProjectDiscussion);
}

function editComment(treeNode: TreeNode) {
  emits('edit', treeNode as ProjectDiscussion);
}

function replyComment(treeNode: TreeNode) {
  emits('reply', treeNode as ProjectDiscussion);
}

const flashClass = computed(() => {
  if (!props.isFlashing) {
    return '';
  }
  if (isMine.value) {
    return 'bg-blue-300  text-gray-900';
  } else {
    return 'surface-400';
  }
});
</script>

<style scoped>
.message {
  transition: background 2s ease-in-out !important;
  background: #F5F5F5 !important;
}

.menu-message {
  opacity: 0
}

:deep(.message) {
  &:hover {
    .menu-message {
      opacity: 1
    }
  }
}

.my-message {
  background: #DBF4FD !important;
}
</style>