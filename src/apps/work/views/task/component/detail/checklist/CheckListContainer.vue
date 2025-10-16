<template>
  <div>
    <!--    Header-->
    <div class='flex justify-content-between'>
      <div class='align-items-center flex gap-2'>
        <span class='font-semibold text-primary'>
          {{ title }}
        </span>
        <slot name='add-group-button-icon'>
          <ButtonIcon
            v-tooltip='t("work.task.checklist.add")'
            :disabled='disableModify'
            icon='add'
            round
            text
            @click='addGroupCheckList'>
          </ButtonIcon>
        </slot>
      </div>
      <div>
        <slot name='filter-menu'>
          <div class='align-items-center flex gap-2'>
            <template
              v-for='(menu,index) in filterMenus'
              :key='menu?.key'>
              <div
                class='cursor-pointer'
                :class="{'font-semibold':selectedFilterIndex==index}"
                :style='{color:menu.color as string}'
                @click='clickFilter(menu,index)'>
                <slot
                  :index='index'
                  :menu='menu'
                  name='filter-menu-item'>
                  {{ menu.label }}
                  ({{ menu?.key ? countMenu?.[menu.key] : 0 }})
                </slot>
              </div>
              <span v-if='index!=filterMenus.length-1'>|</span>
            </template>
          </div>
        </slot>
      </div>
    </div>
    <!--    Body-->
    <div class='mx-3'>
      <template
        v-for='(group,index) in modelValue'
        :key='group.id'>
        <CheckListGroup
          v-model='modelValue[index]'
          :task-id='taskId'
          @delete-check-list-group='deleteCheckListGroup'>
        </CheckListGroup>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash';
import { computed, inject, provide, reactive, type Ref, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { countAllByTaskId } from '@/apps/work/api/graphql/checklist-api';
import { listCheckListGroup, saveCheckListGroup } from '@/apps/work/api/graphql/checklistgroup-api';
import type { CheckListFilter } from '@/apps/work/model/checklist';
import type { CheckListGroup as GroupModel, Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { FilterMenu } from '@/apps/work/views/task/component/detail/checklist/checklist-type';
import CheckListGroup from '@/apps/work/views/task/component/detail/checklist/CheckListGroup.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

type CheckListMenu = {
  label?: string,
  key?: FilterMenu,
  command?: () => void
  [key: string]: unknown
}
const props = defineProps({
  title: {
    type: String,
    default: 'Checklist'
  },
  taskId: {
    type: String,
    default: undefined
  }
});

const modelValue = defineModel<GroupModel[]>({ default: [] });

const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));

const { t } = useI18n();
const { moment } = useMoment();
const { canModifyTask } = useTaskStore();
const filter = ref<CheckListFilter>({});
const {
  load: loadCheckListGroup,
  onResult: checkListGroupOnResult,
  refetch: refetchCheckListGroup
} = listCheckListGroup(props.taskId || '', filter.value);
if (props.taskId) {
  loadCheckListGroup(null, {
    taskId: props.taskId,
    filter: filter.value
  });

  checkListGroupOnResult(res => {
    return;
  });
}
checkListGroupOnResult(res => {
  modelValue.value = cloneDeep(res.data?.listCheckListGroup || []);
});

function defaultGroup(orderNo?: number): GroupModel {
  return cloneDeep({
    name: `${t('work.task.checklist.group')} ${modelValue.value.length + 1}`,
    checkLists: [],
    taskId: props.taskId || '',
    orderNo: orderNo || modelValue.value.length + 1
  });
}

const { mutate: saveCheckListGroupMutate } = saveCheckListGroup();

function addGroupCheckList() {
  const newGroup = defaultGroup();
  saveCheckListGroupMutate({ checkListGroupInput: newGroup })
    .then((res) => {
      refetchCheckList(filter.value);
    });
}

function deleteCheckListGroup(id: string) {
  refetchCheckList(filter.value);
  // modelValue.value = modelValue.value.filter(e => e.id != id);
  //Or refetch

}

const selectedFilterIndex = ref<number>(0);

function clickFilter(menu: CheckListMenu, index: number) {
  if (menu.command) {
    menu.command();
  }
  selectedFilterIndex.value = index;
}

const countMenu = reactive<Record<FilterMenu, number>>({
  ALL: 0,
  CHECKED: 0,
  OVERDUE: 0,
  UNCHECKED: 0
}
);
const filterOption = ref<FilterMenu>(FilterMenu.ALL);
const filterMenus = ref<CheckListMenu[]>([
  {
    label: t('common.all'),
    key: FilterMenu.ALL,
    command: () => {
      filterOption.value = FilterMenu.ALL;
      filterCheckList(FilterMenu.ALL);
    }
  }, {
    label: t('work.task.checklist.checked'),
    key: FilterMenu.CHECKED,
    color: '#5CB85CD6',
    command: () => {
      filterOption.value = FilterMenu.CHECKED;
      filterCheckList(FilterMenu.CHECKED);
    }
  }, {
    label: t('work.task.checklist.uncheck'),
    key: FilterMenu.UNCHECKED,
    color: '#FCAB14D6',
    command: () => {
      filterOption.value = FilterMenu.UNCHECKED;
      filterCheckList(FilterMenu.UNCHECKED);
    }
  }, {
    label: t('work.task.checklist.overdue'),
    key: FilterMenu.OVERDUE,
    color: '#FF0505D6',
    command: () => {
      filterOption.value = FilterMenu.OVERDUE;
      filterCheckList(FilterMenu.OVERDUE);
    }
  },
]);

function refetchCheckList(filter: CheckListFilter) {
  refetchCheckListGroup({
    taskId: props.taskId || '',
    filter: filter
  })?.then((res) => {
    refetchCount();
  });
}

function refetch() {
  refetchCheckList(filter.value);
}

provide('refetchCheckList', refetch);

const { load: loadCount, onResult: countOnResult, refetch: refetchCount } = countAllByTaskId(props.taskId || '');
if (props.taskId) {
  loadCount(null, { taskId: props.taskId });
  countOnResult(() => {
    return;
  });
}
countOnResult(res => {
  const data = res.data?.countAllByTaskId;
  countMenu.ALL = data?.all || 0;
  countMenu.CHECKED = data?.check || 0;
  countMenu.UNCHECKED = data?.uncheck || 0;
  countMenu.OVERDUE = data?.overdue || 0;
});

function filterCheckList(filterMenu: FilterMenu) {
  switch (filterMenu) {
  case FilterMenu.ALL:
    filter.value = {};
    break;
  case FilterMenu.CHECKED:
    filter.value = { isChecked: true };
    break;
  case FilterMenu.UNCHECKED:
    filter.value = { isChecked: false };
    break;
  case FilterMenu.OVERDUE:
    filter.value = { from: moment(new Date()).format(DateTimeFormat.ISO_LOCAL_DATE_TIME) };
    break;

  }
  refetchCheckList(filter.value);
}

const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});

</script>

<style scoped>

</style>