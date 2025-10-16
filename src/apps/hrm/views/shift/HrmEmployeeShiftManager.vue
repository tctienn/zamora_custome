<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <div
            v-ripple
            class='align-items-center cursor-pointer flex justify-content-center p-ripple'
            style='height: 2.75rem; width: 2.75rem'
            @click='listRef?.toggleTree()'>
            <i class='pi pi-bars'></i>
          </div>
          {{ t('hrm.shift.management.title') }}
        </div>

      </template>
    </Toolbar>
    <HrmEmployeeShiftListWrapper ref='listRef'/>
  </div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import HrmEmployeeShiftListWrapper from '@/apps/hrm/views/shift/list/HrmEmployeeShiftListWrapper.vue';

const { t } = useI18n();
const listRef = ref<InstanceType<typeof HrmEmployeeShiftListWrapper>>();
</script>

<style scoped>

</style>