<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='dialogVisible'
    :header='`${t("common.list")} ${toLower(t("common.group"))}`'
    @hide='emits("hide-dialog")'>

    <div class=''>
      <div
        v-for='group in groups'
        :key='group.id'
        class='align-items-center column-gap-2 cursor-pointer flex flex-row hover:bg-primary-50 p-2'
        @click='selectGroup(group)'>

        <AppIcon
          :class='selectedGroup.id === group.id ? "text-green-500" : "text-500"'
          :name='selectedGroup.id === group.id ? "task_alt" : "radio_button_unchecked"'
          size='2'/>

        <div class='align-items-center column-gap-2 flex flex-row'>
          <div class='flex flex-column'>
            <span>{{ group.name }}</span>
            <small>{{ t("ecm.group.memberCount", {count: group.users.length}) }}</small>
          </div>

        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveChatAttachmentToGroupGraphql } from '@/apps/ecm/api/graphql/chat-graphql';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import { getGroupUserInGraphql } from '@/common/api/graphql/group-graphql';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Group } from '@/common/model/group';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog', 'save-to-group']);

let { chatSelectedAttachments } = storeToRefs(useEcmChatStore());

const dialogVisible = ref(props.visible);
const selectedGroup = ref<Group>({} as Group);
const groups = ref<Group[]>([]);

const { t } = useI18n();

const { onResult: getGroupUserInResult } = getGroupUserInGraphql();
getGroupUserInResult((response) => {
  groups.value = get(response, 'data.groupUserIn', []);
});

function selectGroup(group: Group) {
  selectedGroup.value = group;
}

const categoryGroupFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveAttachmentToGroup()
  }
};
provide('dialogFooterButtons', categoryGroupFormFooterButtons);

function saveAttachmentToGroup() {
  if (chatSelectedAttachments.value.length) {
    const attachment = chatSelectedAttachments.value[0];
    const {
      mutate: saveChatAttachmentToGroupMutate,
      onDone: saveChatAttachmentToGroupDone,
      onError: saveChatAttachmentToGroupError
    } = saveChatAttachmentToGroupGraphql();

    saveChatAttachmentToGroupMutate({
      attachmentId: attachment.id,
      groupId: selectedGroup.value.id
    });

    saveChatAttachmentToGroupDone(() => {
      toastSuccess({});
      emits('hide-dialog');
    });

    saveChatAttachmentToGroupError((error) => {
      toastError({ message: error.message });
      emits('hide-dialog');
    });
  }
}

</script>

<script lang='ts'>
export default { name: 'EcmChatAttachmentGroupDialog' };
</script>