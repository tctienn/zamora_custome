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
            v-if='comment?.sendType===CommentSendType.XIN_Y_KIEN && isSendToMe && !comment?.isCompleted'
            v-tooltip.left='"Xin ý kiến"'
            class='bounce-animation pi pi-comment'/>
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
                <AppIcon :name='sendTypeIcon(comment?.sendType,comment?.commentType)'/>
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
              comment?.createdTime
                ? moment(comment?.createdTime).format("HH:mm DD/MM/YYYY")
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
import { computed, inject, type PropType, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { CommentSendType, type DocComment, } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocItemAction
  from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemAction.vue';
import CommentDocItemAttachment
  from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemAttachment.vue';
import CommentDocItemReceivers
  from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemReceivers.vue';
import CommentDocItemReply from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemReply.vue';
import CommentDocInput from '@/apps/document/views/doc/component/comment/CommentDocInput.vue';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import AppGroupUserDeptRole from '@/common/components/app/AppGroupUserDeptRole.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  comment: {
    type: Object as PropType<DocComment>,
    default: undefined,
  },
});
const visibleDialog = ref<boolean>(false);
const afterAction = inject('afterAction', () => void {});
const sendEditMessageInj = inject(
  'sendEditMessage',
  (
    commentId: string,
    editCommentModel: FormData,
  ) => Promise.resolve({} as DocComment),
);
const deleteMessageInj = inject(
  'deleteMessage',
  (commentId: string, userDeptRole: UserDeptRoleInput) =>
    Promise.resolve({} as DocComment),
);
const loadComment = inject('loadComments', () => void {});
const sendReplyMessageInj = inject(
  'sendReplyMessage',
  (commentId: string, formData: FormData) => Promise.resolve({} as DocComment),
);
const deleteFileIds = ref<Set<string>>(new Set());

function sendEditMessage(content: string, attachments: FileList | undefined) {
  const form = new FormData();
  form.append('userDeptRole.userId', userDeptRole.value.userId);
  form.append('userDeptRole.deptId', userDeptRole.value.deptId);
  form.append('userDeptRole.roleId', userDeptRole.value.roleId);
  form.append('contentModel.content', content);
  let index1 = 0;
  for (const value of deleteFileIds.value) {
    form.append(`contentModel.deleteFileIds[${index1}]`, value);
    index1++;
  }
  index1 = 0;
  let index = 0;
  while (attachments?.item(index)) {
    form.append(`contentModel.lstAttachmentModel[${index}]`, attachments[index]);
    index++;
  }
  index = 0;

  if (props.comment?.id) {
    Promise.all(
      (props.comment?.receivers || []).map(receiver =>
        sendEditMessageInj(receiver.id || '', form))
    ).then((value) => {
      loadComment();
      isEdit.value = false;
      deleteFileIds.value = new Set();
    });
    // sendEditMessageInj(props.comment?.id, {
    //   content: content,
    //   userDeptRole: userDeptRole,
    // }).then((value) => {
    //   loadComment();
    //   isEdit.value = false;
    // });
  }
}

function deleteMessage(commentId: string) {
  deleteMessageInj(commentId, userDeptRole.value).then((value) => {
    loadComment();
  });
}

const createFormComment = inject(
  'createFormComment',
  (
    content: string,
    attachments: FileList | undefined,
    selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
    commentSendType: CommentSendType = CommentSendType.CHAT,
    userDeptRole: UserDeptRoleInput,
    docId: string,
    isPrivate: boolean,
    replyForId?: string,
  ) => new FormData(),
);

