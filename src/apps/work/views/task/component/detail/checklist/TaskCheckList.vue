<template>
  <CheckListContainer
    v-model='modelValue'
    :task-id='taskId'
    :title='title'>
  </CheckListContainer>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CheckListGroup as GroupModel } from '@/apps/work/model/task';
import CheckListContainer from '@/apps/work/views/task/component/detail/checklist/CheckListContainer.vue';

const props = defineProps({
  title: {
    type: String,
    default: undefined
  },
  taskId: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();
const modelValue = ref<GroupModel[]>([]);
</script>

<style scoped>

</style>