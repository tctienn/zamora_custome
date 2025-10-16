<template>
  <div class='named-input-number'>
    <input
      ref='input'
      :name='$props.name'
      type='hidden'
      :value='$attrs.modelValue'>
    <InputNumber
      v-bind='$attrs'
      :use-grouping='$props.typeDecimal'/>
  </div>

</template>

<script>
export default {
  name: 'NamedInputNumber',

  props: {
    name: {
      type: String,
      default: '',
      required: true
    },

    typeDecimal: {
      type: Boolean,
      default: false
    }
  },
};
</script>

<style scoped>

</style>