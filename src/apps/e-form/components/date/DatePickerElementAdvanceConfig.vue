<template>
  <div class='formgrid grid'>
    <!--    TODO: fix this-->
    <!--    <div class='col-6 field'>-->
    <!--      <label>Chế độ chọn ngày</label>-->
    <!--      <Dropdown-->
    <!--        v-model='localConfig.selectionMode'-->
    <!--        :options="['single', 'multiple', 'range']"-->
    <!--        placeholder='Chọn chế độ'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Định dạng ngày</label>-->
    <!--      <InputText-->
    <!--        v-model='localConfig.dateFormat'-->
    <!--        placeholder='dd/mm/yy'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Hiển thị icon</label>-->
    <!--      <InputSwitch v-model='localConfig.showIcon'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Inline</label>-->
    <!--      <InputSwitch v-model='localConfig.inline'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Cho phép chọn ngày khác tháng</label>-->
    <!--      <InputSwitch v-model='localConfig.selectOtherMonths'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Hiển thị ngày khác tháng</label>-->
    <!--      <InputSwitch v-model='localConfig.showOtherMonths'/>-->
    <!--    </div>-->

    <!--    <div class='col-6 field'>-->
    <!--      <label>Chế độ xem</label>-->
    <!--      <Dropdown-->
    <!--        v-model='localConfig.view'-->
    <!--        :options="['date', 'month', 'year']"-->
    <!--        placeholder='Chọn view'/>-->
    <!--    </div>-->
  </div>
</template>

<script lang='ts' setup>
import type { InputDateConfig } from '@/apps/e-form/model/form-config';

const props = defineProps<{
  config: Partial<InputDateConfig>;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: InputDateConfig): void;
}>();

// const localConfig = reactive<InputDateConfig>({
//   selectionMode: 'single',
//   dateFormat: 'dd/mm/yy',
//   showIcon: true,
//   inline: false,
//   selectOtherMonths: false,
//   showOtherMonths: true,
//   view: 'date',
//   ...props.config,
// });

</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
