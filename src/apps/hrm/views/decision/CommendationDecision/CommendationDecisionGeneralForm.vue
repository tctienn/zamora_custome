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
      label='Lý do'
      name='reason'
      option-label='name'
      option-value='code'
      :options='reasons'/>

    <!--    <div class='align-content-center col-6'>-->
    <!--      <div class='flex gap-8 pt-2'>-->
    <!--        <div class='flex'>-->
    <!--          <RadioButton-->
    <!--            v-model='model.commendationObject'-->
    <!--            input-id='radiobutton1'-->
    <!--            name='commendationObject'-->
    <!--            value='EMPLOYEE'/>-->
    <!--          <label-->
    <!--            class='ml-2'-->
    <!--            for='radiobutton1'>Khen thưởng cá nhân</label>-->
    <!--        </div>-->
    <!--        <div class='flex'>-->
    <!--          <RadioButton-->
    <!--            v-model='model.commendationObject'-->
    <!--            input-id='radiobutton2'-->
    <!--            name='commendationObject'-->
    <!--            value='ORGANIZATION'/>-->
    <!--          <label-->
    <!--            class='ml-2'-->
    <!--            for='radiobutton2'>Khen thưởng tập thể</label>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
    <FormMultiSelectUser
      v-model='model.employeeIds'
      v-model:list-user='users'
      class='col-6 p-component'
      label='Khen thưởng cá nhân'
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
      label='Khen thưởng phòng ban'
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

    <input
      v-model='model.signerName'
      hidden
      name='signerName'>

    <FormInputDropdown
      v-model='model.form'
      class='col-6'
      label='Hình thức'
      name='form'
      option-label='name'
      option-value='code'
      :options='formRewards'/>

    <FormInputNumber
      v-model='model.reward'
      class='col-3'
      label='Số tiền thưởng'
      name='reward'/>

    <FormInputDropdown
      v-model='model.typePayment'
      class='col-3'
      label='Kiểu thanh toán'
      name='typePayment'
      option-label='name'
      option-value='code'
      :options='paymentType'/>

    <FormInputDropdown
      v-model='model.title'
      class='col-6'
      label='Danh hiệu'
      name='title'
      option-label='name'
      option-value='code'
      :options='titles'/>

    <FormInputCheckbox
      v-model='model.template2c'
      class='col-6'
      label='Hiển thị trong mẫu 2C'
      name='template2c'/>

    <div class='col-12 pt-3'>
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
const { onResult: reasonResult } = getAllByReasonType('REASON_REWARD');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');
const { onResult: hornorTitleResult } = getAllCategory(userDeptRole.value, 'HONOR_TITLE');
const { onResult: formRewardResult } = getAllCategory(userDeptRole.value, 'FORM_REWARD');
const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  decisionType: 'COMMENDATION',
  reward: 0,
  typePayment: 'CASH',
  template2c: true
});
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref([]);
const newPositions = ref([]);
const users = ref([]);
const leaderUsers = ref<any[]>([]);
const titles = ref<{ code: string, name: string }[]>([]);
const formRewards = ref<{ code: string, name: string }[]>([]);
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
  // employeeOrganizationIds: {
  //   required: helpers.withMessage(t('common.validate.required', { item: 'Đối tượng được khen thưởng' }), required),
  //   $autoDirty: true
  // }
};

const v$: Ref<Validation> = useVuelidate(rules, model);

const paymentType = [
  {
    name: 'Tiền mặt',
    code: 'CASH'
  },
  {
    name: 'Chuyển khoản',
    code: 'TRANSFER'
  }
];

function changeLeader(event: any) {
  model.signerName = leaderUsers.value.find((leader: any) => leader.id == event.value)?.username;
}

function changeDecisionMakingLevel(event: any) {
  model.decisionMakingLevelName = decisionMakingLevels.value.find((lv: any) => lv.code == event.value)?.name;
}

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
  if (titles.value.length > 0) {
    model.title = titles.value?.[0]?.code ?? null;
  }
});

formRewardResult((res) => {
  formRewards.value = res.data.getAllCategory;
  if (formRewards.value.length > 0) {
    model.form = formRewards.value?.[0]?.code ?? null;
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

// watch(() => model.commendationObject, () => {
//   if (isInitialized.value == true) {
//     model.employeeOrganizationIds = [];
//   }
//   isInitialized.value = true;
// });
</script>

<style scoped>

</style>