function sendReplyMessage(content: string, attachments: FileList | undefined) {
  const commentId = getCommentIdByUserDeptRole(userDeptRole.value);
  if (commentId) {
    const formData = createFormComment(
      content,
      attachments,
      sender.value,
      CommentSendType.TRA_LOI_Y_KIEN,
      userDeptRole.value,
      props.comment?.objectId || '',
      isPrivate.value,
      commentId,
    );

    toastSuccess({ message: 'Đã cho ý kiến thành công.' });
    afterAction();
    sendReplyMessageInj(commentId, formData).then((value) => {
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
const isSendToMe = computed(() => {
  return (
    props.comment?.toUserId == userDeptRole.value.userId
      && props.comment?.toDeptId == userDeptRole.value.deptId
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
      return isSendToMe.value
          && (!props.comment?.isCompleted && props.comment?.sendType === CommentSendType.XIN_Y_KIEN || props.comment?.sendType !== CommentSendType.XIN_Y_KIEN)
          || props.comment?.receivers?.some(value =>
            value.toUserId == userDeptRole.value.userId && value.toRoleId == userDeptRole.value.roleId && value.toDeptId == userDeptRole.value.deptId
              && (!value.isCompleted && props.comment?.sendType === CommentSendType.XIN_Y_KIEN || props.comment?.sendType !== CommentSendType.XIN_Y_KIEN)
          ) == true;
    },
  },
  {
    icon: 'edit',
    label: !isEdit.value ? t('document.comment.action.edit') : t('document.comment.action.cancelEdit'),
    filterFunc() {
      return isMine.value && !props.comment?.isCompleted && props.comment?.sendType !== CommentSendType.XIN_Y_KIEN;
    },
    command() {
      isEdit.value = !isEdit.value;
    },
  },
  {
    icon: 'delete',
    label: t('document.comment.action.delete'),
    filterFunc() {
      return isMine.value && !props.comment?.isCompleted && props.comment?.sendType !== CommentSendType.XIN_Y_KIEN;
    },
    command() {
      confirm.require({
        message: t('common.confirmDelete', { itemType: 'trao đổi này', }),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        accept: () => {
          if (props.comment?.id) {
            deleteMessage(props.comment?.id);
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
    deptId: comment?.fromDeptId || '',
    roleId: comment?.fromRoleId || '',
    userName: comment?.fromUserName || '',
    deptName: comment?.fromDeptName || '',
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

function sendTypeIcon(sendType: string | undefined, commentType: 'comment' | 'log' | undefined): string {
  if (commentType === 'comment') {
    switch (sendType) {
    case CommentSendType.CHAT:
      return 'chat_bubble';
    case CommentSendType.XIN_Y_KIEN:
      return 'mark_unread_chat_alt';
    case CommentSendType.TRA_LOI_Y_KIEN:
      return 'chat';
    default:
      return 'chat_bubble';
    }
  } else {
    return 'start';
  }
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

function getCommentIdByUserDeptRole(userDeptRole: UserDeptRoleInput) {
  return props.comment?.receivers?.find(value =>
    value.toUserId == userDeptRole.userId && value.toRoleId == userDeptRole.roleId && value.toDeptId == userDeptRole.deptId
      && (!value.isCompleted && props.comment?.sendType === CommentSendType.XIN_Y_KIEN || props.comment?.sendType !== CommentSendType.XIN_Y_KIEN)
  )?.id;
}

type UserDeptRoleInputRead = UserDeptRoleInput & { readTime: string | undefined }

const readCommentUser = computed(() => {
  const rs: UserDeptRoleInputRead[] = [];
  props.comment?.receivers?.forEach(comment => {
    if (comment.isRead === true && comment.toUserId !== userDeptRole.value.userId) {
      rs.push({
        userId: comment?.toUserId || '',
        deptId: comment?.toDeptId || '',
        roleId: comment?.toRoleId || '',
        userName: comment?.toUserName || '',
        deptName: comment?.toDeptName || '',
        roleName: comment?.toRoleName || '',
        type: OrganizationType.ADMINISTRATIVE,
        readTime: comment.readTime
      });
    }
  }
  );
  return rs;
});
const disabled = inject('disabled', false);
const isPrivate = inject('isPrivate', { value: false } as Ref<boolean>);
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
