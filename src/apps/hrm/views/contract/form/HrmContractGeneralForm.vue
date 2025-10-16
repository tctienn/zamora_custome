<template>
  <div class='formgrid grid'>
    <div class='col-6'>
      <label
        class='flex mb-2'
        for='employeeId'>{{ t('hrm.contract.general.employee') }}</label>
      <Dropdown
        v-model='model.employeeId'
        class='w-full'
        :filter='true'
        :invalid='!!v$?.$errors?.find((error) => error.$property === "employeeId")?.$message?.toString()'
        name='employeeId'
        option-label='fullName'
        option-value='id'
        :options='employees'
        panel-class='custom-dropdown'
        placeholder='Chọn nhân sự'
        required>
        <template #option='slotProps'>
          <div class='align-items-center flex gap-2'>
            <AppAvatar
              :avatar='generateAvatarUrl(slotProps.option.avatar)'
              shape='square'
              size='2.5'/>
            <div>
              <p class='font-semibold mb-0'>{{ slotProps.option.fullName }}</p>
              <div
                v-if='slotProps.option.jobTitleName'
                class='flex'>
                <p class='mb-0 text-700 text-base'>{{ slotProps.option.jobTitleName }}</p>
                <p class='border-l-2 mb-0 ml-2 text-700 text-base'>| {{ slotProps.option.organizationName }}
                </p>
              </div>
            </div>

          </div>
        </template>
      </Dropdown>
      <input
        v-model='model.employeeId'
        hidden=''
        name='employeeId'/>
    </div>

    <!--    <FormInputDropdown-->
    <!--      v-model='model.employeeId'-->
    <!--      class='col-6'-->
    <!--      :error='v$?.$errors?.find((error) => error.$property === "employeeId")?.$message?.toString()'-->
    <!--      :label="t('hrm.contract.general.employee')"-->
    <!--      name='employeeId'-->
    <!--      option-label='fullName'-->
    <!--      option-value='id'-->
    <!--      :options='employees'-->
    <!--      required/>-->
    <FormInputDropdown
      v-model='model.workType'
      class='col-6'
      :label="t('hrm.contract.general.workType')"
      name='workType'
      :options='workTypes'/>
    <FormInputText
      v-model='model.code'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "code")?.$message?.toString()'
      :label="t('hrm.contract.general.code')"
      name='code'
      required/>
    <FormInputDropdown
      v-model='model.workLocation'
      class='col-6'
      :label="t('hrm.contract.general.workLocation')"
      name='workLocation'
      :options='workLocations'/>
    <FormInputDropdown
      v-model='model.type'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "type")?.$message?.toString()'
      :label="t('hrm.contract.general.type')"
      name='type'
      :options='types'
      required/>
    <FormInputCalendar
      v-model='model.effectiveDate'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "effectiveDate")?.$message?.toString()'
      :label="t('hrm.contract.general.effectiveDate')"
      name='effectiveDate'
      required/>
    <FormInputCalendar
      v-model='model.expiryDate'
      class='col-3'
      :label="t('hrm.contract.general.expiryDate')"
      name='expiryDate'/>
    <FormTreeSelect
      v-model='model.organization'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "organization")?.$message?.toString()'
      :expanded-level='1'
      :label="t('hrm.contract.general.organization')"
      name='organization'
      option-value='key'
      :options='organizations'
      required/>
    <FormAutoComplete
      v-model='model.workingHoursPerWeek'
      class='col-3'
      :input-props='{
        type: "number",
      }'
      :label="t('hrm.contract.general.workingHoursPerWeek')"
      name='workingHoursPerWeek'
      :suggestions='hoursSuggestions'
      @complete='getHoursSuggestions'/>
    <FormInputDropdown
      v-model='model.employeeType'
      class='col-3'
      :label="t('hrm.contract.general.employeeType')"
      name='employeeType'
      :options='employeeTypes'/>
    <FormInputDropdown
      v-model='model.jobTitle'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "jobTitle")?.$message?.toString()'
      :label="t('hrm.contract.general.jobTitle')"
      name='jobTitle'
      option-label='value'
      option-value='id'
      :options='jobTitles'
      required/>
    <input
      v-model='model.jobTitleName'
      hidden=''
      name='jobTitleName'/>
    <FormInputDropdown
      v-model='model.employeeRank'
      class='col-3'
      :label="t('hrm.contract.general.employeeRank')"
      name='employeeRank'
      :options='employeeRanks'/>
    <FormInputCalendar
      v-model='model.signedDate'
      class='col-3'
      :label="t('hrm.contract.general.signedDate')"
      name='signedDate'/>
    <FormInputDropdown
      v-model='model.position'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "position")?.$message?.toString()'
      :label="t('hrm.contract.general.position')"
      name='position'
      option-label='value'
      option-value='id'
      :options='positions'
      required/>
    <input
      v-model='model.positionName'
      hidden=''
      name='positionName'/>
    <FormInputDropdown
      v-model='model.managerId'
      class='col-6'
      editable
      :label="t('hrm.contract.general.manager')"
      name='managerId'
      option-label='fullName'
      option-value='id'
      :options='allUsers'/>
    <FormInputDropdown
      v-model='model.rank'
      class='col-6'
      :label="t('hrm.contract.general.rank')"
      name='rank'
      :options='ranks'/>
    <FormInputText
      v-model='model.signatory'
      class='col-6'
      :label="t('hrm.contract.general.signatory')"
      name='signatory'/>
    <FormInputCheckbox
      v-model='model.haveInsurance'
      class='col-3 mb-2'
      :label='t("hrm.contract.general.haveInsurance")'
      name='haveInsurance'/>

    <div class='col-3 flex gap-2'>
      <div class='align-items-center flex'>
        <RadioButton
          v-model='model.isContractConcurrent'
          input-id='mainJob'
          name='isContractConcurrent'
          :value='false'/>
        <label
          class='ml-2'
          for='mainJob'>{{ t('hrm.contract.general.mainJob') }}</label>
      </div>
    </div>

    <FormInputText
      v-model='model.professionalWork'
      class='col-6'
      :label="t('hrm.contract.general.professionalWork')"
      name='professionalWork'/>

    <FormInputTextArea
      v-model='model.workDescription'
      class='col-12'
      :label="t('hrm.contract.general.workDescription')"
      name='workDescription'/>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, reactive, type Ref, ref, toRefs, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import {
  convertToOrganizationTreeNodes,
  fetchCategoryMappingName,
  fetchCategoryMappingNameWithId
} from '@/apps/hrm/helpers/utils';
import type { Contract } from '@/apps/hrm/model/contract';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const { moment } = useMoment();
const modelValue = defineModel({
  type: Object as PropType<Contract>,
  default: {} as Contract
});

