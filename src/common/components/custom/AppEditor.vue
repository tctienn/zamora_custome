<template>
  <Editor
    ref='editorRef'
    v-bind='$attrs'/>
</template>

<script setup>
import Editor from 'primevue/editor';
import { ref, watch } from 'vue';

const editorRef = ref();
watch(editorRef, (editor) => {
  if (!editor) {
    return;
  }
  // Hack needed for Quill v2: https://github.com/primefaces/primevue/issues/5606#issuecomment-2093536386
  editor.renderValue = function renderValue (value) {
    if (this.quill) {
      if (value) {
        const delta = this.quill.clipboard.convert({ html: value });
        this.quill.setContents(delta, 'silent');
      } else {
        this.quill.setText('');
      }
    }
  }.bind(editor); // Bind needed for production build
});

defineExpose({ getQuill: () => editorRef.value?.quill });
</script>

<style scoped>

</style>