<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='py-2'>
      <template #start>
        <div class='font-semibold'>{{ t('hrm.defaultAttendance.title') }}</div>
      </template>
      <template #end>
        <div class='flex gap-3'>
          <div
            v-for='type in allTypes'
            :key='type.value'
            class='align-items-center flex'>
            <RadioButton
              :input-id='type.value'
              :model-value='selectedType'
              name='dynamic'
              :value='type.value'
              @update:model-value='changeType($event as AttendanceType)' />
            <label
              class='cursor-pointer ml-2'
              :for='type.value'>{{ type.label }}</label>
          </div>
        </div>

      </template>
    </Toolbar>

    <CameraSettingManager v-if='selectedType === AttendanceType.CAMERA'/>
    <FingerSettingManager v-if='selectedType === AttendanceType.FINGER_PRINT'/>
  </div>

</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { configuredAttendances, toggleDefaultAttendance } from '@/apps/hrm/api/graphql/default_attendance';
import { AttendanceType } from '@/apps/hrm/model/attendance';
import type { DefaultAttendance } from '@/apps/hrm/model/default_attendance';
import CameraSettingManager from '@/apps/hrm/views/default_attendance/camera/CameraSettingManager.vue';
import FingerSettingManager from '@/apps/hrm/views/default_attendance/finger/FingerSettingManager.vue';

const { t } = useI18n();
const { result, refetch } = configuredAttendances();
const selectedType = ref<AttendanceType>();

watch(result, (value) => {
  selectedType.value = (value?.configuredAttendances as DefaultAttendance[] || [])
    .find(a => a.enabled)?.type;
});

const allTypes = computed(() => (result.value?.configuredAttendances as DefaultAttendance[] || [])
  .map(a => ({
    label: t(`hrm.attendance.detail.typeOptions.${camelCase(a.type)}`),
    value: a.type
  })));

function changeType(type: AttendanceType) {
  toggleDefaultAttendance().mutate({ type })
    .then(() => refetch());
}
</script>

<style scoped>

</style>