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
      <Button
        v-if='activeIndex===0'
        v-tooltip='t("common.filter")'
        class='absolute badge-icon px-3 py-1'
        :style='{right:0,top:"10px"}'
        text
        @click='menuRef?.toggle($event)'>
        <i
          class='cursor-pointer hover:text-primary pi pi-filter'></i>
      </Button>
      <Menu
        ref='menuRef'
        :model='menuFilters'
        popup>
        <template #itemicon='{item}'>
          <i
            class='ml-0 mr-2 my-0 pi pi-check'
            :class='{"opacity-0":item.key !== filter}'></i>
        </template>
      </Menu>

    </div>
    <CommentDocContent
      :comments='commentsComputed'/>
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
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { CommentSendType, type DocComment } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useUserSupportStore } from '@/apps/document/store/user-support';
import CommentDocContent from '@/apps/document/views/doc/component/comment/CommentDocContent.vue';
import CommentDocInput from '@/apps/document/views/doc/component/comment/CommentDocInput.vue';
import CommentDocSelectUser from '@/apps/document/views/doc/component/comment/CommentDocSelectUser.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { SupportPermission } from '@/common/model/User';

const props = defineProps({
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
  (e: 'load-private-comments'): void
}>();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { userSupport } = storeToRefs(useUserSupportStore());
const { t } = useI18n();
const selectedUsers = ref<UserDeptRoleInput[]>([]);
const visibleAdvise = computed(() => {
  const isAssistant = userDeptRole.value.roleId === RoleType.TRO_LY;
  const hasSupportPermission = userSupport.value?.supportPermission?.includes(SupportPermission.ADVISE_INCOMING_DOC)
      || userSupport.value?.supportPermission?.includes(SupportPermission.ADVISE_OUTGOING_DOC) || false;
  return userDeptRole.value.roleId === RoleType.LANH_DAO || isAssistant && hasSupportPermission;
});
const tabMenus: (MenuItem & { loadFunc?: () => void })[] = [
  {
    label: t('document.comment.comments'),
    icon: 'speaker_notes',
    loadFunc() {
      emits('load-default-comments');
    },
  },
  {
    label: t('document.comment.advise'),
    icon: '3p',
    loadFunc() {
      emits('load-private-comments');
    },
    visible() {
      return visibleAdvise.value;
    },
  }
];

const activeIndex = ref(0);
watch(activeIndex, (index) => {
  tabChange(index);
  filter.value = 'all';
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
type FilterOption = 'all' | 'comment' | 'log' | 'askMe' | 'advised'
const filter = ref<FilterOption>('all');
const menuRef = ref<InstanceType<typeof Menu>>();
const menuFilters: MenuItem[] = [
  {
    label: t('Tất cả'),
    key: 'all',
    command(event) {
      filter.value = 'all';
    },
  },
  {
    label: t('Trao đổi'),
    key: 'comment',
    command(event) {
      filter.value = 'comment';
    },
  },
  {
    label: t('Hành động'),
    key: 'log',
    command(event) {
      filter.value = 'log';
    },
  },
  {
    label: t('Ý kiến'),
    key: 'advised',
    command(event) {
      filter.value = 'advised';
    },
  },
  {
    label: t('Xin ý kiến tôi'),
    key: 'askMe',
    command(event) {
      filter.value = 'askMe';
    }
  }
];

function isSendToMe(comment: DocComment) {
  return (
    comment.toUserId == userDeptRole.value.userId
      && comment.toDeptId == userDeptRole.value.deptId
      && comment.toRoleId == userDeptRole.value.roleId
  );
}

const commentsComputed = computed(() => {
  switch (filter.value) {
  case 'all':
    return props.comments;
  case 'comment':
  case 'log':
    return props.comments.filter(e => e.commentType == filter.value);
  case 'advised':
    return props.comments.filter(e => e?.sendType === CommentSendType.XIN_Y_KIEN);
  case 'askMe':
    return props.comments.filter(e => e?.sendType === CommentSendType.XIN_Y_KIEN && isSendToMe(e) && !e?.isCompleted);
  default:
    return [];
  }

});

</script>

<style scoped>

</style>