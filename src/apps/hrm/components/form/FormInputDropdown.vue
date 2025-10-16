<template>
  <FormInputWrapper
    v-bind='$props'>
    <NamedDropdown
      v-model='model'
      class='w-full'
      :disable-flow='disableAction'
      filter
      :input-class='{
        "bg-highlight": bgHighlight
      }'
      :input-id='name'
      :invalid='!!error'
      :is-show-clear='$props.isShowClear'
      :name='name'
      :options='options'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';

defineProps({
  label: {
    type: String,
    required: true
  },
  isShowClear: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: undefined
  },
  bgHighlight: {
    type: Boolean,
    default: false
  },
  disableAction: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
});

// eslint-disable-next-line vue/require-prop-types
const model = defineModel();

if (model.value === '') {
  model.value = null;
}

</script>

<style scoped>

</style>
