<template>
  <DataTable
    v-if='showType === ShowTypes[ShowTypes.DATA_LIST]'
    v-model:expanded-row-groups='expandedRowGroups'
    context-menu
    :expandable-row-groups='selectedGroup !== "noGroup"'
    :group-rows-by='selectedGroup'
    row-group-mode='subheader'
    :row-hover='true'
    show-gridlines
    :sort-field='selectedGroup'
    sort-mode='single'
    :sort-order='1'
    :value='selectedGroup === "implementer" ? tasksDataGroupImplementer : tasksData'
    v-bind='selectedGroup === "noGroup" ? DEFAULT_DATATABLE_CONFIG : ""'
    @row-contextmenu='toggleMenu($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <span class='font-bold ml-2 text-white text-xl'>
          {{ t('work.tableTitle') }}</span>
        <div class='align-items-center column-gap-2 flex flex-wrap'>
          <ButtonIconDropdown
            v-tooltip.left='t("common.groupRow")'
            icon='tab_group'
            :options='listGroup'
            :selected-option='selectedGroup'
            @update-selected-group='updateSelectedGroup'/>

          <ButtonIconDropdown
            v-tooltip='t("work.showType.title")'
            icon='preview'
            :options='showTypeOptions'
            :selected-option='showType'
            @update-selected-group='updateShowType'/>

          <FilterTableColumn
            v-tooltip='t("common.displayColumns")'
            :columns='columns'
            icon='view_week'
            :selected-columns='selectedColumns'
            @on-toggle='onToggle'/>
        </div>
      </div>
    </template>

    <template
      v-if='selectedGroup !== "noGroup"'
      #groupheader='{data}'>
      <span
        v-if='selectedGroup === "implementer"'
        class='font-bold line-height-3 ml-2'>
        <AppUser
          :infos='["email"]'
          :overlay-visible='false'
          :user='users.find(u => u.id === data[selectedGroup])'/>
      </span>
      <span
        v-else-if='selectedGroup === "assignerId"'
        class='font-bold line-height-3 ml-2'>
        <AppUser
          v-if='data[selectedGroup]'
          :infos='["email"]'
          :overlay-visible='false'
          :user='users.find(u => u.id === data[selectedGroup])'/>
        <span
          v-else
          class='font-bold line-height-3 ml-2'>{{ t('common.noData') }}</span>
      </span>

      <span
        v-else>
        <span
          v-if='!data[selectedGroup]'
          class='font-bold line-height-3 ml-2'>{{ t('common.noData') }}</span>
        <span
          v-else
          class='font-bold line-height-3 ml-2'>{{ data[selectedGroup] }}</span>

      </span>
    </template>

    <Column
      class='bg-transparent text-color'
      field='ordinalNumber'
      header='#'
      style='min-width: 4rem'>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='name'
      :header='t("work.name")'
      style='min-width: 20rem'>
      <template #body='{data: {name, statusId, isImportantValue, comment, dueTime, labels, id}}'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <span
            class='cursor-pointer white-space-pre-wrap word-break-break-word'
            :class='{
              "line-through text-red-500": statusId === cancelledStatus?.id,
              "text-red-500": dueTime && new Date(dueTime) < new Date() && statusId !== completedStatus?.id,
            }'
            :style='{color: `#${statusesObject[statusId]?.color}`}'
            @click='showTaskDetail(id)'>{{ name }}</span>
          <AppIcon
            v-if='isImportantValue'
            name='error'/>
          <AppIcon
            v-if='comment'
            name='chat_bubble'/>
        </div>
        <div class='ml-2 mt-3'>
          <WorkLabel :model-value='labels'/>
        </div>
      </template>
    </Column>

    <Column
      v-if='selectedColumns.map(i=>i.code).includes("type")'
      class='bg-transparent text-color'
      field='type'
      :header='t("work.type")'
      style='min-width: 8rem'>
      <template #body='{data: {type}}'>
        {{ type }}
      </template>
    </Column>

    <Column
      v-if='selectedColumns.map(i=>i.code).includes("progress")'
      class='bg-transparent text-color text-right'
      field='progress'
      :header='t("work.progress")'>
      <template #body='{data: {percent}}'>
        {{ isNumber(percent) ? `${percent}%` : '-' }}
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='assignerId'
      :header='t("work.assigner")'>
      <template #body='{data: {assignerId, assignerName}}'>
        <AppGroupAvatar
          v-if='assignerId'
          :users='[{id: assignerId, fullName:assignerName }]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='supervisor'
      :header='t("work.supervisor")'>
      <template #body='{data}'>
        <AppGroupAvatar
          v-if='data[ParticipantType[ParticipantType.SUPERVISOR]]'
          :users='data[ParticipantType[ParticipantType.SUPERVISOR]]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      v-if='selectedGroup !== "implementer"'
      class='bg-transparent text-color'
      field='IMPLEMENTER'
      :header='t("work.implementer")'>
      <template #body='{data}'>
        <AppGroupAvatar
          v-if='data[ParticipantType[ParticipantType.IMPLEMENTER]]'
          :users='data[ParticipantType[ParticipantType.IMPLEMENTER]]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      v-if='selectedGroup === "implementer"'
      class='bg-transparent text-color'
      field='implementer'
      :header='t("work.implementer")'>
      <template #body='{data}'>
        <AppGroupAvatar
          v-if='data[ParticipantType[ParticipantType.IMPLEMENTER]]'
          :users='data[ParticipantType[ParticipantType.IMPLEMENTER]]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='statusName'
      :header='t("common.status")'
      style='min-width: 8rem'>
      <template #body='{data: {statusId, statusName}}'>
        <span
          class='white-space-pre-wrap word-break-break-word'
          :style='{color: `#${statusesObject[statusId]?.color}`}'>{{ statusName }}</span>
      </template>
    </Column>
    <Column
      class='bg-transparent text-center text-color'
      field='startTime'
      :header='t("common.startDate")'>
      <template #body='{data: {startTime}}'>
        {{ moment(startTime).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='bg-transparent text-center text-color'
      field='deadLine'
      :header='t("work.deadline")'
      style='min-width: 8rem'>
      <template #body='{data: {dueTime}}'>
        {{ dueTime ? moment(dueTime).format('DD/MM/YYYY') : '-' }}
      </template>
    </Column>
    <Column
      v-for='col of selectedColumnsFilter'
      :key='col.code'
      class='bg-transparent text-color'
      :field='col.code'
      :header='t(`work.${col.code}`)'/>
  </DataTable>

  <TreeTable
    v-if='showType === ShowTypes[ShowTypes.TREE_SELECT]'
    v-model:expanded-keys='expendedKeys'
    filter-mode='lenient'
    :filters='filterTasks'
    :row-hover='true'
    show-gridlines
    :value='taskDataTree'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <span class='font-bold ml-2 text-white text-xl'>
          {{ t('work.tableTitle') }}</span>
        <div class='align-items-center flex flex-wrap'>
          <ButtonIconDropdown
            v-tooltip.top='t("work.showType.title")'
            icon='preview'
            :options='showTypeOptions'
            :selected-option='showType'
            @update-selected-group='updateShowType'/>
          <FilterTableColumn
            v-tooltip.top='t("common.displayColumns")'
            :columns='columns'
            icon='view_week'
            :selected-columns='selectedColumns'
            @on-toggle='onToggle'/>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {itemType: toLower(t('work.myWork'))})
      }}</span>
    </template>

    <Column
      class='bg-transparent flex text-color'
      expander
      field='name'
      :header='t("work.name")'>
      <template #body='{node:{data: {name, statusId, isImportantValue, comment, dueTime, labels}}}'>
        <div class='flex flex-column'>
          <div class='align-items-center column-gap-2 flex flex-row'>
            <span
              class='white-space-pre-wrap word-break-break-word'
              :class='{
                "line-through text-red-500": statusId === cancelledStatus?.id,
                "text-red-500": dueTime && new Date(dueTime) < new Date() && statusId !== completedStatus?.id
              }'
              :style='{color: `#${statusesObject[statusId]?.color}`}'>{{ name }}</span>
            <AppIcon
              v-if='isImportantValue'
              name='error'/>
            <AppIcon
              v-if='comment'
              name='chat_bubble'/>
          </div>
          <div class='chip-container'>
            <Chip
              v-for='(task, index) in labels'
              :key='index'
              class='mr-2 mt-1'
              :label='task.labelTitle'
              :outlined='true'
              :style="{
                backgroundColor: 'white',
                border: '1px solid ' + task.labelColor,
                color: task.labelColor,
                height: '20px',
                fontSize: '12px',
              }"/>
          </div>
        </div>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='type'
      :header='t("work.type")'>
      <template #body='{node:{data: {isRepeat}}}'>
        {{ isRepeat }}
      </template>
    </Column>

    <Column
      class='bg-transparent text-color text-right'
      field='progress'
      :header='t("work.progress")'>
      <template #body='{node:{data: {percent}}}'>
        {{ isNumber(percent) ? `${percent}%` : '-' }}
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='assigner'
      :header='t("work.assigner")'>
      <template #body='{node:{data: {assignerId, assignerName}}}'>
        <AppGroupAvatar
          v-if='assignerId'
          :users='[{id: assignerId, fullName:assignerName }]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='supervisor'
      :header='t("work.supervisor")'>
      <template #body='{node:{data}}'>
        <AppGroupAvatar
          v-if='data[ParticipantType[ParticipantType.SUPERVISOR]]'
          :users='data[ParticipantType[ParticipantType.SUPERVISOR]]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='implementer'
      :header='t("work.implementer")'>
      <template #body='{node:{data}}'>
        <AppGroupAvatar
          v-if='data[ParticipantType[ParticipantType.IMPLEMENTER]]'
          :users='data[ParticipantType[ParticipantType.IMPLEMENTER]]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      class='bg-transparent text-color'
      field='statusName'
      :header='t("common.status")'>
      <template #body='{node:{data: {statusId, statusName}}}'>
        <span
          class='white-space-pre-wrap word-break-break-word'
          :style='{color: `#${statusesObject[statusId]?.color}`}'>{{ statusName }}</span>
      </template>
    </Column>
    <Column
      class='bg-transparent text-center text-color'
      field='startTime'
      :header='t("common.startDate")'>
      <template #body='{node:{data: {startTime}}}'>
        {{ moment(startTime).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='bg-transparent text-center text-color'
      field='deadLine'
      :header='t("work.deadline")'>
      <template #body='{node:{data: {dueTime}}}'>
        {{ dueTime ? moment(dueTime).format('DD/MM/YYYY') : '-' }}
      </template>
    </Column>
    <Column
      v-for='col of selectedColumnsFilter'
      :key='col.code'
      class='bg-transparent text-color'
      :field='col.code'
      :header='t(`work.${col.code}`)'/>
  </TreeTable>

  <WorkDetailComponent
    v-if='workDetailDialogVisible'
    :dialog-visible='workDetailDialogVisible'
    @hide-dialog='workDetailDialogVisible = false'/>
</template>

<script lang='ts' setup>
import { camelCase, cloneDeep, find, get, groupBy, isNumber, keyBy, map, omit, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableRowContextMenuEvent } from 'primevue/datatable';
import type { TreeTableExpandedKeys } from 'primevue/treetable';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskGraphql } from '@/apps/work/api/graphql/task-api';
import { StatusType, type TaskStatusCount } from '@/apps/work/model/configWorkStatus';
import type { Work } from '@/apps/work/model/task';
import { ParticipantType, ShowTypes } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import WorkLabel from '@/apps/work/views/actions/components/task/WorkLabel.vue';
import WorkDetailComponent from '@/apps/work/views/actions/WorkDetail.vue';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIconDropdown from '@/common/components/custom/ButtonIconDropdown.vue';
import FilterTableColumn from '@/common/components/custom/ButtonIconMultiSelect.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree, mapEnum } from '@/common/helpers/utils';
import { User } from '@/common/model/User';

const props = defineProps({
  tasks: {
    type: Array as PropType<Work[]>,
    default: () => []
  },
  columns: {
    type: Array as PropType<{ code: string, name: string }[]>,
    default: () => []
  },
  selectedColumns: {
    type: Array as PropType<{ code: string, name: string }[]>,
    default: () => []
  },
  selectedColumnsFilter: {
    type: Array as PropType<{ code: string, name: string }[]>,
    default: () => []
  },
});

const emits = defineEmits(['update-columns']);
const { moment } = useMoment();
const { t } = useI18n();
const { statusesCount } = storeToRefs(useTaskStore());

const statusesObject = computed((): { [key: string]: TaskStatusCount } => keyBy(statusesCount.value, 'id'));
const cancelledStatus = computed((): TaskStatusCount | undefined => find(statusesCount.value, ['type', StatusType.CANCELED]));
const completedStatus = computed((): TaskStatusCount | undefined => find(statusesCount.value, ['type', StatusType.COMPLETED]));
const selectedGroup = ref('noGroup');
const expendedKeys = ref<TreeTableExpandedKeys>({} as TreeTableExpandedKeys);
const expandedRowGroups = ref();
const filterTasks = ref<{ [key: string]: string }>({});
const users = ref<User[]>([]);
const listGroup = ref([
  {
    value: 'noGroup',
    label: t('work.noGroup')
  },
  {
    value: 'type',
    label: t('work.type')
  },
  {
    value: 'statusName',
    label: t('common.status')
  },
  {
    value: 'implementer',
    label: t('work.implementer')
  },
  {
    value: 'assignerId',
    label: t('work.assignerId')
  }
]);

const showType = ref(ShowTypes[ShowTypes.DATA_LIST]);
const workDetailDialogVisible = ref(false);
const showTypeOptions = map(mapEnum(ShowTypes), (type) => ({
  value: type,
  label: t(`work.showType.${camelCase(type)}`)
}));

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});

