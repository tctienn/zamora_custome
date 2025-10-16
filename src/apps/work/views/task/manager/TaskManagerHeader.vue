<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ header || t('work.task.listTask') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 mr-1 my-1'>
        <slot
          :loading='loading'
          name='addButton'
          :reload='reload'>
          <SplitButton
            class='btn-create focus:shadow-none font-medium p-2'
            :model='createMenu'
            @click='addTask'>
            <AppIcon
              class='mr-2'
              name='add'
              size='1.3'></AppIcon>
            <span class='p-button-label'>
              {{ t('common.create') }}
            </span>
          </SplitButton>

        </slot>
        <Button
          class='focus:shadow-none font-normal gap-2 hover:surface-200'
          icon='pi pi-list'
          icon-size='1.5'
          :label="t('work.task.viewByType')"
          outlined
          @click='viewTypeRef?.toggle'>
          <template #icon>
            <i
              class='pi pi-list'
              style='margin-top: 1px'></i>
            <i class='flex-order-2 mt-1 pi pi-angle-down' />
          </template>
        </Button>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          :icon='
            isEmpty(filterCondition) ? `pi pi-filter` : `pi pi-filter-fill`
          '
          icon-size='1.5'
          :label="t('common.filter')"
          outlined
          @click='filterRef?.toggle'>
        </Button>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-sort'
          icon-size='1.5'
          :label="t('common.sort')"
          outlined
          @click='sortRef?.toggle'>
        </Button>

        <slot
          name='exportButton'>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            icon-size='1.5'
            label='Export'
            :loading='exportLoading'
            outlined
            @click='exportRef?.toggle'>
          </Button>
        </slot>

        <slot
          :loading='loading'
          name='reloadButton'>
          <ButtonIcon
            class='focus:shadow-none font-normal hover:surface-200'
            icon='restart_alt'
            icon-size='1.5'
            label='Refresh'
            :loading='loading'
            outlined
            @click='reload'>
          </ButtonIcon>
        </slot>
      </div>
    </template>
  </Toolbar>

  <div class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 p-2 surface-0'>
    <div>
      <slot name='selectedButton'>
        <SelectButton
          v-model='selectedButtonModel'
          :allow-empty='false'
          class='border-none'
          option-label='label'
          :options='tabMenuProgress'
          :pt='{
            button: {
              style: {
                padding: "5px",
                borderRadius: "4px",
              }
            }
          }'>
          <template #option='{ option }'>
            <div class='flex font-semibold gap-2'>
              {{ option.label }}
              <span class='number-project'>
                {{ mapCountLv1?.[option?.code as TaskRoleFilter] || 0 }}</span>
            </div>
          </template>
        </SelectButton>
      </slot>
    </div>
    <div class='flex gap-2'>
      <Calendar
        v-model='searchDate'
        date-format='MM/yy'
        icon-display='input'
        :manual-input='false'
        show-icon
        view='month'>
        <template #footer>
          <div class='justify-content-end p-datepicker-buttonbar'>
            <Button
              :label='"Xoá"'
              text
              @click='searchDate = null'>
            </Button>
          </div>
        </template>
      </Calendar>
      <div
        v-if='showShortCut'
        class='flex gap-2'>
        <slot name='shortCut'>
          <div class='relative'>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='preliminary'
              icon-size='1.4'
              :label='"Chờ đánh giá"'
              :outlined='!filterEvaluateState'
              @click='filterEvaluate'>
            </Button>
            <div
              class='absolute'
              style='top:-0.5rem;right:-0.5rem'>
              <Badge
                :value='mapCountLv1?.waitingEvaluate'>
              </Badge>
            </div>
          </div>

          <div class='relative'>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='free_cancellation'
              :label='"Gia hạn"'
              :outlined='!filterDeadlineExtensionState'
              @click='filterDeadlineExtension'>
            </Button>
            <div
              class='absolute'
              style='top:-0.5rem;right:-0.5rem'>
              <Badge
                :value='mapCountLv1?.deadlineExtension'>
              </Badge>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>

  <QuickSaveTask
    v-model:visible='visibleQuickSave'
    @hide-dialog='hideForm'
    @reload="emits('reload')"/>

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>
    <template #item='{ item: item }'>
      <div
        class='align-items-center cursor-pointer flex gap-2 p-2'
        :style='{color: viewType == item.key ? "#0d99ff" : ""}'>
        <AppIcon
          name='check'
          size='1.5'
          :style='{ opacity: viewType == item.key ? 1 : 0 }'/>
        {{ item.label }}
      </div>

    </template>
  </Menu>

  <Menu
    ref='filterRef'
    :model='searchFilters'
    popup>
    <template #item='{ item: item }'>
      <div
        class='align-items-center cursor-pointer flex gap-2 mr-3 p-2'
        :style='{color: filterCondition == item.key ? "#0d99ff" : ""}'>
        <AppIcon
          name='check'
          size='1.5'
          :style='{ opacity: filterCondition == item.key ? 1 : 0 }'/>
        {{ item.label }}
      </div>
    </template>
  </Menu>

  <Menu
    ref='sortRef'
    :model='sortMenu'
    popup>
    <template #item='{ item: item }'>
      <div
        class='align-items-center cursor-pointer flex gap-2 p-2'
        :style='{color: sort.length > 0 && sort[0].property == item.key ? "#0d99ff" : ""}'>
        <i
          class='mr-2 pi text-xl'
          :class="sortMap?.[item?.key || '']?.icon ?? 'pi-sort-amount-down'"
          :style='{
            opacity: sort.length > 0 && sort[0].property == item.key ? 1 : 0,
          }'>
        </i>
        {{ item.label }}
      </div>
    </template>
  </Menu>

  <Menu
    ref='exportRef'
    :model='exportMenu'
    popup></Menu>
