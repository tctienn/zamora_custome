<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='model.evaluateName'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "evaluateName")?.$message?.toString()'
      :label="t('hrm.evaluate.general.evaluateName')"
      name='name'
      required/>
    <FormTreeSelect
      v-model='model.reportOfOrganizationId'
      class='col-12'
      :expanded-level='1'
      :label="t('hrm.evaluate.general.reportOfOrganizationId')"
      name='reportOfOrganizationId'
      option-value='key'
      :options='organizations'
      @update:model-value="(vals?: string) => {
        const found = organizationsOption.find(p => p.id === vals)
        model.reportOfOrganizationName = found ? found.name : ''; 
      } "/>
    <FormInputCalendar
      v-model='model.monthReport'
      class='col-12'
      date-format='mm/yy'
      input-format='MM/YYYY'
      :label="t('hrm.evaluate.general.monthReport')"
      name='monthReport'
      view='month'/>
    <FormAutoComplete
      v-model='model.reportPlace'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "reportPlace")?.$message?.toString()'
      :label="t('hrm.evaluate.general.reportPlace')"
      name='workingHoursPerWeek'
      required
      :suggestions='citySuggestions'
      @complete='getCitySuggestions'/>
    <FormInputCalendar
      v-model='model.createReportDate'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "toTime")?.$message?.toString()'
      :label="t('hrm.evaluate.general.createReportDate')"
      name='toTime'
      required/>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { TreeNode } from 'primevue/treenode';
import { inject, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import type { EmployeeSummary } from '@/apps/hrm/model/employee';
import type { Evaluate } from '@/apps/hrm/model/evaluate';

const { t } = useI18n();

const modelValue = defineModel({
  type: Object as PropType<Evaluate>,
  default: {} as Evaluate,
});
const employeeInfo = inject('employeeInfo', ref({} as EmployeeSummary));

const model = reactive(correctModel(modelValue.value));
modelValue.value = clone(model);
watch(modelValue, (value) => {
  Object.assign(model, clone(value));
}, { deep: true });

watch(model, (newVal) => {
  modelValue.value = clone(newVal);
}, { deep: true });

function correctModel(value: Evaluate) {
  const evaluate = clone(value);
  if (!evaluate.reportOfOrganizationId && employeeInfo.value && employeeInfo.value?.organizationId) {
    evaluate.reportOfOrganizationId = employeeInfo.value?.organizationId;
    evaluate.reportOfOrganizationName = employeeInfo.value?.organizationName;
  }
  if (!evaluate.evaluateName) {
    evaluate.evaluateName = 'Bảng tổng hợp đánh giá tình hình thực hiện nhiệm vụ của CBNV';
  }

  if (!evaluate.createReportDate) {
    evaluate.createReportDate = new Date();
  }

  if (!evaluate.monthReport) {
    evaluate.monthReport = new Date();
  }

  if (!evaluate.reportPlace) {
    evaluate.reportPlace = 'Hà Nội';
  }
  return evaluate;
};

const rules = {
  evaluateName: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.evaluate.general.evaluateName') }), required),
    $autoDirty: true,
  },
  reportOfOrganizationId: {
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
const organizationsOption = ref<OrganizationInterface[]>([]);
const citySuggestions = ref<string[]>([]);

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
    organizationsOption.value = res.data?.allOrganizationPublic || [];
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
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
