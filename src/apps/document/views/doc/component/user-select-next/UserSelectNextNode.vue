<!--<template>-->
<!--  <div class='font-semibold mb-3 text-lg'>Chuyển tới: {{ userSelectNextResponse?.node?.data?.label }}</div>-->
<!--  <div class='flex flex-column gap-3'>-->
<!--    <div-->
<!--      class='flex flex-row gap-3'>-->
<!--      <div-->
<!--        class='border-1 border-round surface-border w-full'>-->
<!--        <CommonTree-->
<!--          v-model:chosen-user-dept-role='chosenUserDeptRole'-->
<!--          selection-mode='multiple'-->
<!--          :should-show-checkbox='shouldShowCheckbox'-->
<!--          style='height: 64vh;'-->
<!--          :tree-options='treeNodeFiltered'/>-->
<!--      </div>-->
<!--      <ReceiveListUserDept-->
<!--        v-model:chosen-user-dept-role='chosenUserDeptRole'-->
<!--        class='w-full'-->
<!--        :hide-receive-to-know='hideReceiveToKnow'/>-->
<!--    </div>-->
<!--    <div class='flex'>-->
<!--      <div class='field w-6'>-->
<!--        <label class='font-semibold'>-->
<!--          {{ t('document.doc.deadline') }}-->
<!--        </label>-->
<!--        <div>-->
<!--          <Calendar-->
<!--            v-model='dataNode.deadline'-->
<!--            date-format='dd/mm/yy'-->
<!--            show-icon>-->
<!--          </Calendar>-->
<!--          <ValidateErrorMessage :errors='v$.deadline.$errors'/>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class='field w-6'>-->
<!--        <label class='font-semibold'>-->
<!--          {{ t('document.doc.deadlineNumber') }}-->
<!--        </label>-->
<!--        <div>-->
<!--          <InputNumber v-model='dataNode.deadlineNumber'>-->
<!--          </InputNumber>-->
<!--          <ValidateErrorMessage :errors='v$.deadlineNumber.$errors'/>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class='field'>-->
<!--      <TabView>-->
<!--        <TabPanel :header='t("document.flowAction.note")'>-->
<!--          <Textarea-->
<!--            id='description'-->
<!--            v-model='dataNode.note'-->
<!--            auto-resize-->
<!--            class='w-full'-->
<!--            rows='5'/>-->
<!--        </TabPanel>-->
<!--        <TabPanel :header='t("document.flowAction.fileAttachment")'>-->
<!--          <UploadFilesGridV2-->
<!--            v-model:file-list='dataNode.fileList'-->
<!--            v-model:files-deleted='listFileDelete'-->
<!--            v-model:list-file='dataNode.attachments'-->
<!--            :file-attachments-name="'attachmentModel'"-->
<!--            :header="t('document.flowAction.listFile')"/>-->
<!--        </TabPanel>-->
<!--      </TabView>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->

<!--import { useVuelidate } from '@vuelidate/core';-->
<!--import { helpers } from '@vuelidate/validators';-->
<!--import { storeToRefs } from 'pinia';-->
<!--import type { TreeNode } from 'primevue/treenode';-->
<!--import { computed, inject, type PropType, type Ref, ref, toRef, watch } from 'vue';-->
<!--import { useI18n } from 'vue-i18n';-->

<!--import { useOrganizationTree } from '@/apps/document/helpers/composable/handle-organization-type';-->
<!--import type { DocumentAttachment } from '@/apps/document/model/attachment';-->
<!--import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';-->
<!--import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';-->
<!--import type { UserSelectNext, UserSelectNextResponse } from '@/apps/document/model/userNextAction';-->
<!--import { useDocumentRolesStore } from '@/apps/document/store/document-role';-->
<!--import {-->
<!--  type DataNode,-->
<!--  transformChosenUserDeptRole-->
<!--} from '@/apps/document/views/doc/component/user-select-next/process-data';-->
<!--import ReceiveListUserDept from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUserDept.vue';-->
<!--import CommonTree from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/CommonTree.vue';-->
<!--import UploadFilesGridV2 from '@/common/components/custom/UploadFilesGridV2.vue';-->
<!--import { associateBy } from '@/common/helpers/extension/array.extension';-->
<!--import { daysBetweenDates, normalizeDate } from '@/common/helpers/time-util';-->
<!--import { filterTreeNodes } from '@/common/helpers/tree-node-utils';-->

<!--const props = defineProps({-->
<!--  userSelectNextResponse: {-->
<!--    type: Object as PropType<UserSelectNextResponse>,-->
<!--    default: () => ({})-->
<!--  },-->
<!--  header: {-->
<!--    type: String,-->
<!--    default: undefined-->
<!--  },-->
<!--  shouldShowCheckbox: {-->
<!--    type: Function as PropType<(node: TreeNode) => boolean>,-->
<!--    default: () => true, // Example default function accepting a parameter-->
<!--  },-->
<!--  showUsersFromDifferentDept: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  },-->
<!--  hideReceiveToKnow: {-->
<!--    type: Boolean,-->
<!--    default: false-->
<!--  },-->
<!--  isLoading: {-->
<!--    type: Boolean,-->
<!--    default: false-->
<!--  }-->
<!--});-->

