<template>
  <Dialog
    v-model:visible='visible'
    :header='t("work.task.listTask")'
    modal
    style='width:70vw'
    @show='onShowDialog'>
    <div
      style='height: calc(100vh - 20rem)'>
      <div
        class='flex justify-content-end mb-2'>
        <InputText
          v-model='searchTerm'
          :placeholder="t('work.task.taskName')"></InputText>
      </div>
      <DataTable
        row-hover
        scroll-height='calc(100vh - 25rem)'
        scrollable
        :value='filterOption'
        @row-click='rowClick'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t('common.emptyRecords', { itemType: 'công việc' })
          }}</span>
        </template>
        <Column
          class='col-5'
          field='name'
          :header="t('work.task.taskName')">
          <template #body='{data}'>
            <div class='align-items-center flex gap-2 white-space-nowrap word-break-break-word'>
              <Checkbox
                v-model='selected'
                :value='data?.id'>
              </Checkbox>
              {{ data?.name }}
            </div>
          </template>
        </Column>
        <Column
          body-class='text-center '
          class='col-4'
          :header="t('common.time')">
          <template #body='{data}'>
            {{ formatDateTime(data?.startTime) }} {{ data?.dueTime ? ` - ${formatDateTime(data?.dueTime)}` : '' }}
          </template>
        </Column>
        <Column
          class='col-3'
          :header="t('work.task.percent')">
          <template #body='{data}'>
            <ProgressBar
              class='h-1rem w-full'
              :pt='{
                root:{
                  class:["bg-orange-400"]
                },
                value:{
                  class:["bg-blue-400"]
                }
              }'
              :value='data?.percent||0'/>
          </template>
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='closeDialog'>

      </Button>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='save'>

      </Button>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveChildrenTask } from '@/apps/work/api/graphql/sub-task-api';
import { getTasksRelateAndNoParent } from '@/apps/work/api/graphql/task-api';
import type { SearchTaskInput, Task } from '@/apps/work/model/task';
import { mapNotNull } from '@/common/helpers/extension/array.extension';
import { formatDateTime } from '@/common/helpers/time-util';
import { normalizeString } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'refetch'): void
}>();
const visible = defineModel<boolean>('visible', { default: false });
const subTasks = defineModel<Task[]>({ default: [] });
const selected = ref<string[]>([]);
const { t } = useI18n();
const tasks = ref([]);

const options = ref<Task[]>([]);
const taskTemp = ref([]);
const { user } = storeToRefs(useUserStore());
const { mutate: saveChildrenMutate } = saveChildrenTask();

const filterOption = computed(() => {
  if (!searchTerm.value) {
    return tasks.value;
  }
  return tasks.value.filter((e: any) => {
    return normalizeString(e.name).includes(
      normalizeString(searchTerm.value || '')
    );
  });

});
const searchInput = ref<SearchTaskInput>({
  userId: user.value.id || '',
  isAdminSearch: true,
  isFilterEvaluate: false,
  isFilterDeadlineExtension: false,
} as SearchTaskInput);

function onShowDialog() {
  selected.value = mapNotNull(subTasks.value, item => item.id);
  getTasksRelateAndNoParent(props.taskId ?? '', searchInput.value).onResult((res) => {
    tasks.value = res.data?.getTasksRelateAndNoParent || [];
    taskTemp.value = tasks.value;
  });
}

function rowClick(event: DataTableRowClickEvent) {
  const index = selected.value.indexOf(event.data?.id);
  if (index < 0) {
    selected.value = [...selected.value, event.data?.id];
  } else {
    selected.value.splice(index, 1);
  }
}

function closeDialog() {
  visible.value = false;
  selected.value = [];
}

function save() {
  saveChildrenMutate({
    taskId: props.taskId,
    childrenTaskIds: selected.value
  }).then(() => {
    emits('refetch');
    selected.value = [];
    visible.value = false;
  }
  );
}

const searchTerm = ref<string>();
</script>

<style scoped>

</style>