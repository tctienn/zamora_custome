<template>
  <div class='align-items-center flex'>
    <Checkbox
      v-model='value'
      binary
      :input-id='name'
      :name='name'/>
    <label
      class='ml-2'
      :for='name'>{{ label }}</label>
  </div>
</template>

<script setup lang='ts'>
defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
});
const value = defineModel( {
  type: Boolean,
  default: false
});
</script>

<style scoped>

</style>