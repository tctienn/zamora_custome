<template>
  <div>
    <div
      v-if='!canSkip'
      class='field flex'>
      <div class='flex flex-column gap-2 w-6'>
        <label class='font-semibold'>
          {{ t('document.doc.deadline') }} (đến ngày)
        </label>
        <div>
          <Calendar
            v-model='dataNode.deadline'
            date-format='dd/mm/yy'
            show-icon>
          </Calendar>
          <ValidateErrorMessage :errors='v$.deadline.$errors'/>
        </div>
      </div>
      <div class='flex flex-column gap-2 w-6'>
        <label class='font-semibold'>
          {{ t('document.doc.deadline') }} ({{ t('document.doc.deadlineNumber') }})
        </label>
        <div>
          <InputNumber v-model='dataNode.deadlineNumber'>
          </InputNumber>
          <ValidateErrorMessage :errors='v$.deadlineNumber.$errors'/>
        </div>
      </div>
    </div>
    <TabView>
      <TabPanel :header='t("document.flowAction.note")'>
        <Textarea
          id='description'
          v-model='dataNode.note'
          auto-resize
          class='w-full'
          rows='5'/>
      </TabPanel>
      <TabPanel :header='t("document.flowAction.fileAttachment")'>
        <UploadFilesGridV2
          v-model:file-list='dataNode.fileList'
          v-model:files-deleted='listFileDelete'
          v-model:list-file='dataNode.attachments'
          :file-attachments-name="'attachmentModel'"
          :header="t('document.flowAction.listFile')"/>
      </TabPanel>
    </TabView>
  </div>

</template>

<script lang='ts' setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { computed, inject, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocIn, DocInInput } from '@/apps/document/model/doc/doc-in';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
import type { DataNextAction } from '@/apps/document/views/doc/component/user-select-next/process-data';
import UploadFilesGridV2 from '@/common/components/custom/UploadFilesGridV2.vue';
import { daysBetweenDates, normalizeDate } from '@/common/helpers/time-util';

defineProps({
  canSkip: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const dataNode = defineModel<DataNextAction>({
  default: {
    dataNodeMap: {},
    attachments: []
  }
});

const listFileDelete = ref<string[]>([]);
const doc = inject('doc', toRef({} as DocOutInput | DocOut | DocInInput | DocIn));
const deadlineDateComputed = computed<Date | undefined>(() => {
  const deadline = doc?.value?.deadlineDate;

  if (!deadline) {
    return undefined;
  }

  if (deadline instanceof Date) {
    return deadline;
  }

  const parsedDate = new Date(deadline);
  return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
});
const validateRules = {
  deadline: {
    checkBeforeEndDeadline: helpers.withMessage(t('document.common.error.deadlineAfterEndDeadline'), (value: Date | undefined) => {
      return value == undefined || !deadlineDateComputed.value || value <= deadlineDateComputed.value;
    }),
    checkAfterNow: helpers.withMessage(t('document.common.error.deadlineBeforeNow'), (value: Date | undefined) => {
      return value == undefined || normalizeDate(value) >= normalizeDate(new Date());
    }),
  },
  deadlineNumber: { required: helpers.withMessage(t('document.common.error.deadlineNumber'), (value: number | undefined) => !value || value > 0) }
};
const v$ = useVuelidate(validateRules, {
  deadline: dataNode.value.deadline,
  deadlineNumber: dataNode.value.deadlineNumber
});

watch(() => deadlineDateComputed.value, value => {
  dataNode.value.deadline = value || undefined;
}, { immediate: true });
watch([() => doc?.value?.deadlineNumber, () => dataNode.value.deadline], ([newDeadlineNumber, newDeadline]) => {
  dataNode.value.deadlineNumber = newDeadlineNumber || (newDeadline ? daysBetweenDates(new Date(), newDeadline) : undefined);
}, { immediate: true });
</script>

<style scoped>

</style>