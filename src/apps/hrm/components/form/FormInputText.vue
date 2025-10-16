<template>
  <FormInputWrapper
    v-bind='$props'>
    <InputText
      :id='name'
      v-model='value'
      v-trim
      class='w-full'
      :class='{
        "bg-highlight": bgHighlight
      }'
      :disabled='disabled'
      :invalid='!!error'
      :name='name'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
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
  disabled: {
    type: Boolean,
    default: false
  }
});

const value = defineModel({
  type: String,
  default: ''
});
</script>

<style>

</style>