const tasksData = computed(() => map(props.tasks, (task, index) => {
  const participants = groupBy(map(task.participants, (participant) => ({
    id: participant.participantId,
    fullName: participant.participantName,
    avatar: participant.participantAvatar,
    email: participant.participantEmail,
    type: participant.type
  })).sort((a, b) => a.fullName && b.fullName ? a.fullName.localeCompare(b.fullName) : 0), 'type');
  return omit({
    ...task,
    ...participants,
    ordinalNumber: index + 1,
    completionTime: task.completionTime ? moment(task.completionTime).format('DD/MM/YYYY') : '',
    isEvaluated: task.isEvaluated ? t(`work.isEvaluated.${task.isEvaluated}`) : '',
    autoProgress: t(`common.boolean.${task.autoProgress}`),
    remind: t(`common.boolean.${task.remind}`),
    needEvaluate: t(`common.boolean.${task.needEvaluate}`),
    isRepeat: t(`common.boolean.${task.isRepeat}`),
    isImportant: t(`common.boolean.${task.isImportant}`),
    isImportantValue: task.isImportant,
  }, ['participants']);
}));
const tasksDataGroupImplementer = computed(() => {
  const result: Work[] = [];
  props.tasks.forEach((t) => {
    t.participants?.forEach((i) => {
      if (i.type === ParticipantType[ParticipantType.IMPLEMENTER]) {
        const taskCopy = {
          ...t,
          implementer: [{
            id: i.participantId,
            fullName: i.participantName
          }]
        };
        result.push(taskCopy);
      }
    });
  });
  return result;
});