<!--const chosenUserDeptRole = ref<(UserDeptRoleInput & {-->
<!--  id: string,-->
<!--  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined-->
<!--})[]>([]);-->

<!--const dataNode = defineModel<DataNode>({-->
<!--  default: {-->
<!--    node: {},-->
<!--    edge: {},-->
<!--    note: '',-->
<!--    attachments: []-->
<!--  }-->
<!--});-->

<!--watch(chosenUserDeptRole, value => {-->
<!--  dataNode.value = {-->
<!--    ...dataNode.value,-->
<!--    processes: transformChosenUserDeptRole(value)-->
<!--  };-->
<!--}, { deep: true });-->

<!--const { t } = useI18n();-->
<!--const { userDeptRole } = storeToRefs(useDocumentRolesStore());-->
<!--const userSelectNext = computed(() => props.userSelectNextResponse?.usersSelectNext || {});-->
<!--const userSelectNextMap = computed<Record<string, UserSelectNext>>(() => {-->
<!--  return associateBy(userSelectNext.value, item => {-->
<!--    if (item.userId) {-->
<!--      return 'user_' + item.userId;-->
<!--    } else {-->
<!--      return 'dept_' + item.deptId;-->
<!--    }-->
<!--  });-->
<!--});-->

<!--function skipUser(user: UserSelectNext): boolean {-->
<!--  if (props.showUsersFromDifferentDept) {-->
<!--    return false;-->
<!--  }-->
<!--  return user.isClericalCharged || user.deptId !== userDeptRole.value.deptId;-->
<!--}-->

<!--const { treeNode } = useOrganizationTree(userDeptRole.value.type, toRef(userSelectNext), skipUser);-->
<!--const treeNodeFiltered = computed(() => {-->
<!--  return filterTreeNodes(treeNode.value, node => {-->
<!--    if (node.data?.type == 'user') {-->
<!--      return true;-->
<!--    } else {-->
<!--      return !!(node.data?.type == 'dept' && userSelectNextMap.value['dept_' + node.data?.id || '']);-->
<!--    }-->
<!--  });-->
<!--});-->

<!--// const note = ref<string>('');-->
<!--// const deadline = ref<Date>();-->
<!--const doc = inject('doc', {} as Ref<DocOutInput | DocOut>);-->
<!--const deadlineDateComputed = computed<Date | undefined>(() => {-->
<!--  if (doc.value?.deadlineDate) {-->
<!--    if (doc.value?.deadlineDate instanceof Date) {-->
<!--      return doc.value.deadlineDate;-->
<!--    } else {-->
<!--      return new Date(doc.value?.deadlineDate);-->
<!--    }-->
<!--  }-->
<!--  return undefined;-->
<!--});-->
<!--watch(() => deadlineDateComputed.value, value => {-->
<!--  dataNode.value.deadline = value || undefined;-->
<!--}, { immediate: true });-->
<!--// const deadlineNumber = ref<number | undefined>();-->
<!--watch([() => doc.value?.deadlineNumber, () => dataNode.value.deadline], ([newDeadlineNumber, newDeadline]) => {-->
<!--  dataNode.value.deadlineNumber = newDeadlineNumber || (newDeadline ? daysBetweenDates(new Date(), newDeadline) : undefined);-->
<!--}, { immediate: true });-->
<!--const validateRules = {-->
<!--  deadline: {-->
<!--    checkBeforeEndDeadline: helpers.withMessage(t('document.common.error.deadlineAfterEndDeadline'), (value: Date | undefined) => {-->
<!--      return value == undefined || !deadlineDateComputed.value || value <= deadlineDateComputed.value;-->
<!--    }),-->
<!--    checkAfterNow: helpers.withMessage(t('document.common.error.deadlineBeforeNow'), (value: Date | undefined) => {-->
<!--      return value == undefined || normalizeDate(value) >= normalizeDate(new Date());-->
<!--    }),-->
<!--  },-->
<!--  deadlineNumber: { required: helpers.withMessage(t('document.common.error.deadlineNumber'), (value: number | undefined) => !value || value > 0) }-->
<!--};-->

<!--const v$ = useVuelidate(validateRules, {-->
<!--  deadline: dataNode.value.deadline,-->
<!--  deadlineNumber: dataNode.value.deadlineNumber-->
<!--});-->
<!--const listFileDelete = ref<string[]>([]);-->
<!--const fileList = ref<FileList>();-->
<!--const attachments = ref<DocumentAttachment[]>([]);-->
<!--</script>-->

<!--<style scoped>-->

<!--</style>-->