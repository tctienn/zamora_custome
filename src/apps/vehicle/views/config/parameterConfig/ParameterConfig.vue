<template>
  <Toolbar
    class='mb-2 p-0'
    style='min-height: 46px'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t('work.parameterConfig.header') }}
        </div>
      </div>
    </template>

  </Toolbar>

  <TabView v-model:active-index='currentTab'>
    <TabPanel header='Phiếu đặt xe'>
      <div class='card'>
        <BookingCarParameterConfig ref='bookingCarRef'/>
      </div>
      <div class='card'>
        <VehicleDispatchOrderParameterConfig ref='vehicleDispatchRef'/>
      </div>
      <div class='card'>
        <DaysNoticeBeforeDueDate ref='daysNoticeBeforeDueDateRef'/>
      </div>
      <div class='flex justify-content-center mt-2 w-full'>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='saveParam'/>
      </div>
    </TabPanel>

  </TabView>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BookingCarParameterConfig
  from '@/apps/vehicle/views/config/parameterConfig/component/BookingCarParameterConfig.vue';
import DaysNoticeBeforeDueDate from '@/apps/vehicle/views/config/parameterConfig/component/DaysNoticeBeforeDueDate.vue';
import VehicleDispatchOrderParameterConfig
  from '@/apps/vehicle/views/config/parameterConfig/component/VehicleDispatchOrderParameterConfig.vue';

const { t } = useI18n();
const currentTab = ref(0);

const bookingCarRef = ref();
const vehicleDispatchRef = ref();
const daysNoticeBeforeDueDateRef = ref();

function saveParam() {
  bookingCarRef.value?.save();
  vehicleDispatchRef.value?.save();
  daysNoticeBeforeDueDateRef.value?.save();
}
</script>

<style></style>
