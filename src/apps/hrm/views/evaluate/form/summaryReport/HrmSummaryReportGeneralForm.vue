<template>
  <div class='formgrid grid'>
    <FormTreeSelect
      v-model='model.organizationCreateId'
      class='col-12'
      disabled
      :expanded-level='1'
      :label="t('hrm.evaluate.general.reportOfOrganizationId')"
      name='organizationCreateId'
      option-value='key'
      :options='organizations'/>
    <FormInputDropdown
      v-model='model.evaluateSummaryReportId'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "evaluateSummaryReportId")?.$message?.toString()'
      :label="t('hrm.evaluate.general.evaluateSummaryReportId')"
      name='recruitmentProposalId'
      option-label='summaryReportName'
      option-value='id'
      :options='avaluateSummaryReports'
      required
      @update:model-value='onSelectSummaryReport'/>
    <div
      class='col-12 field'>
      <label
        v-required
        for='flow'>{{ t('work-flow.process.flow') }}</label>
      <div class='flex w-full'>
        <SelectFlowExisted
          v-model='model.flowId'
          :options='flows'/>
      </div>
      <ValidateErrorMessage :errors='v$.flowId.$errors'/>
    </div>
    <FormInputText
      v-model='model.evaluateSummaryReportName'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "evaluateSummaryReportName")?.$message?.toString()'
      :label="t('hrm.evaluate.general.evaluateName')"
      name='evaluateSummaryReportName'
      required/>
    <FormInputCalendar
      v-model='model.monthReport'
      class='col-12'
      date-format='mm/yy'
      :error='v$?.$errors?.find((error) => error.$property === "monthReport")?.$message?.toString()'
      input-format='MM/YYYY'
      :label="t('hrm.evaluate.general.monthReport')"
      name='monthReport'
      required
      view='month'/>
    <FormAutoComplete
      v-model='model.reportPlace'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "reportPlace")?.$message?.toString()'
      :label="t('hrm.evaluate.general.reportPlace')"
      name='workingHoursPerWeek'
      :suggestions='citySuggestions'
      @complete='getCitySuggestions'/>
    <FormInputCalendar
      v-model='model.createReportDate'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "toTime")?.$message?.toString()'
      :label="t('hrm.evaluate.general.createReportDate')"
      name='toTime'/>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import SelectFlowExisted from '@/apps/document/views/doc/doc-out/component/flow/SelectFlowExisted.vue';
import { getEvaluateSummaryReports } from '@/apps/hrm/api/graphql/evaluate';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import type { EmployeeSummary } from '@/apps/hrm/model/employee';
import type { SummaryReport } from '@/apps/hrm/model/evaluate';
import { flowsByType } from '@/apps/work-flow/api/graphql/flow-api';
import { FlowTypePredefined } from '@/apps/work-flow/components/start-flow';
const employeeInfo = inject('employeeInfo', ref({} as EmployeeSummary));

const { t } = useI18n();
const modelValue = defineModel({
  type: Object as PropType<SummaryReport>,
  default: {} as SummaryReport,
});

const {
  result,
  load: loadFlows,
  refetch,
  variables
} = flowsByType();
const model = reactive(correctModel(modelValue.value));
const flows = computed(() => result.value?.flowsByType || []);
modelValue.value = clone(model);
watch(modelValue, (value) => {
  Object.assign(model, clone(value));
}, { deep: true });

watch(model, (newVal) => {
  modelValue.value = clone(newVal);
}, { deep: true });

function correctModel(value: SummaryReport) {
  const summaryReport = clone(value);
  if (!summaryReport.organizationCreateId && employeeInfo.value && employeeInfo.value?.organizationId) {
    summaryReport.organizationCreateId = employeeInfo.value?.organizationId;
    summaryReport.organizationCreateName = employeeInfo.value?.organizationName || ''; 
  }

  if (!summaryReport.createReportDate) {
    summaryReport.createReportDate = new Date();
  }

  if (!summaryReport.monthReport) {
    summaryReport.monthReport = new Date();
  }

  if (!summaryReport.reportPlace) {
    summaryReport.reportPlace = 'Hà Nội';
  }
  return summaryReport;
};

const rules = {
  evaluateSummaryReportName: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.evaluateName') }), required),
    $autoDirty: true,
  },
  evaluateSummaryReportId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.evaluateSummaryReportId') }), required),
    $autoDirty: true,
  },
  flowId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('work-flow.process.flow') }), required),
    $autoDirty: true,
  },
  organizationCreateId: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.reportOfOrganizationId') }), required),
    $autoDirty: true
  },
  monthReport: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.monthReport') }), required),
    $autoDirty: true
  },
  reportPlace: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.reportPlace') }), required),
    $autoDirty: true
  },
  createReportDate: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.createReportDate') }), required),
    $autoDirty: true
  },
};
const v$: Ref<Validation> = useVuelidate(rules, model);
const organizations = ref<TreeNode[]>([]);
const avaluateSummaryReports = ref<{id: string;summaryReportName: string }[]>([]);
const citySuggestions = ref<string[]>([]);

const onSelectSummaryReport = (newId: string) => {
  const selected = avaluateSummaryReports.value.find(({ id }: {id: string}) => id === newId);
  model.evaluateSummaryReportName = selected ? selected.summaryReportName : '';
};

function getCitySuggestions(event: AutoCompleteCompleteEvent) {
  const query = event.query.trim().toLowerCase();
  if (!query.length) {
    citySuggestions.value = [...cities];
  } else {
    citySuggestions.value = cities.filter(c =>
      c.toLowerCase().includes(query)
    );
  }
}
onMounted(() => {
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
  getEvaluateSummaryReports().onResult((res)=>{
    avaluateSummaryReports.value = res.data?.getEvaluateSummaryReports || [];
  });
  variables.value = { type: FlowTypePredefined.HRM_EVALUATE_REPORT };
  loadFlows() || refetch();
});

const cities = [
  'Hà Nội',
  'Đà Nẵng',
  'Thành phố Hồ Chí Minh',
  'Hải Phòng',
  'Cần Thơ',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
  'Vũng Tàu',
  'Quy Nhơn',
  'Buôn Ma Thuột',
  'Thanh Hóa',
  'Ninh Bình',
  'Nam Định',
  'Vinh',
  'Hạ Long',
  'Thái Nguyên',
  'Lạng Sơn',
  'Lào Cai',
  'Pleiku',
  'Rạch Giá',
  'Sóc Trăng',
  'Cà Mau',
  'Phan Thiết'
];

</script>

<style scoped>

</style>
