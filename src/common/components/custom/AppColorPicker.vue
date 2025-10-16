<template>
  <div
    class='cursor-pointer relative'>
    <AppIcon
      name='opacity'
      size='1.5'
      @click='click'>
    </AppIcon>
    <input
      ref='inputRef'
      v-model='color'
      class='absolute'
      style='opacity:0;bottom:0;right:0;height:0'
      type='color'
      v-bind='$attrs'>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const color = defineModel<string>({ default: '#FFFFFF' });
const inputRef = ref();

function click() {
  inputRef?.value.click();
}
</script>

<style scoped>

</style>