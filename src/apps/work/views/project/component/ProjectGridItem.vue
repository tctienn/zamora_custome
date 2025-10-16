<template>
  <div
    class='overflow-auto surface-0'
    style='height: calc(100% - 8rem)'>
    <DataTable
      :highlight-on-select='true'
      :loading='loading'
      :row-class='rowClass'
      :row-hover='true'
      scroll-height='flex'
      scrollable
      :selection='selectedProject'
      selection-mode='single'
      table-style='min-width: 50rem'
      :value='props.projects'
      @row-click='rowClicked'>
      <Column
        class='px-3 text-700 text-center'
        :header="t('common.ordinalNumber')">
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
        class='col p-2 text-700'
        field='name'
        :header='t("work.project.name")'>
        <template #body='{data: {name, isImportant}}'>
          <AppIcon
            v-if='isImportant'
            v-tooltip="'Dự án tôi thích'"
            class='cursor-auto'
            :class="isImportant ? 'text-yellow-500' : 'text-black-alpha-20'"
            :fill='!!isImportant'
            name='kid_star'
            size='1'
            text/>
          {{ name }}
        </template>
      </Column>
      <Column
        class='col-1 p-0 text-700'
        field='code'
        :header='t("work.project.code")'></Column>
      <Column
        class='col-1 p-0 text-700'
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
        class='col-1 p-0 text-700 text-center'
        field='totalTask'
        :header='t("work.project.task")'></Column>
      <Column
        class='col-1 p-0 text-700'
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
        class='col-1 p-0 text-center'
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
    :project-id='selectedProject[0]?.id||""'
    @hide='hideDialogDetail'>
  </ProjectDetail>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import moment from 'moment/moment';
import Column from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProjectById } from '@/apps/work/api/graphql/project';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import { type ProjectInterface } from '@/apps/work/views/project/model';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Event } from '@/common/model/widget/event';

const props = defineProps({
  projects: {
    type: Array as PropType<ProjectInterface[]>,
    default: () => []
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

const { t } = useI18n();
const project = ref();
const selectedProject = ref([] as ProjectInterface[]);
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} = deleteProjectById();

function toggleActionMenu({
  event,
  data
}: { event: MouseEvent, data: ProjectInterface }) {
  menuAction.value.toggle(event);
  project.value = cloneDeep(data);
  selectedProject.value = [project.value];
}

const menuAction = ref();
const confirm = useConfirm();
const loadingTable = ref(true);
const menuActionCondition = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      openForm(selectedProject.value[0].id);
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: 'dự án',
          itemName: selectedProject.value[0].name
        }),
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          deleteProject();
        }
      });

    }
  },
];
const menuActions = menuActionCondition;

watchEffect(() => {
  setTimeout(() => {
    loadingTable.value = props.loading;
  }, 1000);
});
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

function hideDialogDetail() {
  emits('refresh');
}

function rowClass(data: any) {
  return !['PAUSE', 'CANCEL', 'COMPLETED', 'CLOSE'].includes(data.status)
  && data.endDate != null
  && new Date(data.endDate) < new Date()
    ? 'background-expire-project'
    : '';
}

</script>

<style>
.expired-row:hover {
  background: #E6EBF4 !important; /* Màu hover */
  color: #000 !important; /* Giữ màu hover */
}
</style>

<script lang='ts'>
export default { name: 'ProjectGridItem' };
</script>