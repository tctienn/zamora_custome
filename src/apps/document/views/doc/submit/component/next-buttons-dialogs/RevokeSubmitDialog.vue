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

import camelcase from 'camelcase';
import { groupBy, lowerCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableExpandedKeys, TreeTableSelectionKeys } from 'primevue/treetable';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { listRevokeDocSubmitGraphql } from '@/apps/document/api/graphql/doc-submit';
import type { DocComment } from '@/apps/document/model/comment';
import type { SubmitProcess } from '@/apps/document/model/process/submit';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  docId: {
    type: String,
    required: true
  }
});
const emits = defineEmits<{
  (e: 'revokeDoc', submitProcesses: SubmitProcess[], comment: DocComment[], reason: string): void,
  (e: 'emptyRevokable'): void,
}>();
const { t } = useI18n();
const isVisibleDialogRevoke = defineModel<boolean>('visible', { default: false });

const listSubmitProcess = ref<SubmitProcess[]>([]);
const listComment = ref<DocComment[]>([]);
const enableRevoke = computed(() => {
  return (listSubmitProcess.value.length > 0 || listComment.value.length > 0) && reason.value.trim().length > 0;
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
      emits('revokeDoc', listSubmitProcess.value, listComment.value, reason.value);
      listSubmitProcess.value = [];
      listComment.value = [];
      selectionKeys.value = {};
    },
  }
};
const listData = ref<((SubmitProcess | DocComment) & { __typename: string })[]>([]);
const group = ref();
const treeOptions = ref<TreeNode[]>([]);
const selectionKeys = ref<TreeTableSelectionKeys>();
const expandedKeys = ref<TreeTableExpandedKeys>({
  rootSubmitProcess: true,
  rootComment: true
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  onResult,
  variables,
  refetch,
} = listRevokeDocSubmitGraphql(props.docId, userDeptRole.value);

function reload() {
  refetch({
    docId: props.docId,
    userDeptRole: userDeptRole.value
  });
}

onResult(value => {
  // Set listData value from GraphQL result or an empty array if not present
  listData.value = value.data?.listRevokeDocSubmit || [];
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
    DocSubmitProcess: (item: SubmitProcess) => ({
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

  treeOptions.value = ['DocSubmitProcess',
    'Comment'].flatMap(type => mapToTreeNodes(group.value[type], mappingConfig[type]));
});

function nodeSelect(node: TreeNode) {
  switch (node.data.__typename) {
  case 'DocSubmitProcess':
    listSubmitProcess.value.push(node.data);
    break;
  case 'Comment':
    listComment.value.push(node.data);
    break;
  }
}

function nodeUnselect(node: TreeNode) {
  switch (node.data.__typename) {
  case 'DocSubmitProcess':
    listSubmitProcess.value = listSubmitProcess.value.filter(e => e.id != node.data?.id);
    break;
  case 'Comment':
    listComment.value = listComment.value.filter(e => e.id != node.data?.id);
    break;
  }
}

const filters = ref();

function getRevokeType(__typename: string) {
  const map: Record<string, string> = {
    DocSubmitProcess: t('document.flowAction.processFlow'),
    Comment: t('document.action.askForOpinion'),
  };
  return map?.[__typename] || '';
}

const reason = ref<string>('');
//
// const validateRules = {
//   reason: {
//     notBlank: helpers.withMessage(t('document.flowAction.validate.reasonNotEmpty'), (value: string) => {
//       return reason.value.trim().length > 0;
//     }),
//   },
// };
// const v$ = useVuelidate(validateRules, { reason });
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