</template>

<script lang='ts' setup>
import { isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import type Menu from 'primevue/menu';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { exportExcelTasks } from '@/apps/work/api/rest/Task';
import { TASK_FILTER_HEADER } from '@/apps/work/constants';
import { useTaskStore } from '@/apps/work/store/task';
import QuickSaveTask from '@/apps/work/views/task/component/form/QuickSaveTask.vue';
import type { ButtonModelType, ViewType, } from '@/apps/work/views/task/manager/type';
import { associate } from '@/common/helpers/extension/array.extension';
import { downloadFile } from '@/common/helpers/file-utils';
import { Direction, type Order } from '@/common/model/query';

import { type SearchTaskInput, TaskRoleFilter } from '../../../model/task';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  mapCountLv1: {
    type: Object as PropType<Record<TaskRoleFilter | 'waitingEvaluate' | 'deadlineExtension', number>>,
    default: () => ({}),
  },
  header: {
    type: String,
    default: undefined,
  },
  searchInput: {
    type: Object as PropType<SearchTaskInput>,
    default: undefined,
  },
});

const emits = defineEmits<{
  (e: 'reload'): void;
  (e: 'filterEvaluate', state: boolean): void;
  (e: 'filterDeadlineExtension', state: boolean): void;
}>();
const { t } = useI18n();
const {
  filterTasks,
  tasks,
  filterStatusId,
  filterCondition,
  sort
} =
    storeToRefs(useTaskStore());

const visibleQuickSave = ref<boolean>(false);
const taskId = defineModel<string | undefined>('taskId', { default: undefined, });
const visibleForm = defineModel<boolean>('visibleForm', { default: false });
const searchDate = defineModel<Date | null>('searchDate', { default: new Date() });
const selectedButtonModel = defineModel<ButtonModelType>('buttonModel', { default: undefined, });
const viewType = defineModel<ViewType>('viewType', { default: 'list' });

//View type
const viewTypeMenu = ref([
  {
    label: 'Danh sách',
    key: 'list',
    command: () => {
      viewType.value = 'list';
    },
  },
  {
    label: 'Kanban',
    key: 'kanban',
    command: () => {
      viewType.value = 'kanban';
      filterStatusId.value = 'ALL';
    },
  },
  {
    label: 'Phân cấp cha con',
    key: 'hierarchy',
    command: () => {
      viewType.value = 'hierarchy';
    },
  },
  {
    label: 'Lịch biểu',
    key: 'calendar',
    command: () => {
      viewType.value = 'calendar';
    },
  },
  {
    label: 'Gantt',
    key: 'gantt',
    command: () => {
      viewType.value = 'gantt';
    },
  },
  {
    label: 'Dự án',
    key: 'groupByProject',
    command: () => {
      viewType.value = 'groupByProject';
    },
  },
  {
    label: 'Nhóm công việc',
    key: 'groupByGroupTask',
    command: () => {
      viewType.value = 'groupByGroupTask';
    },
  },
]);
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);

//Create menu
const createMenu = ref([
  {
    label: t('work.task.menuOptions.createTask'),
    key: 'create',
    command: () => {
      addTask();
    },
  },
  {
    label: t('work.task.menuOptions.quickCreateTask'),
    key: 'quickCreate',
    command: () => {
      visibleQuickSave.value = true;
    },
  },
  {
    label: t('work.task.menuOptions.createLoopTask'),
    key: 'loop',
    command: () => {
    },
  },
]);

function addTask() {
  taskId.value = undefined;
  visibleForm.value = true;
}

function hideForm() {
  taskId.value = undefined;
}

//Filter menu
function updateFilterCondition(newFilter: string) {
  filterCondition.value = filterCondition.value === newFilter ? '' : newFilter;
}

const searchFilters = [
  {
    label: t('work.filter.expireDays', { count: 1 }),
    key: TASK_FILTER_HEADER.expiresIn1Days,
    command: () => updateFilterCondition(TASK_FILTER_HEADER.expiresIn1Days),
  },
  {
    label: t('work.filter.expireDays', { count: 3 }),
    key: TASK_FILTER_HEADER.expiresIn3Days,
    command: () => updateFilterCondition(TASK_FILTER_HEADER.expiresIn3Days),
  },
  {
    label: t('work.filter.expireDays', { count: 7 }),
    key: TASK_FILTER_HEADER.expiresIn7Days,
    command: () => updateFilterCondition(TASK_FILTER_HEADER.expiresIn7Days),
  },
  {
    label: t('work.filter.expire'),
    key: TASK_FILTER_HEADER.expire,
    command: () => updateFilterCondition(TASK_FILTER_HEADER.expire),
  },
  {
    label: t('work.filter.done'),
    key: TASK_FILTER_HEADER.done,
    command: () => updateFilterCondition(TASK_FILTER_HEADER.done),
  },
];

