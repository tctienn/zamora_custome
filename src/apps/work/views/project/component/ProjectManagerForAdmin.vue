<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('Danh sách dự án') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='restart_alt'
          :label='t("common.refresh")'
          outlined
          @click='refetch'/>
        <ButtonGroup>
          <Button
            class='focus:shadow-none font-medium p-2'
            icon='pi pi-list'
            icon-size='1.5'
            :label='"Xem theo"'
            outlined
            @click='viewTypeRef?.toggle'/>

          <Button
            class='focus:shadow-none font-medium p-2'
            icon='pi pi-sort'
            icon-size='1.5'
            :label='"Sắp xếp"'
            outlined
            @click='sortRef?.toggle'/>
        </ButtonGroup>
      </div>
    </template>
  </Toolbar>
  <Sidebar
    v-model:visible='visibleForm'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "40vw"}}'
    :header='`${projectId ? t("work.common.update") : t("work.common.create")} ${t(`work.common.project`)}`'
    :modal='true'
    position='right'
    @hide='()=> closeDialog()'>
    <FormProject
      :id='projectId'
      @hide-dialog='()=> closeDialog()'>
    </FormProject>
  </Sidebar>
  <div class='flex flex-column gap-2'>
    <div class='flex justify-content-start'>
      <TabMenu
        v-if='showRow == "list"'
        class='w-full'
        :model='statusOptions'
        @tab-change='changeStatus($event)'>
      </TabMenu>
    </div>
  </div>

  <ProjectGridItem
    v-if='showRow == "list"'
    :is-admin='true'
    :loading='loading'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectKanban
    v-if='showRow == "kanban"'
    :is-admin='true'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectGroupItem
    v-if='showRow == "group"'
    :expand-column='expandGroupNames'
    :is-admin='true'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectGroupItem
    v-if='showRow == "type"'
    :expand-column='expandTypeNames'
    :group-field='"typeName"'
    :is-admin='true'
    :projects='projects'
    @refresh='refetch'/>

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='flex gap-1 p-2'>
        <AppIcon
          class='mr-2'
          name='check'
          size='1.5'
          :style='{opacity:viewType==itemProp.item.key?1:0,
                   color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>

  <Menu
    ref='sortRef'
    :model='sortMenu'
    popup>

    <template #item='itemProp'>
      <div class='flex gap-1 p-2'>
        <div
          class='justify-content-center pi text-xl'
          :class='sortMap?.[itemProp.item?.key||""]?.icon ??"pi-sort-amount-down"'
          :style='{opacity:sort.length>0 && sort[0].property==itemProp.item.key?1:0,
                   color: sort.length > 0 && sort[0].property == itemProp.item.key ? "#0d99ff" : ""}'>
        </div>

        <div
          :style='{color: sort.length > 0 && sort[0].property == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import type Menu from 'primevue/menu';
import { computed, inject, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getProjectForAdminGraphql, getProjectGraphql } from '@/apps/work/api/graphql/project';
import { useProjectStore } from '@/apps/work/store/project';
import FormProject from '@/apps/work/views/project/component/FormProject.vue';
import ProjectGridItem from '@/apps/work/views/project/component/ProjectGridItem.vue';
import ProjectGroupItem from '@/apps/work/views/project/component/ProjectGroupItem.vue';
import ProjectKanban from '@/apps/work/views/project/component/ProjectKanban.vue';
import { FilterType, StatusProject } from '@/apps/work/views/project/model';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { associate } from '@/common/helpers/extension/array.extension';
import { Direction, type Order } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const sortRef = ref<InstanceType<typeof Menu> | null>(null);
const {
  sort,
  projects
} = storeToRefs(useProjectStore());
const totalFilter = ref();
const totalAdmin = ref();
const totalImplement = ref();
const totalFollow = ref();
const totalOrganization = ref();
type ViewType = 'list' | 'kanban' | 'group' | 'type';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const totalUnderConstruction = ref();
const totalPrepareForDeployment = ref();
const totalProcessing = ref();
const totalCompleted = ref();
const totalPause = ref();
const totalCancel = ref();
const totalClose = ref();
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showRow = ref<string>('list');
const expandGroupNames = ref();
const expandTypeNames = ref();
const searchParams = ref({
  projectStatus: StatusProject.ALL.toString(),
  filterType: FilterType.ALL.toString()
});

