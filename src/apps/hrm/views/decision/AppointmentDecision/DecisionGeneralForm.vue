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
      v-model='model.reason'
      class='col-6'
      label='Lý do bổ nhiệm'
      name='reason'
      option-label='name'
      option-value='code'
      :options='reasons'/>

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
      v-model='model.oldTitleName'
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

    <FormInputText
      v-model='model.oldPositionName'
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
      v-model='model.employeeType'
      class='col-6'
      label='Loại nhân viên'
      name='employees[0].employeeType'/>

    <!--    <input-->
    <!--      v-model='model.employeeType'-->
    <!--      hidden-->
    <!--      name='employees[0].employeeType'>-->

    <FormInputText
      v-model='model.professionalWork'
      class='col-6'
      label='Công việc chuyên môn'
      name='employees[0].professionalWork'/>

    <!--    <input-->
    <!--      v-model='model.professionalWork'-->
    <!--      hidden-->
    <!--      name='employees[0].professionalWork'>-->

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

    <div class='col-6'>
      <label>Điều chỉnh chế độ</label>
      <div class='flex gap-8 pt-2'>
        <div class='flex'>
          <RadioButton
            v-model='model.welfareAdjustment'
            input-id='radiobutton1'
            name='welfareAdjustment'
            :value='false'/>
          <label
            class='ml-2'
            for='radiobutton1'>Không</label>
        </div>
        <div class='flex'>
          <RadioButton
            v-model='model.welfareAdjustment'
            input-id='radiobutton2'
            name='welfareAdjustment'
            :value='true'/>
          <label
            class='ml-2'
            for='radiobutton2'>Có</label>
        </div>
      </div>
    </div>
    <div class='col-6 flex gap-2 mb-4'>
      <div class='align-items-center flex'>
        <RadioButton
          v-model='model.isConcurrent'
          input-id='mainJob'
          name='employees[0].isConcurrent'
          :value='false'/>
        <label
          class='ml-2'
          for='mainJob'>{{ t('hrm.contract.general.mainJob') }}</label>
      </div>
      <div class='align-items-center flex'>
        <RadioButton
          v-model='model.isConcurrent'
          input-id='multiJob'
          name='employees[0].isConcurrent'
          :value='true'/>
        <label
          class='ml-2'
          for='ingredient2'>{{ t('hrm.contract.general.multiJob') }}</label>
      </div>
    </div>

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
import { cloneDeep, isEqual } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { nextTick, onMounted, type PropType, reactive, type Ref, ref, toRaw, watch } from 'vue';
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
import { useHrmDecision } from '@/common/store/decision';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();

const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface
});

const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const { onResult: reasonResult } = getAllByReasonType('REASON_APPOINTMENT');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');

const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  welfareAdjustment: false,
  isConcurrent: false
});

// Refs for data
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref<any[]>([]);
const newPositions = ref<any[]>([]);
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

onMounted(() => {
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
    organizationsFlat.value = res.data?.allOrganizationPublic || [];
  });
});

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

function chooseEmployee(employeeId: any) {
  let user: any = users.value.find((info: any) => info.id == employeeId);
  if (user) {
    model.employeeName = user.fullName;
    model.oldDeptId = user.organizationId;
    model.oldTitleId = user.jobTitle;
    model.oldPositionId = user.position;
    model.oldDeptName = user.organizationName;
    model.oldTitleName = user.jobTitleName;
    model.oldPositionName = user.positionName;
    model.employeeType = user.employeeType;
    model.professionalWork = user.professionalWork;
  } else {
    model.employeeName = '';
    model.oldDeptId = '';
    model.oldTitleId = '';
    model.oldPositionId = '';
    model.oldDeptName = '';
    model.oldTitleName = '';
    model.oldPositionName = '';
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