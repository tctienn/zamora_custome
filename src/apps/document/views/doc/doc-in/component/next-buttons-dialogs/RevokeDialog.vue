<template>
  <Dialog
    v-model:visible='isVisibleDialogRevoke'
    :header='t("document.flowAction.listCanRevoke")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @show='reload'>
    <TreeTable
      v-model:expanded-keys='expandedKeys'
      v-model:selection-keys='selectionKeys'
      auto-layout
      :filters='filters'
      row-hover
      selection-mode='checkbox'
      :value='treeOptions'
      @node-select='nodeSelect'
      @node-unselect='nodeUnselect'>
      <Column
        body-class='flex align-items-center'
        expander
        :header='t("document.flowAction.userOrDeptReceive")'>
        <template #body='{node:nodeData}'>
          <AppUserDeptRole
            v-if="!nodeData.key.startsWith('root')"
            avatar-size='2.5'
            info-visible
            :infos='["roleName","deptName"]'
            name-visible
            :user-dept-role='nodeData.data'>
          </AppUserDeptRole>
          <template v-else>
            {{ nodeData?.data?.label }}
          </template>
        </template>
      </Column>
      <!--      <Column-->
      <!--        header='Người/Đơn vị nhận'>-->
      <!--        <template #body='{node:nodeData}'>-->
      <!--          <AppUserDeptRole-->
      <!--            v-if="!nodeData.key.startsWith('root')"-->
      <!--            avatar-size='2.5'-->
      <!--            info-visible-->
      <!--            :infos='["positionName","roleName","deptName"]'-->
      <!--            name-visible-->
      <!--            :user-dept-role='nodeData.data'>-->
      <!--          </AppUserDeptRole>-->
      <!--        </template>-->
      <!--      </Column>-->
      <Column
        :header='t("document.flowAction.transferDate")'>
        <template #body='{node}'>
          {{ formatDateTime(node.data?.sendTime) }}
        </template>
      </Column>
      <Column
        field='content'
        :header='t("common.content")'>
      </Column>
      <Column
        field='content'
        :header='t("common.type")'>
        <template #body='{node:{data}}'>
          {{ getRevokeType(data?.__typename) }}
        </template>
      </Column>
      <Column
        :header='t("common.status")'>
        <template #body='{node:{data:nodeData}}'>
          <div
            :class='`status-badge text-center text-white p-1 status-${nodeData.status}`'>
            {{
              nodeData.status ? t(`document.flowAction.status.${camelcase(lowerCase(nodeData.status))}`) : ""
            }}
          </div>
        </template>
      </Column>
    </TreeTable>
    <div class='p-component'>
      <div
        v-required
        class='font-semibold pb-3'>
        {{ t("document.flowAction.revokeReason") }}
      </div>
      <div>
        <Textarea
          v-model='reason'
          class='overflow-auto w-full'
          :rows='5'/>
      </div>
    </div>

    <template #footer>
      <Button
        class='p-button-plain'
        :label='revokeNodeButtons.closeButton.label'
        severity='danger'
        @click='revokeNodeButtons.closeButton.command'/>
      <Button
        :disabled='!enableRevoke'
        :label='revokeNodeButtons.actionButton.label'
        @click='revokeNodeButtons.actionButton.command'>
        <template
          #icon>
          <AppIcon
            :name='revokeNodeButtons.actionButton.materialIcon'
            size='1.3'>
          </AppIcon>
        </template>
      </Button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import camelcase from 'camelcase';
import { groupBy, lowerCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableExpandedKeys, TreeTableSelectionKeys } from 'primevue/treetable';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getListCanRevokeDoc } from '@/apps/document/api/graphql/doc-in';
import type { CCInfo } from '@/apps/document/model/ccdoc';
import type { DocComment } from '@/apps/document/model/comment';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  docId: {
    type: String,
    required: true
  }
});
const emits = defineEmits<{
  (e: 'revokeDoc', incomingProcess: InComingProcess[], ccInfo: CCInfo[], comment: DocComment[], reason: string): void,
  (e: 'emptyRevokable'): void,
}>();
const { t } = useI18n();
const { moment } = useMoment();
const isVisibleDialogRevoke = defineModel<boolean>('visible', { default: false });

