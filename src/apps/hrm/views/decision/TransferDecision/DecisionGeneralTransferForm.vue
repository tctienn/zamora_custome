<template>
  <div class='formgrid grid w-12'>
    <input
      v-model='model.id'
      hidden
      name='id'/>

    <input
      v-model='model.decisionType'
      hidden
      name='decisionType'/>

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
      label='Lý do điều chuyển'
      name='reason'
      option-label='name'
      option-value='code'
      :options='reasons'/>

    <div
      v-for='(employee, index) in model.employeeDecisions'
      :key='index'
      class='w-full'>
      <div class='flex formgrid grid px-3'>
        <FormInputDropdownUserInfo
          v-model='employee.employeeId'
          class='col-3'
          :error='v$?.$errors?.find((error) => error.$propertyPath === `employeeDecisions.${index}.employeeId`)?.$message?.toString()'
          label='Nhân sự'
          :name='`employees[${index}].employeeId`'
          option-label='fullName'
          option-value='id'
          :options='users'
          required
          :width-option='10'
          @change='chooseEmployee(employee.employeeId, index)'/>

        <input
          v-model='employee.id'
          hidden
          :name='`employees[${index}].id`'>

        <input
          v-model='employee.employeeName'
          hidden
          :name='`employees[${index}].employeeName`'>

        <div class='col-3'>
          <FormTreeSelect
            v-model='employee.oldDeptId'
            disabled
            :expanded-level='1'
            label='Phòng ban cũ'
            :name='`employees[${index}].oldDeptId`'
            option-value='key'
            :options='organizations'/>

          <input
            v-model='employee.oldDeptName'
            hidden
            :name='`employees[${index}].oldDeptName`'>
        </div>

        <div class='col-3'>
          <FormInputText
            v-model='employee.oldTitleName'
            :disabled='true'
            label='Chức danh/Vị trí cũ'/>

          <input
            v-model='employee.oldTitleId'
            hidden
            :name='`employees[${index}].oldTitleId`'>

          <input
            v-model='employee.oldTitleName'
            hidden
            :name='`employees[${index}].oldTitleName`'>
        </div>

        <div class='col-3 flex'>
          <FormInputText
            v-model='employee.oldPositionName'
            :disabled='true'
            label='Chức vụ cũ'/>

          <input
            v-model='employee.oldPositionId'
            hidden
            :name='`employees[${index}].oldPositionId`'>

          <input
            v-model='employee.oldPositionName'
            hidden
            :name='`employees[${index}].oldPositionName`'>

          <div class='align-content-center'>
            <ButtonIcon
              v-tooltip.top='t("common.delete")'
              class='align-self-center text-red-600'
              icon='delete'
              rounded
              text
              @click='deleteEmployee(index)'/>
          </div>
        </div>
      </div>

      <div class='flex formgrid grid px-3'>
        <div class='col-3'>
          <div class='flex flex-column gap-2 pt-2'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='employee.isConcurrent'
                input-id='isConcurrent'
                :name='`employees[${index}].isConcurrent`'
                :value='false'/>
              <label
                class='ml-2'
                for='isConcurrent'>Làm chính</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='employee.isConcurrent'
                input-id='multiJob'
                :name='`employees[${index}].isConcurrent`'
                :value='true'/>
              <label
                class='ml-2'
                for='multiJob'>Kiêm nhiệm</label>
            </div>
          </div>
        </div>

        <FormTreeSelect
          v-model='employee.newDeptId'
          class='col-3'
          :error='v$?.$errors?.find((error) => error.$propertyPath === `employeeDecisions.${index}.newDeptId`)?.$message?.toString()'
          :expanded-level='1'
          label='Phòng ban bổ nhiệm'
          :name='`employees[${index}].newDeptId`'
          option-value='key'
          :options='organizations'
          required
          @change='changeNewDept($event, index)'/>

        <input
          v-model='employee.newDeptName'
          hidden
          :name='`employees[${index}].newDeptName`'>

        <FormInputDropdown
          v-model='employee.newTitleId'
          class='col-3'
          label='Chức danh/Vị trí bổ nhiệm'
          :name='`employees[${index}].newTitleId`'
          option-label='name'
          option-value='code'
          :options='newTitles'
          @change='changeNewTitle($event, index)'/>

        <input
          v-model='employee.newTitleName'
          hidden
          :name='`employees[${index}].newTitleName`'>

        <FormInputDropdown
          v-model='employee.newPositionId'
          class='col-3'
          label='Chức vụ bổ nhiệm'
          :name='`employees[${index}].newPositionId`'
          option-label='name'
          option-value='code'
          :options='newPositions'
          @change='changeNewPosition($event, index)'/>

        <input
          v-model='employee.newPositionName'
          hidden
          :name='`employees[${index}].newPositionName`'>

        <FormInputText
          v-model='employee.employeeType'
          class='col-6'
          :disabled='true'
          label='Loại nhân viên'/>

        <input
          v-model='employee.employeeType'
          hidden
          :name='`employees[${index}].employeeType`'>

        <FormInputText
          v-model='employee.professionalWork'
          class='col-6'
          :disabled='true'
          label='Công việc chuyên môn'/>

        <input
          v-model='employee.professionalWork'
          hidden
          :name='`employees[${index}].professionalWork`'>
      </div>
      <hr/>
    </div>

    <div class='col-12'>
      <ButtonIcon
        v-tooltip.top='t("common.create")'
        class='align-self-center p-1'
        icon='add_circle'
        rounded
        text
        @click='addNewEmployee'/>
    </div>

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
import { computed, nextTick, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
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
import { toastError } from '@/common/helpers/custom-toast-service';
import type { UserInterface } from '@/common/model/User';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const modelValue = defineModel('modelValue', {
  type: Object as PropType<DecisionInterface>,
  default: {} as DecisionInterface
});
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'DECISION_LEVEL');
const { onResult: reasonResult } = getAllByReasonType('REASON_TRANSFER');
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const { onResult: newPositionResult } = getAllCategory(userDeptRole.value, 'JOB_POSITION');

