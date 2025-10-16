<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('vehicle.vehicleDispatchOrder.moreInfo')"
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.kmEstimate`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.kmEstimate'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.kmEstimate }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.kmEstimate'
              hidden
              name='kmEstimate'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.kmReality`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.kmReality'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.kmReality }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.kmReality'
              hidden
              name='kmReality'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.gasolineEstimate`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.gasolineEstimate'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.gasolineEstimate }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.gasolineEstimate'
              hidden
              name='gasolineEstimate'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.gasolineReality`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.gasolineReality'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.gasolineReality }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.gasolineReality'
              hidden
              name='gasolineReality'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.costEstimate`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.costEstimate'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.costEstimate }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.costEstimate'
              hidden
              name='costEstimate'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.costReality`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.costReality'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.costReality }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.costReality'
              hidden
              name='costReality'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.kmInitial`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.kmInitial'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.kmInitial }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.kmInitial'
              hidden
              name='kmInitial'/>
          </div>
          <div class='col-6 field flex flex-column'>
            <label class='font-bold'>{{
              t(`vehicle.vehicleDispatchOrder.kmEnd`)
            }}</label>
            <InputNumber
              v-if='!isDetail'
              v-model='vehicleDispatchOrderMoreInfo.kmEnd'
              input-id='integeronly'/>
            <div v-else>
              {{ vehicleDispatchOrderMoreInfo.kmEnd }}
            </div>
            <input
              v-model='vehicleDispatchOrderMoreInfo.kmEnd'
              hidden
              name='kmEnd'/>
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
            v-if='!isDetail'
            icon='pi pi-save'
            :label="t('common.save')"
            @click='submitForm'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { IVehicleDispatchOrder } from '@/apps/vehicle/model/vehicleDispatchOrder';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  vehicleDispatchOrderMoreInfo: {
    type: Object as PropType<IVehicleDispatchOrder>,
    default: {} as IVehicleDispatchOrder,
  },
});
const emits = defineEmits(['hide-dialog', 'data']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const vehicleDispatchOrderMoreInfo = ref(props.vehicleDispatchOrderMoreInfo);

function submitForm() {
  emits('data', vehicleDispatchOrderMoreInfo.value);
  emits('hide-dialog');
}
</script>

<style scoped></style>