const taskDataTree = computed(() => listToTree(tasksData.value.map(task => ({
  key: task.id,
  data: task,
  parentId: task.parentId,
  children: []
})), {
  id: 'key',
  parentId: 'parentId',
  children: 'children'
}));

// TODO: A Trung làm hộ em context menu của Tree Table
function toggleMenu(e: DataTableRowContextMenuEvent) {
  EventBus.emit('toggleTaskMenu', {
    event: e.originalEvent,
    task: props.tasks.find(i => i.id === e.data.id)
  });
}

function showTaskDetail(id: string) {
  getTaskGraphql(id || '')
    .onResult(a => {
      useTaskDetailStore().task = cloneDeep<Work>(a.data.task);
      workDetailDialogVisible.value = true;
    });
}

function updateSelectedGroup(value: string) {
  selectedGroup.value = value;
}

function updateShowType(value: string) {
  showType.value = value;
}

const onToggle = (val: { code: string, name: string }[]) => {
  emits('update-columns', val);
};

watch(() => selectedGroup.value, (newValue) => {
  switch (newValue) {
  case 'statusName':
    expandedRowGroups.value = tasksData.value.map(task => task.statusName);
    break;
  default:
  }
});

</script>

<script lang='ts'>
export default { name: 'WorkDataListView' };
</script>

<style lang='scss' scoped>
.chip-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 300px;
  overflow: hidden;
}

:deep(.p-rowgroup-header) {

  & > td {
    span {
      display: inline-block;
    }
  }
}
</style>