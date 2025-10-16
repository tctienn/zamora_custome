<template>
  <Button
    v-ripple
    class='focus:shadow-none p-1'
    :class='{ "border-yellow-400": highLight }'
    text
    @click='saveEmotion(content)'>
    <span style='font-family: Emoji,serif'>{{ content }}</span>
    <span v-if='count'>{{ count }}</span>
  </Button>
</template>

<script lang='ts' setup>
import { inject } from 'vue';

defineProps({
  content: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 0
  },
  highLight: {
    type: Boolean,
    default: false
  }
});

const saveEmotion = inject('saveEmotion', (s: string) => void {});

</script>

<style scoped>

</style>