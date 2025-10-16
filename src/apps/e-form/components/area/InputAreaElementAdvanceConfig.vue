<template>
  <div class='formgrid grid'>
    <div class='col-6 field'>
      <label>Số dòng (rows)</label>
      <InputNumber
        v-model='localConfig.rows'
        :min='1' />
    </div>

    <div class='col-6 field'>
      <label>Tối đa ký tự</label>
      <InputNumber
        v-model='localConfig.maxlength'
        :min='1' />
    </div>

    <div class='col-6 field'>
      <label>Tự động mở rộng</label>
      <InputSwitch v-model='localConfig.autoResize' />
    </div>

    <div class='col-6 field'>
      <label>Placeholder</label>
      <InputText v-model='localConfig.placeholder' />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import { reactive, watch } from 'vue';

import type { TextareaElementConfig } from '@/apps/e-form/model/form-config';

const props = defineProps<{
  config: Partial<TextareaElementConfig>;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: TextareaElementConfig): void;
}>();

const localConfig = reactive<TextareaElementConfig>({
  rows: 3,
  maxlength: 255,
  autoResize: true,
  placeholder: '',
  ...props.config
});

watch(
  () => localConfig,
  (val) => {
    emit('update:config', { ...val });
  },
  { deep: true }
);
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
