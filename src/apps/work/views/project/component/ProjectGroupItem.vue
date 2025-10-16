<template>
  <div
    class='overflow-auto surface-0'
    style='height: calc(100% - 6rem)'>
    <DataTable
      v-model:expandedRowGroups='expandedRowGroups'
      class='table-group'
      expandable-row-groups
      :group-rows-by='props.groupField'
      :loading='loading'
      row-group-mode='subheader'
      selection-mode='single'
      :sort-field='props.groupField'
      sort-mode='single'
      :sort-order='1'
      :value='projects'
      @row-click='rowClicked'
      @rowgroup-collapse='onRowGroupCollapse'
      @rowgroup-expand='onRowGroupExpand'>
      <template #groupheader='slotProps'>
        <span
          class='font-bold line-height-3 ml-2 vertical-align-middle'
          style='color: #0F6CBD'>{{
            props.groupField == 'groupName' ? (slotProps.data.groupName ? slotProps.data.groupName : 'Không xác định')
            : (slotProps.data.typeName ? slotProps.data.typeName : 'Không xác định')
          }}</span>
      </template>

      <Column
        class='px-3 text-center'
        :header='t("common.ordinalNumber")'
        selection-mode='single'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        class='col-1 p-2'
        field='admins'
        :header='t("work.project.admins")'>
        <template #body='{data: {admins}}'>
          <AppGroupAvatar
            v-if='admins'
            avatar-size='2.5'
            :user-ids='admins?.map((x:any) => x)'/>
        </template>
      </Column>
      <Column
        class='col p-2'
        field='name'
        :header='t("work.project.name")'></Column>
      <Column
        class='col-1 p-0'
        field='code'
        :header='t("work.project.code")'></Column>
      <Column
        class='col-1 p-0'
        field='implementers'
        :header='t("work.project.joiner")'>
        <template #body='{data: {admins, implementers}}'>
          <AppGroupAvatar
            v-if='admins || implementers'
            avatar-size='2.5'
            :user-ids='Array.from(new Set([...admins?.map((x:any) => x),...implementers?.map((x:any) => x)]))'/>
        </template>
      </Column>
      <Column
        class='col-1 p-0 text-center'
        field='totalTask'
        :header='t("work.project.task")'></Column>
      <Column
        class='col-1 p-0'
        field='progress'
        :header='t("work.project.process")'>
        <template #body='{data: {progress}}'>
          <ProgressRing :progress='progress'/>

        </template>
      </Column>
      <Column
        class='col-1 p-0 text-center'
        field='startDate'
        :header='t("work.project.startDate")'>
        <template #body='{data: {startDate}}'>
          {{ startDate ? moment(startDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column
        class='col-1 p-0 text-center'
        field='endDate'
        :header='t("work.project.endDate")'>
        <template #body='{data: {endDate}}'>
          {{ endDate ? moment(endDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column
        class='col-1 p-0'
        field='status'
        :header='t("work.project.status")'>
        <template #body='{data: {status}}'>
          <span
            v-if='status'
            class='status-badge text-white'
            :class='`status-${status?.toString().toLowerCase() || ""}`'>{{
              t(`work.common.table.statuses.${status?.toString().toLowerCase() || ''}`)
            }}</span>
        </template>
      </Column>

      <Column
        v-if='!isAdmin'
        class='col-1 px-0 text-center'
        :header='t("common.action")'>
        <template #body='{data}'>
          <Button
            v-if="!['PAUSE', 'CANCEL', 'CLOSE'].includes(data?.status)"
            v-tooltip.top='t("common.action")'
            icon='pi pi-ellipsis-v'
            rounded
            text
            @click='toggleActionMenu({event : $event, data : data})'></Button>
    
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <ProjectDetail
    v-model:visible='visibleDetail'
    :project-id='selectedProject[0]?.id||""'>
  </ProjectDetail>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import moment from 'moment';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProjectById } from '@/apps/work/api/graphql/project';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Event } from '@/common/model/widget/event';

const props = defineProps({
  projects: {
    type: Array as PropType<ProjectInterface[]>,
    default: () => []
  },
  groupField: {
    type: String,
    default: 'groupName'
  },
  expandColumn: {
    type: Array as PropType<any>,
    default: [] as []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['refresh']);

const openForm = inject('openForm', (id?: string) => void {});
const expandedRowGroups = ref(cloneDeep(props.expandColumn));
const { t } = useI18n();
const project = ref();
const selectedProject = ref([] as ProjectInterface[]);
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} = deleteProjectById();
const onRowGroupCollapse = (event: any) => {
};

const onRowGroupExpand = (event: any) => {
};

function toggleActionMenu({
  event,
  data
}: { event: MouseEvent, data: ProjectInterface }) {
  menuAction.value.toggle(event);
  project.value = cloneDeep(data);
  selectedProject.value = [project.value];
}

const menuAction = ref();
const menuActionCondition = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      openForm(selectedProject.value[0].id);
    }
  },
  {
    label: t('media.common.table.titleSetStatus'),
    icon: 'display_settings'
  },
  {
    label: t('work.project.copyProject'),
    icon: 'content_copy'
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteProject();
    }
  }
];
const menuActions = menuActionCondition;

deleteOnDone((res) => {
  toastSuccess({ message: t('Xóa dự án thành công') });
  emits('refresh');
});

function deleteProject() {
  deleteMutate({ projectId: selectedProject.value[0].id });
}

const visibleDetail = ref<boolean>(false);

function rowClicked(event: DataTableRowClickEvent) {
  selectedProject.value = [event.data];
  visibleDetail.value = true;
}
</script>

<script lang='ts'>
export default { name: 'ProjectGroupItem' };
</script>

<style scoped>
:deep(.table-group  td) {
  padding-top: 6px
}
</style>