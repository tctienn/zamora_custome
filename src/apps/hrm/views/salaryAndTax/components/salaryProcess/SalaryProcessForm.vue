<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='id ? t("hrm.salary.updateSalaryProcess") : t("hrm.salary.createSalaryProcess")'
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.createdMonth`)
            }}</label>
            <Calendar
              v-model='date'
              class='w-full'
              date-format='mm/yy'
              view='month'/>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.salaryProcessForm`)
            }}</label>
            <Dropdown
              v-model='salaryProcess.salaryProcessForm'
              class='p-component w-full'
              option-label='label'
              option-value='value'
              :options='salaryProcessForms'>
            </Dropdown>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.salaryScale`)
            }}</label>
            <Dropdown
              v-model='salaryProcess.salaryScale'
              class='p-component w-full'
              :options='scales'>
            </Dropdown>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.salaryLevel`)
            }}</label>
            <InputText
              v-model='salaryProcess.salaryLevel'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='salaryLevel'/>
            <input
              v-model='salaryProcess.salaryLevel'
              hidden
              name='salaryLevel'/>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.salaryCoefficient`)
            }}</label>
            <InputNumber
              v-model='salaryProcess.salaryCoefficient'
              class='w-full'
              input-id='minmaxfraction'
              :max-fraction-digits='2'
              :min-fraction-digits='0'/>
            <input
              v-model='salaryProcess.salaryCoefficient'
              hidden
              name='salaryCoefficient'/>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.contract.salary.coefficientSalary`)
            }}</label>
            <Dropdown
              v-model='salaryProcess.salary'
              class='p-component w-full'
              :options='salaries'>
            </Dropdown>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.regionalMinimumWage`)
            }}</label>
            <InputNumber
              v-model='salaryProcess.regionalMinimumWage'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='salaryProcess.regionalMinimumWage'
              hidden
              name='regionalMinimumWage'/>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.totalSalary`)
            }}</label>
            <InputNumber
              v-model='salaryProcess.totalSalary'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='salaryProcess.totalSalary'
              hidden
              name='totalSalary'/>
          </div>

          <div class='col-12 field'>
            <label>{{ t(`hrm.salary.note`) }}</label>
            <Textarea
              v-model='salaryProcess.note'
              class='w-full'
              cols='30'
              name='note'
              rows='3'/>
          </div>

          <div class='col-6 field'>
            <label>{{
              t(`hrm.salary.expireDate`)
            }}</label>
            <Calendar
              v-model='expireDate'
              class='w-full'
              date-format='dd/mm/yy'/>
          </div>

          <div class='col-8 field'>
            <label>{{ t(`hrm.salary.status`) }}</label>
            <div class='align-items-center flex gap-5 my-3'>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='salaryProcess.status'
                  input-id='ingredient1'
                  name='pizza'
                  :value='true'/>
                <label
                  class='ml-2'
                  for='ingredient1'>{{ t(`hrm.salary.current`) }}</label>
              </div>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='salaryProcess.status'
                  input-id='ingredient2'
                  name='pizza'
                  :value='false'/>
                <label
                  class='ml-2'
                  for='ingredient2'>{{ t(`hrm.salary.expire`) }}</label>
              </div>
            </div>
          </div>
        </div>

        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            icon='pi pi-save'
            :label="t('common.save')"
            @click='submitForm'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getSalaryProcessById, saveSalaryProcess } from '@/apps/hrm/api/graphql/salary';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { type SalaryProcess, SalaryProcessForm } from '@/apps/hrm/model/salary';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  employeeId: {
    type: String,
    default: null,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'refresh']);
const { t } = useI18n();
const { moment } = useMoment();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const salaryProcess = ref<SalaryProcess>({} as SalaryProcess);
const date = ref(new Date());
const expireDate = ref();

if (!props.id) {
  salaryProcess.value.status = true;
  salaryProcess.value.salaryProcessForm = SalaryProcessForm.COEFFICIENT;
} else {
  getSalaryProcessById(props.id).onResult((res) => {
    salaryProcess.value = cloneDeep(res.data.getSalaryProcessById);
    date.value = new Date(salaryProcess.value.createdYear, salaryProcess.value.createdMonth - 1, 1);
    expireDate.value = salaryProcess.value.expireDate && new Date(salaryProcess.value.expireDate);
  });
}

const salaryProcessForms = [
  {
    label: t(`hrm.salary.${SalaryProcessForm.COEFFICIENT.toLowerCase()}`),
    value: SalaryProcessForm.COEFFICIENT
  },
  {
    label: t(`hrm.salary.${SalaryProcessForm.FIXED.toLowerCase()}`),
    value: SalaryProcessForm.FIXED
  },
  {
    label: t(`hrm.salary.${SalaryProcessForm.SCALE.toLowerCase()}`),
    value: SalaryProcessForm.SCALE
  },
];

const {
  mutate,
  onDone
} = saveSalaryProcess();

const submitForm = () => {
  mutate({
    salaryProcess: {
      ...salaryProcess.value,
      employeeId: props.employeeId,
      createdMonth: date.value.getMonth() + 1,
      createdYear: date.value.getFullYear(),
      expireDate: expireDate.value && moment(expireDate.value).format(DateTimeFormat.ISO_LOCAL_DATE)
    }
  });
};

onDone(() => {
  toastSuccess({ message: t('common.saveSuccess') });
  emits('hide-dialog');
});

const scales = ref([]);
const salaries = ref([]);
onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_GRADE, scales);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY, salaries);
});

</script>

<style scoped>

</style>