const model = reactive<DecisionInterface>({
  ...correctModel(modelValue.value) as DecisionInterface,
  welfareAdjustment: false,
  decisionType: 'TRANSFER',
  employeeDecisions: correctModel(modelValue.value)?.employeeDecisions ?? [],
});
const decisionMakingLevels = ref<any[]>([]);
const reasons = ref([]);
const newTitles = ref<any[]>([]);
const newPositions = ref<any[]>([]);
const users = ref([]);
const leaderUsers = ref<any[]>([]);
const organizations = ref<TreeNode[]>([]);
const organizationsFlat = ref<any[]>([]);
const isUpdatingFromParent = ref(false);
const isUpdatingFromChild = ref(false);

watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    if (isUpdatingFromChild.value || isEqual(newValue, oldValue)) {
      return;
    }

    isUpdatingFromParent.value = true;

    nextTick(() => {
      Object.assign(model, correctModel(newValue));
      isUpdatingFromParent.value = false;
    });
  },
  { deep: true }
);

const rules = computed(() => {
  return {
    noDecision: {
      required: helpers.withMessage(t('common.validate.required', { item: 'Số quyết định' }), required),
      $autoDirty: true,
    },
    decisionDate: {
      required: helpers.withMessage(t('common.validate.required', { item: 'Ngày quyết định' }), required),
      $autoDirty: true,
    },
    effectStartDate: {
      required: helpers.withMessage(t('common.validate.required', { item: 'Ngày hiệu lực' }), required),
      $autoDirty: true,
    },

    employeeDecisions: model.employeeDecisions.map(() => ({
      employeeId: {
        required: helpers.withMessage(
          t('common.validate.required', { item: 'Nhân sự' }),
          required
        ),
      },
      newDeptId: {
        required: helpers.withMessage(t('common.validate.required', { item: 'Phòng ban bổ nhiệm' }), required),
        $autoDirty: true,
      },
    })),
  };
});

const v$: Ref<Validation> = useVuelidate(rules, model);

function changeNewDept(event: EventListener, index: number) {
  const orgId = Object.keys(event)?.[0] || '';
  const orgName = organizationsFlat.value.find((org: any) => org.id === orgId)?.name;

  if (model.employeeDecisions[index].newDeptName !== orgName) {
    model.employeeDecisions[index] = {
      ...model.employeeDecisions[index],
      newDeptName: orgName
    };
  }
}

function changeLeader(event: any) {
  const signerName = leaderUsers.value.find((leader: any) => leader.id === event.value)?.username;
  if (model.signerName !== signerName) {
    model.signerName = signerName;
  }
}

function changeDecisionMakingLevel(event: any) {
  const levelName = decisionMakingLevels.value.find((lv: any) => lv.code === event.value)?.name;
  if (model.decisionMakingLevelName !== levelName) {
    model.decisionMakingLevelName = levelName;
  }
}