const projectId = ref();
const {
  onResult,
  load,
  loading,
  refetch
} = getProjectForAdminGraphql(searchTerm.value, searchParams.value.projectStatus);
const data = ref();

const sortMap = computed<Record<string, Order & { icon: string }>>({
  get() {
    return associate(sort.value, item => [item.property, {
      property: item.property,
      direction: item.direction,
      icon: item.direction == Direction.ASC ? 'pi-sort-amount-up' : 'pi-sort-amount-down'
    }]);
  },
  set(value) {
    const rs: Order[] = [];
    Object.values(value).forEach((value) => {
      rs.push({
        property: value.property,
        direction: value.direction
      });
    }
    );
    sort.value = rs;
  }
});

onResult((res) => {
  data.value = [];
  data.value = res.data.getProjectsForAdmin.projects;
  totalFilter.value = res.data.getProjectsForAdmin.totalFilter;
  totalAdmin.value = res.data.getProjectsForAdmin.totalAdmin;
  totalImplement.value = res.data.getProjectsForAdmin.totalImplement;
  totalFollow.value = res.data.getProjectsForAdmin.totalFollow;
  totalOrganization.value = res.data.getProjectsForAdmin.totalOrganization;
  totalUnderConstruction.value = res.data.getProjectsForAdmin.totalUnderConstruction;
  totalPrepareForDeployment.value = res.data.getProjectsForAdmin.totalPrepareForDeployment;
  totalProcessing.value = res.data.getProjectsForAdmin.totalProcessing;
  totalCompleted.value = res.data.getProjectsForAdmin.totalCompleted;
  totalPause.value = res.data.getProjectsForAdmin.totalPause;
  totalCancel.value = res.data.getProjectsForAdmin.totalCancel;
  totalClose.value = res.data.getProjectsForAdmin.totalClose;
  projects.value = cloneDeep(data.value);
  expandTypeNames.value = Array.from(new Set(projects.value.map(project => project.typeName)));
  expandGroupNames.value = Array.from(new Set(projects.value.map(project => project.groupName)));
});

load(undefined, {
  keyword: searchTerm.value,
  projectStatus: searchParams.value.projectStatus
});

function openForm(id?: string | undefined) {
  projectId.value = id;
  visibleForm.value = true;
}

function changeStatus(event: any) {
  if (event.index == 0) {
    searchParams.value.projectStatus = StatusProject.ALL;
  } else if (event.index == 1) {
    searchParams.value.projectStatus = StatusProject.UNDER_CONSTRUCTION;
  } else if (event.index == 2) {
    searchParams.value.projectStatus = StatusProject.PREPARE_FOR_DEPLOYMENT;
  } else if (event.index == 3) {
    searchParams.value.projectStatus = StatusProject.PROCESSING;
  } else if (event.index == 4) {
    searchParams.value.projectStatus = StatusProject.COMPLETED;
  } else if (event.index == 5) {
    searchParams.value.projectStatus = StatusProject.PAUSE;
  } else if (event.index == 6) {
    searchParams.value.projectStatus = StatusProject.CANCEL;
  } else if (event.index == 7) {
    searchParams.value.projectStatus = StatusProject.CLOSE;
  }

  changeFilter();
}

function closeDialog() {
  projectId.value = null;
  visibleForm.value = false;
  refetch();
}

provide('openForm', openForm);

