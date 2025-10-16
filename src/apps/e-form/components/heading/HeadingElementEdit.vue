<template>
  <InputText
    :id='name'
    v-model='value'
    v-trim
    class='w-full'
    :disabled='disabled'
    :invalid='!!error'
    :name='name'/>
</template>

<script lang='ts' setup>

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

<style scoped>

</style>