function changeNewPosition(event: any, index: number) {
  const positionName = newPositions.value.find((position: any) => position.code === event.value)?.name;
  if (model.employeeDecisions[index].newPositionName !== positionName) {
    model.employeeDecisions[index] = {
      ...model.employeeDecisions[index],
      newPositionName: positionName
    };
  }
}

function changeNewTitle(event: any, index: number) {
  const titleName = newTitles.value.find((title: any) => title.code === event.value)?.name;
  if (model.employeeDecisions[index].newTitleName !== titleName) {
    model.employeeDecisions[index] = {
      ...model.employeeDecisions[index],
      newTitleName: titleName
    };
  }
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

getAllEmployeeInfo().onResult((res) => {
  const data = res.data.getAllEmployeeInfo || [];
  users.value = data.filter((user: any) => user.status !== 'LEAVE');
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
  if (model.employeeDecisions.length === 0) {
    addNewEmployee();
  }
});

function chooseEmployee(empId: any, index: number) {
  let found = 0;
  model.employeeDecisions.forEach((e) => {
    if (e.employeeId === empId) {
      found++;
    }
  });
  if (found > 1) {
    toastError({ message: 'Nhân viên này bạn đã chọn.' });
    const clearedEmployee = {
      ...model.employeeDecisions[index],
      employeeId: '',
      employeeName: '',
      oldDeptId: '',
      oldTitleId: '',
      oldPositionId: '',
      oldDeptName: '',
      oldTitleName: '',
      oldPositionName: '',
      employeeType: '',
      professionalWork: '',
      newDeptId: '',
      newTitleId: '',
      newPositionId: ''
    };

    if (!isEqual(model.employeeDecisions[index], clearedEmployee)) {
      model.employeeDecisions[index] = clearedEmployee;
    }
    return;
  }
  const user: any = users.value.find((info: any) => info.id === empId);

  if (user) {
    const oldTitle = newTitles.value.find(item => item.name === user.jobTitle);
    const oldPosition = newPositions.value.find(item => item.name === user.position);
    const updatedEmployee = {
      ...model.employeeDecisions[index],
      employeeId: empId,
      employeeName: user.fullName,
      oldDeptId: user.organizationId,
      oldTitleId: oldTitle?.code || '',
      oldPositionId: oldPosition?.code || '',
      oldDeptName: user.organizationName,
      oldTitleName: user?.jobTitleName,
      oldPositionName: user?.positionName,
      employeeType: user.employeeType,
      professionalWork: user.professionalWork
    };

    if (!isEqual(model.employeeDecisions[index], updatedEmployee)) {
      model.employeeDecisions[index] = updatedEmployee;
    }
  } else {
    const clearedEmployee = {
      ...model.employeeDecisions[index],
      employeeId: empId,
      employeeName: '',
      oldDeptId: '',
      oldTitleId: '',
      oldPositionId: '',
      oldDeptName: '',
      oldTitleName: '',
      oldPositionName: '',
      employeeType: '',
      professionalWork: ''
    };

    if (!isEqual(model.employeeDecisions[index], clearedEmployee)) {
      model.employeeDecisions[index] = clearedEmployee;
    }
  }
}

function deleteEmployee(index: number) {
  model.employeeDecisions.splice(index, 1);
}

function addNewEmployee() {
  if (!model.employeeDecisions) {
    model.employeeDecisions = [];
  }

  model.employeeDecisions.push({
    id: '',
    decisionId: '',
    employeeId: '',
    oldDeptId: '',
    oldTitleId: '',
    oldPositionId: '',
    newDeptId: '',
    newTitleId: '',
    newPositionId: '',
    receptionId: '',
    employeeName: '',
    oldDeptName: '',
    oldTitleName: '',
    oldPositionName: '',
    newDeptName: '',
    newTitleName: '',
    newPositionName: '',
    receptionName: '',
    isConcurrent: false,
    employeeType: '',
    professionalWork: '',
  });
}

watch(
  model,
  (newValue) => {
    if (isUpdatingFromParent.value) {
      return;
    }

    isUpdatingFromChild.value = true;

    nextTick(() => {
      modelValue.value = cloneDeep(newValue);
      isUpdatingFromChild.value = false;
    });
  },
  {
    deep: true,
    flush: 'post'
  }
);
</script>

<style scoped>

</style>