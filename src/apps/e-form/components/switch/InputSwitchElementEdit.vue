<template>
  <FormInputWrapper
    v-bind='$props'>
    <div ref='inputSwitch'>
      <InputSwitch
        v-model='value'
        :disabled='disabled'
        :input-id='name'
        :invalid='!!error'
        :name='name'
        :pt='{
          input: {
            name: name
          }
        }'/>
    </div>
  </FormInputWrapper>

</template>

<script lang='ts' setup>
import { onMounted, type PropType, ref, watch } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';

defineProps({
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: undefined
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const value = defineModel({
  type: Boolean,
  default: false
});

const inputSwitch = ref();

watch(value, (v) => {
  const input = inputSwitch.value?.querySelector('input');
  if (input) {
    input.value = v;
  }
});

onMounted(() => {
  const input = inputSwitch.value?.querySelector('input');
  if (input) {
    input.value = value.value;
  }
});
</script>

<style scoped>

</style>