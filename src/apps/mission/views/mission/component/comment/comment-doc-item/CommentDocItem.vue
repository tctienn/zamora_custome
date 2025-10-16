<template>
  <div class='flex flex-row gap-2'>
    <div class='h-full relative'>
      <AppUserDeptRole
        avatar-size='2.5'
        class='user-avatar'
        :user-dept-role='senderUserDeptRole(comment)'></AppUserDeptRole>
    </div>
    <CommentDocItemAction
      v-if="comment?.commentType==='log'"
      :comment='comment'/>
    <div
      v-else
      class='flex flex-column gap-1 w-full'>
      <div
        class='border-round flex flex-column gap-1 p-3 relative surface-200 w-full'
        :class="{['bg-blue-100  text-gray-800']:isMine}"
        style='max-width: 100%'>
        <div class='absolute flex gap-3 hover:text-primary mr-3 right-0'>
          <i
            v-if='filterActions.length > 0 &&!disabled'
            class='cursor-pointer hover:text-primary pi pi-ellipsis-h'
            @click='menuRef?.toggle($event)'></i>
        </div>
        <div>
          <div>
            {{ t(getGender(gender(sender?.userId))) }}
            <span class='font-semibold'> {{ sender.userName }}</span>
          </div>
          <div class='flex gap-2'>
            <span
              class='align-items-center flex font-semibold gap-1 text-blue-500'>
              <span style='white-space:nowrap'>
                <AppIcon :name='sendTypeIcon(comment?.commentType)'/>
                {{ getActionType(comment) }}
              </span>
            </span>
            <CommentDocItemReceivers :receivers='receivers'/>
          </div>
        </div>
        <template v-if='!isEdit'>
          <span
            class='word-break-break-word'>
            {{ comment?.content }}
          </span>
        </template>
        <CommentDocInput
          v-else
          :init-content='comment?.content'
          @cancel-input='isEdit = false'
          @close='isEdit=!isEdit'
          @send-message='sendEditMessage'/>
        <CommentDocItemAttachment
          v-model:deleted-attachment='deleteFileIds'
          :allow-delete='isEdit'
          :attachments='comment?.attachments'/>
        <div class='flex justify-content-between text-sm'>
          <div class='align-items-center flex'>
            {{
              comment?.sendTime
                ? moment(comment?.sendTime).format("HH:mm DD/MM/YYYY")
                : ""
            }}
            <AppIcon
              v-if='comment?.isEdited'
              v-tooltip.top='t("document.comment.edited")'
              class='mx-2'
              name='edit'/>
          </div>
          <AppGroupUserDeptRole
            avatar-size='1.2'
            :overlay-visible='true'
            :tooltip="t('document.comment.commentItem.seen')"
            :user-dept-roles='readCommentUser'
            @show-dialog='visibleDialog=true'>
            <template #dialog='{userDeptRole:users}'>
              <Dialog
                v-model:visible='visibleDialog'
                :header="t('document.comment.commentItem.seen')"
                v-bind='DEFAULT_DIALOG_CONFIG'>
                <DataTable
                  :value='users'>
                  <Column
                    body-class='text-center'
                    header='STT'>
                    <template #body='{ index }'>
                      {{ index + 1 }}
                    </template>
                  </Column>
                  <Column
                    :header='t("document.comment.commentItem.user")'>
                    <template #body='{ data }'>
                      <AppUserDeptRole
                        avatar-size='2.5'
                        class='user-avatar'
                        info-visible
                        :infos='["roleName","deptName"]'
                        name-visible
                        :user-dept-role='data'/>
                    </template>
                  </Column>
                  <Column
                    class='text-center'
                    :header='t("document.comment.commentItem.time")'>
                    <template #body='{data}'>
                      {{ formatDateTime(data.readTime) }}
                    </template>
                  </Column>
                </DataTable>
              </Dialog>
            </template>
          </AppGroupUserDeptRole>

        </div>
      </div>
      <CommentDocInput
        v-if='isReply'
        @cancel-input='isReply = false'
        @send-message='sendReplyMessage'/>
      <CommentDocItemReply :comment='comment'/>
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
          :style-item='itemData.item.icon=="delete"?{color:"red"}:{}'>
        </MenuItem>
      </template>

    </Menu>
  </div>
