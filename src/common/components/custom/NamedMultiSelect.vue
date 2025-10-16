<template>
  <div class='named-multi-select'>
    <input
      ref='input'
      :name='$props.name'
      type='hidden'
      :value='$attrs.modelValue'>
    <MultiSelect v-bind='$attrs'/>
  </div>

</template>

<script>
export default {
  name: 'NamedMultiSelect',

  props: {
    name: {
      type: String,
      default: '',
      required: true
    }
  },
};
</script>

<style scoped>

</style>