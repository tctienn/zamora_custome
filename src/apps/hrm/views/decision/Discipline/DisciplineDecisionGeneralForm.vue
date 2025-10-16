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

    <FormInputText
      v-model='model.placeOfDecision'
      class='col-3'
      label='Nơi lập quyết định'
      name='placeOfDecision'/>

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

    <FormInputDropdown
      v-model='model.reason'
      class='col-6'
      label='Lý do kỷ luật'
      name='reason'
      option-label='name'
      option-value='code'
      :options='reasons'/>

    <input
      v-model='model.signerName'
      hidden
      name='signerName'>

    <FormMultiSelectUser
      v-model='model.employeeIds'
      v-model:list-user='users'
      class='col-6 p-component'
      label='Cá nhân kỷ luật'
      name='employeeIds'
      option-label='fullName'
      option-value='id'
      :options='users'
      required
      :show-button-add='false'
      type-dropdown='Organization'/>

    <FormMultiSelectOrganization
      v-model='model.organizationIds'
      class='col-6 p-component'
      label='Phòng ban kỷ luật'
      name='organizationIds'
      :org-type='OrganizationType.ADMINISTRATIVE'
      required
      :selection-mode="'multiple'"/>

    <FormInputDropdown
      v-model='model.signerId'
      class='col-6'
      label='Người ký'
      name='signerId'
      option-label='info'
      option-value='id'
      :options='leaderUsers'
      @change='changeLeader($event)'/>

    <FormInputDropdown
      v-model='model.form'
      class='col-6'
      label='Hình thức kỷ luật'
      name='form'
      option-label='name'
      option-value='code'
      :options='forms'/>

    <FormInputNumber
      v-model='model.compensationAmount'
      class='col-3'
      label='Mức bồi hoàn'
      name='compensationAmount'/>

    <FormInputDropdown
      v-model='model.typeExecution'
      class='col-3'
      label='Hình thức thực thi'
      name='typeExecution'
      option-label='name'
      option-value='code'
      :options='paymentType'/>

    <FormInputCheckbox
      v-model='model.template2c'
      class='col-6 mb-4 mt-2'
      label='Hiển thị trong mẫu 2C'
      name='template2c'/>
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
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllByReasonType, getAllCategory } from '@/apps/hrm/api/graphql/category';
import { getAllEmployeeInfo } from '@/apps/hrm/api/graphql/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import FormMultiSelectOrganization from '@/apps/hrm/components/form/FormMultiSelectOrganization.vue';
import FormMultiSelectUser from '@/apps/hrm/components/form/FormMultiSelectUser.vue';
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
const { onResult: reasonResult } = getAllByReasonType('REASON_DISCIPLINE');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');
const { onResult: hornorTitleResult } = getAllCategory(userDeptRole.value, 'HONOR_TITLE');
const { onResult: disciplinaryFormResult } = getAllCategory(userDeptRole.value, 'DISCIPLINARY_FORM');
const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  decisionType: 'DISCIPLINE',
  typeExecution: 'REFUNDED',
  template2c: true,
  compensationAmount: 0
});
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref([]);
const newPositions = ref([]);
const users = ref([]);
const leaderUsers = ref<any[]>([]);
const titles = ref([]);
const forms = ref<{ name: string, code: string }[]>([]);
const organizations = ref<TreeNode[]>([]);
watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      Object.assign(model, correctModel(newValue));
    }
  }
);

function changeLeader(event: any) {
  model.signerName = leaderUsers.value.find((leader: any) => leader.id == event.value)?.username;
}

function changeDecisionMakingLevel(event: any) {
  model.decisionMakingLevelName = decisionMakingLevels.value.find((lv: any) => lv.code == event.value)?.name;
}

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
  // employeeOrganizationIds: {
  //   required: helpers.withMessage(t('common.validate.required', { item: 'Đối tượng được khen thưởng' }), required),
  //   $autoDirty: true
  // }
};

const v$: Ref<Validation> = useVuelidate(rules, model);

const paymentType = [
  {
    name: 'Đã bồi hoàn',
    code: 'REFUNDED'
  },
  {
    name: 'Trừ vào lương',
    code: 'DEDUCTED_SALARY'
  }
];

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

hornorTitleResult((res) => {
  titles.value = res.data.getAllCategory;
});

disciplinaryFormResult((res) => {
  forms.value = res.data.getAllCategory;
  if (forms.value.length > 0) {
    model.form = forms.value?.[0]?.code ?? null;
  }
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
        newPositionName: value.employeeDecisions[0].newPositionName
      };
    }
  }
  stopwatch = true;
});

</script>

<style scoped>

</style>