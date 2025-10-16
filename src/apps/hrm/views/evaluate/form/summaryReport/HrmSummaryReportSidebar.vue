<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 70rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            {{ t(`hrm.evaluate.${model?.id ? 'titleUpdate' : 'titleSummaryReportCreate'}`) }}
          </div>
        </div>

        <Button
          icon='pi pi-save'
          :label='t("common.save")'
          @click='save'/>
      </div>
    </template>
    <HrmSummaryReportForm
      ref='formRef'
      v-model='model'
      class='mt-2'/>
  </Sidebar>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { omit } from 'lodash';
import moment from 'moment';
import { inject, type PropType, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ListOfEvaluateEmployeeReportOnEachOrganization, SummaryReport } from '@/apps/hrm/model/evaluate';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { scrollToError } from '@/common/helpers/errorHelper';

import { saveEvaluateEmployeeSummaryReport } from '../../../../api/graphql/evaluate';
import HrmSummaryReportForm from './HrmSummaryReportForm.vue';
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({
  type: Object as PropType<SummaryReport>,
  default: {} as SummaryReport, 
});
const v$: Ref<Validation> = useVuelidate();
const formRef = ref<InstanceType<typeof HrmSummaryReportForm>>();
const listOrganizationInject = inject<Ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>>('listOrganization',
  ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>([])
);
const isRefresh = inject('isRefresh', ref(0));
const resetData = inject('resetData', () => void {});
const isOpening = inject('isOpening', ref(true));
const { mutate } = saveEvaluateEmployeeSummaryReport();
async function save() {
  v$.value.$touch();
  
  const isValid = await v$.value.$validate();
  if (!isValid) {
    scrollToError();
    return;
  }
  if (formRef.value) {
    const summaryReport = await formRef.value.submitForm();
    const payload = {
      ...omit(summaryReport, ['createdBy', 'createdTime', 'evaluateSummaryReportCode', 'totalOrganization', 'totalEmployee', 'evaluateEmployeeSummaryReportStatus']),
      monthReport: moment(summaryReport.monthReport).format(DateTimeFormat.ISO_LOCAL_DATE),
      createReportDate: moment(summaryReport.createReportDate).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
    };
    mutate({ saveEvaluateEmployeeSummaryReportInput: payload, }).then(() => {
      formRef.value?.submitSign();
      isOpening.value = false;
      toastSuccess();
      visible.value = false;
      isRefresh.value++;
      listOrganizationInject.value = [];
      resetData();
    }).catch((handleError) => {
      if(handleError.graphQLErrors[0].extensions.errorCode == 'EvaluateReportExistsInThisMonth'){
        toastError({ message: t('Báo cáo tháng này đã tồn tại, không thể tạo thêm.') });
      } else{
        toastError();
      }

    });
  }
}

function hideForm() {
  visible.value = false;
  resetData();
}
</script>

<style scoped>

</style>
