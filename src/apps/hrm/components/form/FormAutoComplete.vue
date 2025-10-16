<template>
  <FormInputWrapper
    v-bind='$props'>
    <AutoComplete
      v-model='value'
      class='w-full'
      :input-class='{
        "w-full": true,
        "bg-highlight": bgHighlight
      }'
      :input-id='name'
      :input-props='{...inputProps, name: name }'
      :invalid='!!error'
      :name='name'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import type { InputHTMLAttributes, PropType } from 'vue';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';

defineProps({
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
  bgHighlight: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  inputProps: {
    type: Object as PropType<InputHTMLAttributes>,
    default: {} as InputHTMLAttributes
  }
});

// eslint-disable-next-line vue/require-prop-types
const value = defineModel();
</script>

<style scoped>

</style>
