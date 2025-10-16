<template>

  <div class='formgrid grid'>
    <input
      v-model='model.decisionType'
      hidden
      name='decisionType'/>

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

    <FormInputDropdown
      v-model='model.otherDecisionType'
      class='col-6'
      label='Loại quyết định'
      name='otherDecisionType'
      option-label='name'
      option-value='code'
      :options='decisionType'/>

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

    <FormInputCalendar
      v-model='model.effectEndDate'
      class='col-3'
      label='Ngày hết hiệu lực'
      name='effectEndDate'/>

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
      is-multi-select
      label='Nhân sự'
      name='employees[0].employeeId'
      option-label='fullName'
      option-value='id'
      :options='users'
      required
      @change='chooseEmployee(model.employeeId)'/>
    <input
      v-model='model.employeeDecisionId'
      hidden
      :name='`employees[0].id`'>

    <input
      v-model='model.employeeName'
      hidden
      name='employees[0].employeeName'>

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
import { onMounted, type PropType, reactive, type Ref, ref, toRaw, watch } from 'vue';
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
import { convertToOrganizationTreeNodes, correctModel } from '@/apps/hrm/helpers/utils';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import type { UserInterface } from '@/common/model/User';
import { useHrmDecision } from '@/common/store/decision';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();

const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface
});

const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const { onResult: reasonResult } = getAllByReasonType('REASON_APPOINTMENT');
const { onResult: otherDecisionResult } = getAllCategory(userDeptRole.value, 'OTHER_DECISIONS');
const decisionType = ref();
const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  welfareAdjustment: false,
  decisionType: 'OTHER'
});

// Refs for data
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const users = ref([]);
const leaderUsers = ref<any[]>([]);
const organizations = ref<TreeNode[]>([]);
const organizationsFlat = ref<any[]>([]);

const decisionStore = useHrmDecision();
const {
  draftEmployeeIds,
  pendingEmployeeIds
} = storeToRefs(decisionStore);

watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      Object.assign(model, correctModel(newValue));
    }
  }
);

const notDuplicateEmployee = helpers.withMessage(
  'Nhân sự đã tồn tại quyết định đang xử lý',
  (value) => {
    const rawUsers = toRaw(users.value);
    const user = rawUsers.find((info: any) => info.id == value) as any;
    if (!user) {
      return true;
    }
    if (!value || model.id) {
      return true;
    }
    return (
      !draftEmployeeIds.value.includes(user.fullName)
          && !pendingEmployeeIds.value.includes(user.fullName)
    );
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
    notDuplicateEmployee,
    $autoDirty: true
  }
};

const v$: Ref<Validation> = useVuelidate(rules, model);

categoryResult((res) => {
  decisionMakingLevels.value = res.data.getAllCategory;
});

reasonResult((res) => {
  reasons.value = res.data.getAllByReasonType;
});

otherDecisionResult((res) => {
  decisionType.value = res.data.getAllCategory;
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
    organizationsFlat.value = res.data?.allOrganizationPublic || [];
  });
});

function changeDecisionMakingLevel(event: any) {
  model.decisionMakingLevelName = decisionMakingLevels.value.find((lv: any) => lv.code == event.value)?.name;
}

function changeLeader(event: any) {
  model.signerName = leaderUsers.value.find((leader: any) => leader.id == event.value)?.username;
}

function chooseEmployee(employeeId: any) {
  let user: any = users.value.find((info: any) => info.id == employeeId);
  if (user) {
    model.employeeName = user.fullName;
    model.employeeType = user.employeeType;
    model.professionalWork = user.professionalWork;
  } else {
    model.employeeName = '';
    model.employeeType = '';
    model.professionalWork = '';
  }
}

let stopwatch = false;
watch(model, (value) => {
  if (!stopwatch) {
    modelValue.value = value;
    if (value.employeeDecisions?.length > 0) {
      modelValue.value = {
        ...modelValue.value,
        employeeDecisionId: value.employeeDecisions[0].id,
        decisionId: value.employeeDecisions[0].decisionId,
        employeeId: value.employeeDecisions[0].employeeId,
        employeeName: value.employeeDecisions[0].employeeName,
        isConcurrent: value.employeeDecisions[0].isConcurrent || false,
        professionalWork: value.employeeDecisions[0].professionalWork,
        employeeType: value.employeeDecisions[0].employeeType,
      };
    }
  }
  stopwatch = true;
});
</script>

<style scoped>

</style>