<template>
  <Dialog
    v-model:visible='visible'
    :header="'Ngày nghỉ trong tuần'"
    style='width: 45rem'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <div class='flex gap-2 justify-content-center'>
      <div
        v-for='(day, index) in dayOfWeek'
        :key='index'
        class='border-3 border-round cursor-pointer h-4rem w-4rem'
        :class="{
          'border-primary': index < 5,
          'border-orange-500': index >= 5,
          'bg-primary': restDays.includes(day.value) && index < 5,
          'bg-orange-500': restDays.includes(day.value) && index >= 5,
        }"
        @click='toggleRestDay(day.value)'>
        <div
          class='align-items-center flex h-full justify-content-center text-center w-full'>
          <div class='font-bold text-lg'>{{ day.label }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getRestDayInWeek, saveRestDayInWeek } from '@/apps/hrm/api/graphql/rest-day';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const visible = ref(props.visibleDialog);
const { t } = useI18n();

const restDays = ref<string[]>([]);

const toggleRestDay = (day: string) => {
  if (restDays.value.includes(day)) {
    restDays.value = restDays.value.filter((d: string) => d !== day);
  } else {
    restDays.value.push(day);
  }
};

const { onResult } = getRestDayInWeek();
onResult((res) => {
  const data = { ...res.data.getRestDayInWeek };
  restDays.value = [...data.restOnWeek] || [];
});

const {
  mutate: saveRestDayInWeekMutate,
  onDone: saveRestDayInWeekDone
} =
  saveRestDayInWeek();

function submit() {
  saveRestDayInWeekMutate({ restDayInWeek: { restOnWeek: restDays.value } });
}

saveRestDayInWeekDone(() => {
  toastSuccess({ message: t('Lưu thành công ngày nghỉ trong tuần') });
  emits('hide-dialog');
});

const dayOfWeek = [
  {
    label: 'Thứ Hai',
    value: 'MONDAY',
  },
  {
    label: 'Thứ Ba',
    value: 'TUESDAY',
  },
  {
    label: 'Thứ Tư',
    value: 'WEDNESDAY',
  },
  {
    label: 'Thứ Năm',
    value: 'THURSDAY',
  },
  {
    label: 'Thứ Sáu',
    value: 'FRIDAY',
  },
  {
    label: 'Thứ Bảy',
    value: 'SATURDAY',
  },
  {
    label: 'Chủ Nhật',
    value: 'SUNDAY',
  },
];
</script>

<style scoped></style>
