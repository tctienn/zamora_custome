<template>
  <AutoComplete
    v-bind='$attrs'>
    <template #empty>
      <div class='p-1 text-center'>
        Không tìm thấy kết quả
      </div>
    </template>
  </AutoComplete>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ name: 'AutoCompleteEmptyTemplate', });
</script>

