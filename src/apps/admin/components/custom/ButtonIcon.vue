<template>
  <Button
    v-bind='$attrs'
    :class='computedClasses'>
    <AppIcon
      v-if='$props.icon'
      :class="[$attrs.class, $attrs.label ? ($props.position==='left'?'p-button-icon-left':'p-button-icon-right') : '']"
      :name='$props.icon'
      :size='$props.iconSize' />
    <span
      v-if='!isEmpty($attrs.label)'
      class='p-button-label'>{{ $attrs.label }}</span>
  </Button>
</template>

<script>

import { isEmpty } from 'lodash';

export default {
  name: 'ButtonIcon',

  props: {
    icon: {
      type: String,
      default: '',
      required: true,
    },

    position: {
      type: String,
      default: 'left'
    },

    iconSize: {
      type: String,
      default: '1.3',
    },
  },

  computed: {
    computedClasses() {
      return { 'p-0': Object.prototype.hasOwnProperty.call(this.$attrs, 'rounded') };
    }
  },

  methods: { isEmpty },
};
</script>

<style scoped>

</style>