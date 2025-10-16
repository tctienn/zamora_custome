<template>
  <div class='flex flex-column gap-3'>
    <div class='align-items-center flex gap-2'>
      <label class='w-8rem'>True Value</label>
      <InputText
        v-model='localConfig.trueValue'
        class='flex-1'/>
    </div>

    <div class='align-items-center flex gap-2'>
      <label class='w-8rem'>False Value</label>
      <InputText
        v-model='localConfig.falseValue'
        class='flex-1'/>
    </div>

    <div class='align-items-center flex gap-2'>
      <label class='w-8rem'>Label</label>
      <InputText
        v-model='localConfig.label'
        class='flex-1'/>
    </div>

    <div class='align-items-center flex gap-2'>
      <label class='w-8rem'>Disabled</label>
      <Checkbox
        v-model='localConfig.disabled'
        :binary='true'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import { reactive, watch } from 'vue';

const props = defineProps<{
  field: {
    id: number;
    config?: Record<string, any>;
  };
}>();

const emit = defineEmits(['update:field']);

const defaultConfig = {
  trueValue: 'true',
  falseValue: 'false',
  label: '',
  disabled: false,
};

const localConfig = reactive({
  ...defaultConfig,
  ...props.field.config,
});

watch(
  () => ({ ...localConfig }),
  (updated) => {
    emit('update:field', {
      ...props.field,
      config: {
        ...props.field.config,
        ...updated,
      },
    });
  },
  { deep: true }
);
</script>
