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
            {{ t(`hrm.evaluate.${model?.id ? 'titleUpdate' : 'titleCreate'}`) }}
          </div>
        </div>

        <Button
          icon='pi pi-save'
          :label='t("common.save")'
          @click='save'/>
      </div>
    </template>
    <HrmEvaluateForm
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

import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { scrollToError } from '@/common/helpers/errorHelper';

import { saveEvaluateEmployeeReport } from '../../api/graphql/evaluate';
import type { Evaluate } from '../../model/evaluate';
import HrmEvaluateForm from './form/HrmEvaluateForm.vue';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const isOpening = inject('isOpening', ref(true));
const model = defineModel({
  type: Object as PropType<Evaluate>,
  default: {} as Evaluate, 
});
const v$: Ref<Validation> = useVuelidate();
const formRef = ref<InstanceType<typeof HrmEvaluateForm>>();
const isRefresh = inject('isRefresh', ref(0));
const resetData = inject('resetData', () => void {});
const handleViewDetail = inject('handleViewDetail') as (id: string) => void;
const { mutate } = saveEvaluateEmployeeReport();
async function save() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    scrollToError();
    return;
  }
  if (formRef.value) {
    const evaluate = await formRef.value.submitForm();
    const payload = {
      ...omit(evaluate, ['evaluateStatus', 'createdBy', 'createdTime']),
      monthReport: moment(evaluate.monthReport).format(DateTimeFormat.ISO_LOCAL_DATE),
      createReportDate: moment(evaluate.createReportDate).format(DateTimeFormat.ISO_LOCAL_DATE_TIME)
    };
    mutate({ saveEvaluateEmployeeReportInput: payload, }).then(() => {
      toastSuccess();
      isOpening.value = false;
      visible.value = false;
      isRefresh.value++;
      if (model.value?.id) {
        handleViewDetail(model.value.id);
      }
      resetData();
    }).catch((handleError) => {
      if(handleError.graphQLErrors[0].extensions.errorCode == 'EvaluateReportExistsInThisMonth'){
        toastError({ message: t('Báo cáo tháng này đã tồn tại, không thể tạo thêm.') });
      } else if(handleError.graphQLErrors[0].extensions.errorCode == 'EvaluateEmployeeJobPositionCodeRequired'){
        toastError({ message: t('Vui lòng nhập chức vụ của cán bộ.') });
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