</template>

<script lang="ts" setup>
import camelcase from 'camelcase';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import { deleteJobChatByChatId, deleteJobChatFileAttachment } from '@/apps/mission/api/graphql/comment-api';
import { createChatComment } from '@/apps/mission/api/rest/comment';
import type { DocComment } from '@/apps/mission/model/doc/doc-in';
import AppGroupUserDeptRole from '@/common/components/app/AppGroupUserDeptRole.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDateTime } from '@/common/helpers/time-util';

import CommentDocInput from '../CommentDocInput.vue';
import CommentDocItemAction from './CommentDocItemAction.vue';
import CommentDocItemAttachment from './CommentDocItemAttachment.vue';
import CommentDocItemReceivers from './CommentDocItemReceivers.vue';
import CommentDocItemReply from './CommentDocItemReply.vue';

const props = defineProps({
  comment: {
    type: Object as PropType<DocComment>,
    default: undefined,
  },
});
const visibleDialog = ref<boolean>(false);
const afterAction = inject('afterAction', () => void {});

const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} = deleteJobChatByChatId();

const { mutate: deleteFileMutate } = deleteJobChatFileAttachment();

const createFormComment = inject(
  'createFormComment') as
  (
    content: string,
    attachments: FileList | undefined,
    selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
    userDeptRole: UserDeptRoleInput,
    docId: string,
    replyForId?: string,
    chatId?: string,
  ) => FormData;
const loadComment = inject('loadComments', () => void {});
const deleteFileIds = ref<Set<string>>(new Set());

function sendEditMessage(content: string, attachments: FileList | undefined) {
  const form = new FormData();
  if(props.comment?.chatId){
    form.append('chatId', props.comment?.chatId);
  }
  form.append('sender.content', content);

  let index = 0;
  while (attachments?.item(index)) {
    form.append(`sender.attachments[${index}].attachment`, attachments[index]);
    index++;
  }
  index = 0;
  
  for (const value of deleteFileIds.value) {
    deleteFileMutate({
      id: value,
      chatId: props.comment?.chatId 
    });
  }

  createChatComment(form).then(() => {
    loadComment();
    isEdit.value = false;
    deleteFileIds.value = new Set();
  });
}

function sendReplyMessage(content: string, attachments: FileList | undefined) {
  // const commentId = getCommentIdByUserDeptRole(userDeptRole.value);
  const commentId = props.comment?.chatId;
  console.log(commentId);
  
  if (commentId) {
    const formData = createFormComment(
      content,
      attachments,
      sender.value,
      userDeptRole.value,
      props.comment?.jobId || '',
      commentId,
    );

    toastSuccess({ message: 'Đã cho ý kiến thành công.' });
    afterAction();
    createChatComment(formData).then(() => {
      isReply.value = false;
      loadComment();
    });
  }
}

const isReply = defineModel('isReply', {
  type: Boolean,
  default: false,
});
const isEdit = defineModel('isEdit', {
  type: Boolean,
  default: false,
});
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const sender = computed(() => senderUserDeptRole(props.comment));
const receivers = computed(() => receiverUserDeptRole(props.comment));

const gender = (userId: string | undefined): number | undefined => userId ? usersMoreInfo.value[userId]?.gender : undefined;

const { moment } = useMoment();
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isMine = computed(() => {
  return (
    props.comment?.fromUserId == userDeptRole.value.userId
  // && props.comment?.fromDeptId == userDeptRole.deptId
  // && props.comment?.fromRoleId == userDeptRole.roleId
  );
});

console.log(props.comment);

const isSendToMe = computed(() => {
  return (
    props.comment?.toUserId == userDeptRole.value.userId
      && props.comment?.toDepartmentId == userDeptRole.value.deptId
      && props.comment?.toRoleId == userDeptRole.value.roleId
  );
});

const menuRef = ref<InstanceType<typeof Menu>>();

