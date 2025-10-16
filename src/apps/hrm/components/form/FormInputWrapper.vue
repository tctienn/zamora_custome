<template>
  <div class='field'>
    <label
      :for='name'>{{ label }}
      <span
        v-if='required'
        class='text-red-500'>*</span>
    </label>
    <slot></slot>
    <small
      v-if='error'
      class='text-red-500'>{{ error }}</small>
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
  error: {
    type: String,
    default: undefined
  },
  required: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>

</style>