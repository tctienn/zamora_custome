<!--
  Usage:
  <AppIcon name='cloud' size='2'/>
  <AppIcon name='cloud' size='22'/>
  <AppIcon name='cloud' size='2'/>

  props size unit default: rem

  list icons url: https://fonts.google.com/icons
-->

<template>
  <span class='custom-icon material-symbols-outlined'>{{ name }}</span>
</template>

<script setup>
import { toNumber, trimEnd } from 'lodash';
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: '',
    required: true
  },
  size: {
    type: String,
    default: '1'
  },
  fill: {
    type: Boolean,
    default: false
  }
});

const fontSize = computed(() => {
  return !props.size.endsWith('rem') && toNumber(trimEnd(props.size, 'rem')) > 0 ? `${props.size}rem` : props.size;
});

const fillSetting = computed(() => '"FILL" ' + (props.fill ? 1 : 0));

</script>

<script>
export default { name: 'AppIcon' };
</script>

<style scoped>
.custom-icon {
  font-weight: inherit !important;
  font-size: v-bind(fontSize) !important;
  font-variation-settings: v-bind(fillSetting) !important;
}
</style>