const filterRef = ref<InstanceType<typeof Menu> | null>(null);
sort.value = [{
  property: '',
  direction: Direction.DESC
}];
//Sort menu
const sortMap = computed<Record<string, Order & { icon: string }>>({
  get() {
    return associate(sort.value, (item) => [
      item.property,
      {
        property: item.property,
        direction: item.direction,
        icon:
            item.direction == Direction.ASC
              ? 'pi-sort-amount-up'
              : 'pi-sort-amount-down',
      },
    ]);
  },
  set(value) {
    const rs: Order[] = [];
    Object.values(value).forEach((value) => {
      rs.push({
        property: value.property,
        direction: value.direction,
      });
    });
    sort.value = rs;
  },
});

function toggleSort(field: string) {
  const currentSort = sortMap.value[field];
  if (!currentSort) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.ASC,
        icon: 'pi-sort-amount-up',
      },
    };
  } else if (currentSort.direction === Direction.ASC) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.DESC,
        icon: 'pi-sort-amount-down',
      },
    };
  } else {
    const {
      [field]: _,
      ...rest
    } = sortMap.value;
    sortMap.value = rest;
  }
}

const sortMenu = ref([
  {
    label: t('work.task.sortOptions.orderNo'),
    key: 'orderNo',
    command: () => toggleSort('orderNo'),
  },
  {
    label: t('work.task.sortOptions.lastModifiedTime'),
    key: 'lastModifiedTime',
    command: () => toggleSort('lastModifiedTime'),
  },
  {
    label: t('work.task.sortOptions.name'),
    key: 'name',
    command: () => toggleSort('name'),
  },
  {
    label: t('work.task.sortOptions.percent'),
    key: 'percent',
    command: () => toggleSort('percent'),
  },
  {
    label: t('work.task.sortOptions.remainTime'),
    key: 'remainTime',
    command: () => toggleSort('remainTime'),
  },
]);

const exportMenu = ref([
  {
    label: 'Kết xuất tất cả',
    key: 'all',
    command: () => exportExcel(),
  },
  {
    label: 'Chọn trường cần xuất',
    key: 'select',
    command: () => {
    },
  },
]);

const exportLoading = ref<boolean>(false);
const exportExcel = () => {
  exportLoading.value = true;
  exportExcelTasks(props.searchInput).then((value: any) => {
    if (value) {
      downloadFile(value.data, 'Danh sách công việc.xlsx');
    }
  }).finally(() => exportLoading.value = false);
};

const sortRef = ref<InstanceType<typeof Menu> | null>(null);
const exportRef = ref<InstanceType<typeof Menu> | null>(null);

const tabMenuProgress = ref<ButtonModelType[]>([
  {
    code: TaskRoleFilter.ALL,
    label: t('work.task.filterOptions.all'),
  },
  {
    code: TaskRoleFilter.IMPLEMENT,
    label: t('work.task.filterOptions.implement'),
  },
  {
    code: TaskRoleFilter.ASSIGN,
    label: t('work.task.filterOptions.assign'),
  },
  {
    code: TaskRoleFilter.FOLLOW,
    label: t('work.task.filterOptions.follow'),
  },
  // {
  //   code: TaskRoleFilter.MY_DEPT,
  //   label: t('Phòng của tôi'),
  //   command: () => {
  //     changeTabCommand([TaskRoleFilter.MY_DEPT]);
  //   }
  // },
]);
watch(selectedButtonModel, value => {
  if (!value) {
    selectedButtonModel.value = tabMenuProgress.value[0];
  }
}, {
  immediate: true,
  once: true
});

const showShortCut = computed(() => {
  return selectedButtonModel.value?.code == TaskRoleFilter.ASSIGN;
});

function reload() {
  emits('reload');
}

const filterDeadlineExtensionState = ref<boolean>(false);

function filterDeadlineExtension() {
  filterDeadlineExtensionState.value = !filterDeadlineExtensionState.value;
  emits('filterDeadlineExtension', filterDeadlineExtensionState.value);
}

const filterEvaluateState = ref<boolean>(false);

function filterEvaluate() {
  filterEvaluateState.value = !filterEvaluateState.value;
  emits('filterEvaluate', filterEvaluateState.value);
}
</script>

<style lang='scss' scoped>
.hide-today button:first-of-type {
  visibility: hidden !important
}
:deep(.p-button-group .p-button:first-of-type:not(:only-of-type)) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
:deep(.p-button-group .p-button:not(:first-of-type):not(:last-of-type)) {
  border-radius: 0 !important;
}
:deep(.p-button-group .p-button:last-of-type:not(:only-of-type)) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

:deep(.p-calendar .p-inputtext) {
  padding: 0.5rem 0.75rem !important;
}
</style>