const statusOptions = computed(() => [
  {
    label: t('work.project.statusOptions.all') + ' ('
        + (totalUnderConstruction.value + totalPrepareForDeployment.value + totalProcessing.value + totalCompleted.value + totalPause.value + totalCancel.value) + ')',
    value: StatusProject.ALL
  },
  {
    label: t('work.project.statusOptions.underConstruction') + ' (' + totalUnderConstruction.value + ')',
    value: StatusProject.UNDER_CONSTRUCTION
  },
  {
    label: t('work.project.statusOptions.prepareForDeployment') + ' (' + totalPrepareForDeployment.value + ')',
    value: StatusProject.PREPARE_FOR_DEPLOYMENT
  },
  {
    label: t('work.project.statusOptions.processing') + ' (' + totalProcessing.value + ')',
    value: StatusProject.PROCESSING
  },
  {
    label: t('work.project.statusOptions.completed') + ' (' + totalCompleted.value + ')',
    value: StatusProject.COMPLETED
  },
  {
    label: t('work.project.statusOptions.pause') + ' (' + totalPause.value + ')',
    value: StatusProject.PAUSE
  },
  {
    label: t('work.project.statusOptions.cancel') + ' (' + totalCancel.value + ')',
    value: StatusProject.CANCEL
  },
  {
    label: t('work.project.statusOptions.close') + ' (' + totalClose.value + ')',
    value: StatusProject.CLOSE
  }
]);

const filterOptions = ref([
  {
    label: t('work.project.filterOptions.all'),
    value: FilterType.ALL
  },
  {
    label: t('work.project.filterOptions.admin'),
    value: FilterType.ADMIN
  },
  {
    label: t('work.project.filterOptions.implement'),
    value: FilterType.IMPLEMENT
  },
  {
    label: t('work.project.filterOptions.follow'),
    value: FilterType.FOLLOW
  }
]);

const viewTypeMenu = ref([
  {
    label: 'Danh sách',
    key: 'list',
    command: () => {
      viewType.value = 'list';
      showRow.value = 'list';
    },
  }, {
    label: 'Kanban',
    key: 'kanban',
    command: () => {
      viewType.value = 'kanban';
      showRow.value = 'kanban';
    },
  }, {
    label: 'Nhóm dự án',
    key: 'group',
    command: () => {
      viewType.value = 'group';
      showRow.value = 'group';
    },
  }, {
    label: 'Loại dự án',
    key: 'type',
    command: () => {
      viewType.value = 'type';
      showRow.value = 'type';
    },
  }
]);

function changeFilter() {
  load(undefined, {
    keyword: searchTerm.value,
    projectStatus: searchParams.value.projectStatus
  });
}

watch(searchTerm, (newValue) => {
  load(undefined, {
    keyword: newValue,
    projectStatus: searchParams.value.projectStatus
  });
});

function toggleSort(field: string) {
  const currentSort = sortMap.value[field];
  if (!currentSort) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.ASC,
        icon: 'pi-sort-amount-up'
      },
    };
  } else if (currentSort.direction === Direction.ASC) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.DESC,
        icon: 'pi-sort-amount-down'
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
    label: t('Theo số thứ tự từ cao xuống thấp'),
    key: 'sequenceNumber',
    command: () => toggleSort('sequenceNumber'),
  },
  {
    label: t('Ngày tạo mới đến cũ'),
    key: 'createdTime',
    command: () => toggleSort('createdTime'),
  }, {
    label: t('Tên từ A đến Z'),
    key: 'name',
    command: () => toggleSort('name'),
  },
  {
    label: t('Ngày cập nhật từ mới đến cũ'),
    key: 'lastModifiedTime',
    command: () => toggleSort('lastModifiedTime'),
  }
]);

const visibleForm = ref<boolean>(false);
</script>

<style scoped>
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1rem !important;
}
</style>

<script lang='ts'>
export default { name: 'ProjectManagerForAdmin' };
</script>