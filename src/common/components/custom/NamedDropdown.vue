<template>
  <input
    ref='input'
    :name='$props.name'
    type='hidden'
    :value='$attrs.modelValue'/>
  <component
    :is="isMultiSelect ? 'MultiSelect' : 'Dropdown'"
    :disabled='disableFlow'
    :editable='isEditable'
    :pt="{
      root: {
        style: {
          'display': $props.isHidden ? 'none' : 'flex'
        }
      }
    }"
    :show-clear='isShowClear'
    v-bind='$attrs'/>
</template>

<script>
export default {
  name: 'NamedDropdown',

  props: {
    name: {
      type: String,
      default: '',
      required: true,
    },

    isEditable: {
      type: Boolean,
      default: false
    },

    isShowClear: {
      type: Boolean,
      default: false,
    },

    isMultiSelect: {
      type: Boolean,
      default: false,
    },

    disableFlow: {
      type: Boolean,
      default: false
    },

    isHidden: {
      type: Boolean,
      default: false
    }
  },
};
</script>

<style scoped></style>
