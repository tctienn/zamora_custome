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

    <input
      v-model='model.decisionType'
      hidden
      name='decisionType'/>

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
      label='Nơi lập'
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
      v-model='model.employeeName'
      hidden
      name='employees[0].employeeName'>

    <FormInputDropdownUserInfo
      v-model='model.receptionId'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "receptionId")?.$message?.toString()'
      label='Quản lý trực tiếp'
      name='employees[0].receptionId'
      option-label='fullName'
      option-value='id'
      :options='users'
      required
      @change='changeReception($event)'/>

    <input
      v-model='model.receptionName'
      hidden
      name='employees[0].receptionName'>

    <FormTreeSelect
      v-model='model.oldDeptId'
      class='col-6'
      disabled
      :expanded-level='1'
      label='Phòng ban cũ'
      option-value='key'
      :options='organizations'/>

    <input
      v-model='model.oldDeptId'
      hidden
      name='employees[0].oldDeptId'>

    <input
      v-model='model.oldDeptName'
      hidden
      name='employees[0].oldDeptName'>

    <FormTreeSelect
      v-model='model.newDeptId'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "newDeptId")?.$message?.toString()'
      :expanded-level='1'
      label='Phòng ban bổ nhiệm'
      name='employees[0].newDeptId'
      option-value='key'
      :options='organizations'
      required
      @change='changeNewDept($event)'/>

    <input
      v-model='model.newDeptName'
      hidden
      name='employees[0].newDeptName'>

    <FormInputText
      v-model='model.oldTitleId'
      class='col-6'
      :disabled='true'
      label='Chức danh/Vị trí cũ'/>

    <input
      v-model='model.oldTitleId'
      hidden
      name='employees[0].oldTitleId'>

    <input
      v-model='model.oldTitleName'
      hidden
      name='employees[0].oldTitleName'>

    <FormInputDropdown
      v-model='model.newPositionId'
      class='col-6'
      label='Chức vụ bổ nhiệm'
      name='employees[0].newPositionId'
      option-label='name'
      option-value='code'
      :options='newPositions'
      @change='changeNewPosition($event)'/>

    <input
      v-model='model.newPositionName'
      hidden
      name='employees[0].newPositionName'>

    <FormInputText
      v-model='model.oldPositionId'
      class='col-6'
      :disabled='true'
      label='Chức vụ cũ'/>

    <input
      v-model='model.oldPositionId'
      hidden
      name='employees[0].oldPositionId'>

    <input
      v-model='model.oldPositionName'
      hidden
      name='employees[0].oldPositionName'>

    <FormInputDropdown
      v-model='model.newTitleId'
      class='col-6'
      label='Chức danh/Vị trí bổ nhiệm'
      name='employees[0].newTitleId'
      option-label='name'
      option-value='code'
      :options='newTitles'
      @change='changeNewTitle($event)'/>

    <input
      v-model='model.newTitleName'
      hidden
      name='employees[0].newTitleName'>

    <FormInputDropdown
      v-model='model.reason'
      class='col-6'
      label='Lý do tiếp nhận'
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
import { getAllEmployeeInfo } from '@/apps/hrm/api/graphql/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputDropdownUserInfo from '@/apps/hrm/components/form/FormInputDropdownUserInfo.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { convertToOrganizationTreeNodes, correctModel } from '@/apps/hrm/helpers/utils';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import type { UserInterface } from '@/common/model/User';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface
});
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const { onResult: reasonResult } = getAllByReasonType('REASON_RECEPTION');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');

const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  welfareAdjustment: false,
  decisionType: 'RECEPTION'
});
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref<any[]>([]);
const newPositions = ref<any[]>([]);
const organizationsFlat = ref<any[]>([]);
const users = ref<any[]>([]);
const leaderUsers = ref<any[]>([]);
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
  receptionId: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Quản lý trực tiếp' }), required),
    $autoDirty: true
  },
  newDeptId: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Phòng ban bổ nhiệm' }), required),
    $autoDirty: true
  },
};

const v$: Ref<Validation> = useVuelidate(rules, model);

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

function changeReception(event: any) {
  model.receptionName = users.value.find((lv: any) => lv.id == event.value)?.fullName;
}

onMounted(() => {
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
    organizationsFlat.value = res.data?.allOrganizationPublic || [];
  });
});

function chooseEmployee(employeeId: any) {
  let user: any = users.value.find((info: any) => info.id == employeeId);
  if (user) {
    model.employeeName = user.fullName;
    model.oldDeptId = user.organizationId;
    model.oldTitleId = user.jobTitle;
    model.oldPositionId = user.position;
    model.oldDeptName = user.organizationName;
    model.oldTitleName = user.jobTitle;
    model.oldPositionName = user.position;
  } else {
    model.oldDeptId = '';
    model.oldTitleId = '';
    model.oldPositionId = '';
    model.oldDeptName = '';
    model.oldTitleName = '';
    model.oldPositionName = '';
  }
}

function changeNewDept(event: EventListener) {
  let orgId = Object.keys(event) ? Object.keys(event)[0] : '';

  model.newDeptName = organizationsFlat.value.find((org: any) => org.id == orgId)?.name;
}

function changeDecisionMakingLevel(event: any) {
  model.decisionMakingLevelName = decisionMakingLevels.value.find((lv: any) => lv.code == event.value)?.name;
}

function changeNewTitle(event: any) {
  model.newTitleName = newTitles.value.find((title: any) => title.code == event.value)?.name;
}

function changeNewPosition(event: any) {
  model.newPositionName = newPositions.value.find((position: any) => position.code == event.value)?.name;
}

function changeLeader(event: any) {
  model.signerName = leaderUsers.value.find((leader: any) => leader.id == event.value)?.username;
}

let stopwatch = false;
watch(model, (value) => {
  if (!stopwatch) {
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
        newPositionName: value.employeeDecisions[0].newPositionName,
        receptionId: value.employeeDecisions[0].receptionId,
        receptionName: value.employeeDecisions[0].receptionName,
      };
    }
  }
  stopwatch = true;
});
</script>

<style scoped>

</style>