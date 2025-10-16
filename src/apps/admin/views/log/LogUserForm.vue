<template>
  <Dialog
    v-if='log'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("admin.log.header")'
    @hide='emits("hide-dialog")'>

    <div class='field flex form grid justify-content-center'>
      <div class='col field'>
        <label
          v-required>{{ t('common.startDate') }}</label>
        <Calendar
          v-model='startDate'
          :manual-input='false'
          show-icon/>
      </div>
      <div class='col field'>
        <label
          v-required>{{ t('common.endDate') }}</label>
        <Calendar
          v-model='endDate'
          :manual-input='false'
          show-icon/>
      </div>
    </div>
    <br>
    <div class='field flex justify-content-center'>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        text
        @click='emits("hide-dialog")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.delete")'
        text
        @click='deleteLog'/>
    </div>

  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import Calendar from 'primevue/calendar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteLogByDateRageGraphql } from '@/apps/admin/api/graphql/log-user-graphql-api';
import type { LogAction } from '@/apps/admin/model/log';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

interface logUserFormProps {
  visibleDialog: boolean,
  item: LogAction
}

const props = withDefaults(defineProps<logUserFormProps>(), {
  visibleDialog: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n() || {};
let { moment } = useMoment();
const log = ref(props.item);
const visible = ref(props.visibleDialog);
const startDate = ref();
const endDate = ref();

const validateRules = {
  startDate: { required: helpers.withMessage(t('admin.log.startDateEmpty'), required) },
  endDate: { required: helpers.withMessage(t('admin.log.endDateEmpty'), required) },
};
const v$ = useVuelidate(validateRules, {
  startDate,
  endDate
});
const {
  mutate: deleteLogByDateRageMutate,
  onDone: deleteLogByDateRageDone,
  onError: deleteLogByDateRageError
} = deleteLogByDateRageGraphql();

function deleteLog() {
  const startDateFormatted = moment(startDate.value).format('YYYY-MM-DD');
  const endDateFormatted = moment(endDate.value).format('YYYY-MM-DD');
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      deleteLogByDateRageMutate({
        startDate: startDateFormatted,
        endDate: endDateFormatted
      });
    }
  }).catch((error) => {
    toastError(error);
  });
}

deleteLogByDateRageDone(() => {
  toastSuccess({ message: t('common.result.message.deleteLog') });
  emits('reload');
  emits('hide-dialog');
});

deleteLogByDateRageError((error) => {
  toastError(error);
});
</script>

<script lang='ts'>
export default { name: 'LogUserForm' };
</script>

<style scoped>

</style>
