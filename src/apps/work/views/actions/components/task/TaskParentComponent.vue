<template>
  <label
    for='work-parent'>
    {{ t('work.parent') }}
  </label>
  <AutoComplete
    v-model='taskParent'
    :delay='500'
    :force-selection='true'
    input-id='work-parent'
    :min-length='2'
    :option-label='getTaskOptionName'
    :show-clear='true'
    :suggestions='tasks'
    @complete='searchTask'
    @update:model-value='updateParent'>
  </AutoComplete>
</template>

<script setup lang='ts'>
import { get, trim } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskAsParentGraphql } from '@/apps/work/api/graphql/task-api';
import { SourceType, type Task } from '@/apps/work/model/task';

const props = defineProps({
  parent: {
    type: Object as PropType<Task | null>,
    default: () => null
  }
});
const emits = defineEmits(['updateParent']);
const { t } = useI18n();

const taskParent = ref<Task | null>(props.parent);
const tasks = ref<Task[]>([]);
const type = computed(() => SourceType[taskParent.value?.type as keyof typeof SourceType] || SourceType.NONE);

function getTaskOptionName(task: Task | null) {
  return task ? task.code ? `${ task.code } - ${ task.name }` : `${ task.name }` : '';
}

function searchTask(event: AutoCompleteCompleteEvent) {
  const { onResult: getTaskAsParentResult } = getTaskAsParentGraphql(type.value, trim(event.query));

  getTaskAsParentResult((response) => {
    tasks.value = get(response, 'data.taskAsParent', []);
  });
}

function updateParent(value: Task) {
  emits('updateParent', value);
}
</script>

<script lang='ts'>
export default { name: 'TaskParentComponent' };
</script>

<style lang='scss' scoped>
:deep(.break-field-rule) {
}
</style>