const listIncomingProcess = ref<InComingProcess[]>([]);
const listCCInfo = ref<CCInfo[]>([]);
const listComment = ref<DocComment[]>([]);
const enableRevoke = computed(() => {
  return (listIncomingProcess.value.length > 0 || listComment.value.length > 0 || listCCInfo.value.length > 0) && reason.value.trim().length > 0;
});
const revokeNodeButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => isVisibleDialogRevoke.value = false
  },
  actionButton: {
    materialIcon: 'undo',
    label: t('document.action.revoke'),
    text: false,
    type: 'button',
    command: () => {
      emits('revokeDoc', listIncomingProcess.value, listCCInfo.value, listComment.value, reason.value);
      listIncomingProcess.value = [];
      listCCInfo.value = [];
      listComment.value = [];
      selectionKeys.value = {};
    },
  }
};
const listData = ref<((CCInfo | InComingProcess | DocComment) & { __typename: string })[]>([]);
const group = ref();
const treeOptions = ref<TreeNode[]>([]);
const selectionKeys = ref<TreeTableSelectionKeys>();
const expandedKeys = ref<TreeTableExpandedKeys>({
  rootCCInfo: true,
  rootIncomingProcess: true,
  rootComment: true
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  onResult,
  variables,
  refetch,
} = getListCanRevokeDoc(props.docId, userDeptRole.value);

function reload() {
  refetch({
    docId: props.docId,
    userDeptRole: userDeptRole.value
  });
}

onResult(value => {
  // Set listData value from GraphQL result or an empty array if not present
  listData.value = value.data?.getListCanRevokeDoc || [];
  if (listData.value.length == 0) {
    emits('emptyRevokable');
  }
  // Group data by __typename field
  group.value = groupBy(listData.value, item => item.__typename);

  // Function to map items to TreeNode format, allowing optional data transformation
  const mapToTreeNodes = <T extends { id: string }>(
    items: T[] = [],
    dataTransform?: (item: T) => object
  ): TreeNode[] =>
      items.map(e => ({
        key: e.id,
        data: dataTransform ? dataTransform(e) : { ...e },
      }));

  // Define mapping configurations for each type
  const mappingConfig: Record<string, (item: any) => object> = {
    CCInfo: (item: CCInfo) => ({
      ...item,
      label: item?.receiverName,
      content: '',
      userId: item?.receiverId,
      userName: item?.receiverName,
      deptId: item?.receiverDeptId,
      deptName: item?.receiverDeptName,
      roleId: item?.receiverRoleId,
      roleName: item?.receiverRoleName,
      sendDate: item?.sendTime,
    }),
    IncomingProcess: (item: InComingProcess) => ({
      ...item,
      label: item?.note,
      content: item?.note,
      userId: item?.receiverId,
      userName: item?.receiverName,
      deptId: item?.receiverDeptId,
      deptName: item?.receiverDeptName,
      roleId: item?.receiverRoleId,
      roleName: item?.receiverRoleName,
    }),
    Comment: (item: DocComment) => ({
      ...item,
      label: item?.content,
      content: item?.content,
      userId: item?.toUserId,
      userName: item?.toUserName,
      deptId: item?.toDeptId,
      deptName: item?.toDeptName,
      roleId: item?.toRoleId,
      roleName: item?.toRoleName,
    }),
  };

  treeOptions.value = ['CCInfo',
    'IncomingProcess',
    'Comment'].flatMap(type => mapToTreeNodes(group.value[type], mappingConfig[type]));
});

function nodeSelect(node: TreeNode) {
  switch (node.data.__typename) {
  case 'IncomingProcess':
    listIncomingProcess.value.push(node.data);
    break;
  case 'CCInfo':
    listCCInfo.value.push(node.data);
    break;
  case 'Comment':
    listComment.value.push(node.data);
    break;
  }
}

function nodeUnselect(node: TreeNode) {
  switch (node.data.__typename) {
  case 'IncomingProcess':
    listIncomingProcess.value = listIncomingProcess.value.filter(e => e.id != node.data?.id);
    break;
  case 'CCInfo':
    listCCInfo.value = listCCInfo.value.filter(e => e.id != node.data?.id);
    break;
  case 'Comment':
    listComment.value = listComment.value.filter(e => e.id != node.data?.id);
    break;
  }
}

const filters = ref();

function getRevokeType(__typename: string) {
  const map: Record<string, string> = {
    CCInfo: t('document.action.proclaim'),
    IncomingProcess: t('document.flowAction.processFlow'),
    Comment: t('document.action.askForOpinion'),
  };
  return map?.[__typename] || '';
}

const reason = ref<string>('');

const validateRules = {
  reason: {
    notBlank: helpers.withMessage(t('document.flowAction.validate.reasonNotEmpty'), (value: string) => {
      return reason.value.trim().length > 0;
    }),
  },
};
const v$ = useVuelidate(validateRules, { reason });
</script>

<style scoped>
:deep(td) {
  border: none !important;
}

.status-NHAP {
  background: #94C748
}

.status-CHO_XL {
  background: #F0BC8B
}

.status-DANG_XL {
  background: #BF7CD3
}

.status-DA_XL {
  background: #69A0DC;
}
</style>