const model = reactive(correctModel(modelValue.value));

watch(modelValue, (value) => {
  Object.assign(model, correctModel(value));
}, { immediate: true });

function correctModel(value: Contract) {
  const contract = clone(value);
  if (!contract.isContractConcurrent) {
    contract.isContractConcurrent = false;
  }
  Object.keys(value).forEach((key) => {
    const element = value[key as keyof Contract];
    if (['day', 'Day', 'date', 'Date'].some((keyword) => key.includes(keyword)) && element) {
      Object.assign(contract, { [key]: moment(element as string).toDate() });
    }
  });
  return contract;
}

const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);

const rules = {
  employeeId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.employee') }), required),
    $autoDirty: true,
  },
  code: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.code') }), required),
    $autoDirty: true
  },
  effectiveDate: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.effectiveDate') }), required),
    $autoDirty: true
  },
  type: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.type') }), required),
    $autoDirty: true
  },
  organization: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.organization') }), required),
    $autoDirty: true
  },
  jobTitle: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.jobTitle') }), required),
    $autoDirty: true
  },
  position: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.contract.general.position') }), required),
    $autoDirty: true
  },
};
const v$: Ref<Validation> = useVuelidate(rules, model);

const employees = ref([]);
const workTypes = ref([]);
const workLocations = ref([]);
const types = ref([]);
const employeeTypes = ref([]);
const jobTitles = ref([]);
const employeeRanks = ref([]);
const positions = ref([]);
const organizations = ref<TreeNode[]>([]);
const ranks = ref([]);
const hoursPerWeek = [40, 44, 48];
const hoursSuggestions = ref<number[]>();

function getHoursSuggestions(event: AutoCompleteCompleteEvent) {
  hoursSuggestions.value = hoursPerWeek.filter((hour) => hour.toString().includes(event.query));
}

watchEffect(() => {
  if (model.position) {
    const foundPosition = positions.value.find((pos: any) => pos.id === model.position) as any;
    model.positionName = foundPosition ? foundPosition.value : '';
  }
  if (model.jobTitle) {
    const foundjobTitle = jobTitles.value.find((job: any) => job.id === model.jobTitle) as any;
    model.jobTitleName = foundjobTitle ? foundjobTitle.value : '';
  }
});

onMounted(() => {
  findAllEmployees('').onResult((result) => {
    employees.value = result.data?.findAllEmployees || [];
  });

  fetchCategoryMappingName(CATEGORY_TYPE.WORK_TYPE, workTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.WORK_LOCATION, workLocations);
  fetchCategoryMappingName(CATEGORY_TYPE.CONTRACT_TYPE, types);
  fetchCategoryMappingName(CATEGORY_TYPE.EMPLOYEE_TYPE, employeeTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.PERSONNEL_LEVEL, employeeRanks);
  // fetchCategoryMappingName(CATEGORY_TYPE.JOB_POSITION, positions);
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, positions, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_TITLE, jobTitles, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingName(CATEGORY_TYPE.LEVEL, ranks);

  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
  store.fetchAllUsers();
});
</script>

<style scoped>

</style>
