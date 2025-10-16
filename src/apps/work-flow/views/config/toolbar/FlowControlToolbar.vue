<template>
  <Controls position='top-right'>
    <ControlButton @click='emits("changeLayout", "TB")'>
      <AppIcon
        class='text-black-alpha-90'
        name='swap_vert'/>
    </ControlButton>
    <ControlButton @click='emits("changeLayout", "LR")'>
      <AppIcon
        class='text-black-alpha-90'
        name='swap_horiz'/>
    </ControlButton>
  </Controls>
</template>

<script lang='ts' setup>
import { ControlButton, Controls } from '@vue-flow/controls';

const emits = defineEmits(['changeLayout']);
</script>
