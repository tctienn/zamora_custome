<template>
  <FormInputWrapper
    v-bind='$props'>
    <NamedDropdownUserInfo
      v-model='model'
      class='w-full'
      filter
      :input-class='{
        "bg-highlight": bgHighlight
      }'
      :input-id='name'
      :invalid='!!error'
      is-show-clear
      :name='name'
      :options='options'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';
import NamedDropdownUserInfo from '@/common/components/custom/NamedDropdownUserInfo.vue';

defineProps({
  label: {
    type: String,
    required: true
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
