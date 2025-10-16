<template>
  <FormInputWrapper
    v-bind='$props'>
    <Textarea
      :id='name'
      v-model='value'
      class='w-full'
      :class='{
        "bg-highlight": bgHighlight
      }'
      :invalid='!!error'
      :name='name'
      rows='5'
      v-bind='$attrs'/>
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
  }
});

const value = defineModel({
  type: String,
  default: ''
});
</script>

<style scoped>

</style>
