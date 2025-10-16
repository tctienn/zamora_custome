<template>
  <div
    class='duration-300 ease-in-out job-wrapper transition-all'
    :class="{ 'hide-chat': isChatHidden }">
    <div class='form-panel overflow-auto'>
      <slot name='form' />
    </div>
    <div class='border-left-1 chat-panel overflow-auto px-3 py-2 surface-border surface-e'>
      <slot name='chat' />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isChatHidden = ref(false);

function toggleChat() {
  isChatHidden.value = !isChatHidden.value;
}

defineExpose({ toggleChat });
</script>

<style scoped>
.job-wrapper {
  display: grid;
  grid-template-columns: 1fr 25rem;
  gap: 0.75rem;
  
  transition: all 0.3s ease;
  overflow: hidden;
}

.job-wrapper.hide-chat {
  grid-template-columns: 1fr 0;
  gap: 0;
}

.form-panel{
height: calc(100vh - 9rem);
}

.chat-panel {
  transition: all 0.3s ease;
  overflow: auto;
}

.job-wrapper.hide-chat .chat-panel {
  visibility: hidden;
  width: 0;
  padding: 0;
  border: none;
}

</style>
