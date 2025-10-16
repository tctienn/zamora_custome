<template>

  <div class='formgrid grid'>
    <input
      v-model='model.id'
      hidden
      name='id'/>

    <input
      v-model='model.createdTime'
      hidden
      name='createdTime'/>

    <input
      v-model='model.decisionType'
      hidden
      name='decisionType'/>

    <input
      v-model='model.createdBy'
      hidden
      name='createdBy'/>

    <input
      v-model='model.lastModifiedTime'
      hidden
      name='lastModifiedTime'/>

    <input
      v-model='model.lastModifiedBy'
      hidden
      name='lastModifiedBy'/>

    <FormInputText
      v-model='model.noDecision'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "noDecision")?.$message?.toString()'
      label='Số quyết định'
      name='noDecision'
      required/>

    <FormInputCalendar
      v-model='model.decisionDate'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "decisionDate")?.$message?.toString()'
      label='Ngày quyết định'
      name='decisionDate'
      required/>

    <FormInputCalendar
      v-model='model.effectStartDate'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "effectStartDate")?.$message?.toString()'
      label='Ngày hiệu lực'
      name='effectStartDate'
      required/>

    <div class='col-3'></div>

    <FormInputDropdown
      v-model='model.decisionMakingLevelId'
      class='col-6'
      label='Cấp ra quyết định'
      name='decisionMakingLevelId'
      option-label='name'
      option-value='code'
      :options='decisionMakingLevels'
      @change='changeDecisionMakingLevel($event)'/>

    <input
      v-model='model.decisionMakingLevelName'
      hidden
      name='decisionMakingLevelName'>

    <FormInputText
      v-model='model.placeOfDecision'
      class='col-6'
      label='Nơi lập quyết định'
      name='placeOfDecision'/>
    <FormInputDropdownUserInfo
      v-model='model.employeeId'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "employeeId")?.$message?.toString()'
      label='Nhân sự'
      name='employees[0].employeeId'
      option-label='fullName'
      option-value='id'
      :options='users'
      required
      @change='chooseEmployee(model.employeeId)'/>

    <input
      v-model='model.id'
      hidden
      name='employees[0].id'/>

    <FormInputDropdown
      v-model='model.contract'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "contract")?.$message?.toString()'
      label='Hợp đồng'
      name='contract'
      option-label='code'
      option-value='id'
      :options='contracts'
      required/>

    <FormInputDropdown
      v-model='model.reason'
      class='col-6'
      label='Lý do chấm dứt HĐLĐ'
      name='reason'
      option-label='name'
      option-value='code'
      :options='reasons'/>

    <FormInputDropdown
      v-model='model.signerId'
      class='col-6'
      label='Người ký'
      name='signerId'
      option-label='info'
      option-value='id'
      :options='leaderUsers'
      @change='changeLeader($event)'/>

    <input
      v-model='model.signerName'
      hidden
      name='signerName'>

    <div class='col-12'>
      <FormInputTextArea
        v-model='model.description'
        label='Mô tả'
        name='description'/>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllByReasonType, getAllCategory } from '@/apps/hrm/api/graphql/category';
import { findContractByEmployeeIdAndStatus } from '@/apps/hrm/api/graphql/contract';
import { getAllEmployeeInfo } from '@/apps/hrm/api/graphql/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputDropdownUserInfo from '@/apps/hrm/components/form/FormInputDropdownUserInfo.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { convertToOrganizationTreeNodes, correctModel } from '@/apps/hrm/helpers/utils';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import type { UserInterface } from '@/common/model/User';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const {
  load: findContractLoad,
  onResult: findContractResult
} = findContractByEmployeeIdAndStatus();
const { t } = useI18n();
const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface
});
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const { onResult: reasonResult } = getAllByReasonType('REASON_TERMINATION');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');

const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  welfareAdjustment: false,
  decisionType: 'CONTRACT_TERMINATION'
});
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref([]);
const newPositions = ref([]);
const users = ref([]);
const leaderUsers = ref<any[]>([]);
const contracts = ref([]);
const organizations = ref<TreeNode[]>([]);
watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      Object.assign(model, correctModel(newValue));
    }
  }
);

const rules = {
  noDecision: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Số quyết định' }), required),
    $autoDirty: true,
  },
  decisionDate: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Ngày quyết định' }), required),
    $autoDirty: true
  },
  effectStartDate: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Ngày hiệu lực' }), required),
    $autoDirty: true
  },
  employeeId: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Nhân sự' }), required),
    $autoDirty: true
  },
  contract: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Hợp đồng' }), required),
    $autoDirty: true
  },
};

const v$: Ref<Validation> = useVuelidate(rules, model);

findContractResult((res) => {
  contracts.value = res.data.findContractByEmployeeIdAndStatus;
});

categoryResult((res) => {
  decisionMakingLevels.value = res.data.getAllCategory;
});

reasonResult((res) => {
  reasons.value = res.data.getAllByReasonType;
});

newTitleResult((res) => {
  newTitles.value = res.data.getAllCategory;
});

newPositionResult((res) => {
  newPositions.value = res.data.getAllCategory;
});

getAllEmployeeInfo().onResult((res) => {
  users.value = res.data.getAllEmployeeInfo;
});

getAllUserServicePublic().onResult((res) => {
  leaderUsers.value = res.data.getAllUserServicePublic.filter((user: any) => user.roles?.includes('LANH_DAO'))?.map((u: UserInterface) => ({
    id: u.id,
    info: `${u.email} | ${u.fullName} | ${u.username}`
  }));
});

onMounted(() => {
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
});

function chooseEmployee(employeeId: any) {
  findContractLoad(undefined, {
    employeeId: employeeId,
    contractStatus: 'VALID'
  });

  model.contract = null;
}

function changeDecisionMakingLevel(event: any) {
  model.decisionMakingLevelName = decisionMakingLevels.value.find((lv: any) => lv.code == event.value)?.name;
}

function changeLeader(event: any) {
  model.signerName = leaderUsers.value.find((leader: any) => leader.id == event.value)?.username;
}

let stopwatch = false;
watch(model, (value) => {
  if (!stopwatch) {

    findContractLoad(undefined, {
      employeeId: value.employeeDecisions?.length > 0 ? value.employeeDecisions[0].employeeId : '',
      contractStatus: 'VALID'
    });

    modelValue.value = value;
    if (value.employeeDecisions?.length > 0) {
      modelValue.value = {
        ...modelValue.value,
        decisionId: value.employeeDecisions[0].decisionId,
        employeeId: value.employeeDecisions[0].employeeId,
        oldDeptId: value.employeeDecisions[0].oldDeptId,
        oldTitleId: value.employeeDecisions[0].oldTitleId,
        oldPositionId: value.employeeDecisions[0].oldPositionId,
        newDeptId: value.employeeDecisions[0].newDeptId,
        newTitleId: value.employeeDecisions[0].newTitleId,
        newPositionId: value.employeeDecisions[0].newPositionId,
        employeeName: value.employeeDecisions[0].employeeName,
        oldDeptName: value.employeeDecisions[0].oldDeptName,
        oldTitleName: value.employeeDecisions[0].oldTitleName,
        oldPositionName: value.employeeDecisions[0].oldPositionName,
        newDeptName: value.employeeDecisions[0].newDeptName,
        newTitleName: value.employeeDecisions[0].newTitleName,
        newPositionName: value.employeeDecisions[0].newPositionName
      };
    }
  }
  stopwatch = true;
});
</script>

<style scoped>

</style>