const allActions = computed<(MenuItem & { filterFunc?: () => boolean })[]>(() => [
  {
    icon: 'reply',
    label: t('document.comment.action.reply'),
    command() {
      isReply.value = true;
    },
    filterFunc() {
      return isSendToMe.value || props.comment?.receivers?.some(value =>
        value.toUserId?.split(',').includes(userDeptRole.value.userId)
    && value.toRoleId?.split(',').includes(userDeptRole.value.roleId)
    && value.toDepartmentId?.split(',').includes(userDeptRole.value.deptId)
      ) === true;
    },
  },
  {
    icon: 'edit',
    label: !isEdit.value ? t('document.comment.action.edit') : t('document.comment.action.cancelEdit'),
    filterFunc() {
      return isMine.value;
    },
    command() {
      isEdit.value = !isEdit.value;
    },
  },
  {
    icon: 'delete',
    label: t('document.comment.action.delete'),
    filterFunc() {
      return isMine.value;
    },
    command() {
      confirm.require({
        message: t('common.confirmDelete', { itemType: 'trao đổi này', }),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        accept: () => {
          if (props.comment?.chatId) {
            deleteMutate({ chatId: props.comment?.chatId });
          }
        },
      });
    },
  },
]);
const confirm = useConfirm();
const filterActions = computed(() => allActions.value.filter((a) => !a.filterFunc || a.filterFunc()));

function senderUserDeptRole(
  comment: DocComment | undefined,
): UserDeptRoleInput {
  return {
    userId: comment?.fromUserId || '',
    deptId: comment?.fromDepartmentId || '',
    roleId: comment?.fromRoleId || '',
    userName: comment?.fromUserName || '',
    deptName: comment?.fromDepartmentName || '',
    roleName: comment?.fromRoleName || '',
    type: OrganizationType.ADMINISTRATIVE,
  };
}

function receiverUserDeptRole(
  comment: DocComment | undefined,
): DocComment[] {
  return comment?.receivers || [];
  // return {
  //   userId: comment?.toUserId || '',
  //   deptId: comment?.toDeptId || '',
  //   roleId: comment?.toRoleId || '',
  //   userName: comment?.toUserName || '',
  //   deptName: comment?.toDeptName || '',
  //   roleName: comment?.toRoleName || '',
  //   type: OrganizationType.ADMINISTRATIVE,
  // };
}

function sendTypeIcon(commentType: 'comment' | 'log' | undefined): string {
  if (commentType === 'comment') {
    return 'chat_bubble';
  }
  return 'chat_bubble';
}

function getActionType(comment: (DocComment & { [key: string]: any }) | undefined): string {
  if (comment) {
    if (comment.commentType === 'comment') {
      return comment.sendType
        ? t('document.comment.sendType.'
              + camelcase(comment.sendType),
        )
        : t('document.comment.sendType.chat');

    } else {
      return comment?.actionName || '';
    }
  }
  return 'null';
}

type UserDeptRoleInputRead = UserDeptRoleInput & { readTime: string | undefined }

const readCommentUser = computed(() => {
  const rs: UserDeptRoleInputRead[] = [];
  props.comment?.receivers?.forEach(comment => {
    if (comment.isRead === true && comment.toUserId !== userDeptRole.value.userId) {
      rs.push({
        userId: comment?.toUserId || '',
        deptId: comment?.toDepartmentId || '',
        roleId: comment?.toRoleId || '',
        userName: comment?.toUserName || '',
        deptName: comment?.toDepartmentName || '',
        roleName: comment?.toRoleName || '',
        type: OrganizationType.ADMINISTRATIVE,
        readTime: comment.readTime
      });
    }
  }
  );
  return rs;
});

deleteOnDone(() => {
  loadComment();
});
const disabled = inject('disabled', false);
</script>

<style scoped>

/* Keyframes for bouncing 3 times quickly and pausing */
@keyframes bounce-3x {
  0%, 20%, 40%, 60%, 100% {
    transform: translateY(0); /* At these points, the icon is at its original position */
  }
  10%, 30%, 50% {
    transform: translateY(-5px); /* Bounces up by 10px */
  }
}

/* Apply the bounce animation */
.bounce-animation {
  animation: bounce-3x 2s infinite;
}

.user-avatar {
  position: relative;
  z-index: 2;
}

.delete {
  color: red !important;
}
</style>
