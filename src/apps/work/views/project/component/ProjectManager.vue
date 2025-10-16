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
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label='t("common.create")'
          @click='visibleForm=true'/>

        <div class='flex gap-2'>
          <ButtonGroup>
            <Button
              class='font-normal gap-2 h-full'
              icon='pi pi-list'
              icon-size='1.5'
              :label='"Xem theo"'
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
              class='font-normal h-full'
              icon='pi pi-sort'
              icon-size='1.5'
              :label='"Sắp xếp"'
              outlined
              @click='sortRef?.toggle'/>
          </ButtonGroup>
        </div>

        <ButtonIcon
          v-tooltip.top='t("common.refresh")'
          class='focus:shadow-none font-normal hover:surface-200'
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='refetch'/>
      </div>
    </template>
  </Toolbar>

  <Sidebar
    v-model:visible='visibleForm'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "50rem"}}'
    class='custom-sidebar'
    :dismissable='false'
    :modal='true'
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
    }'
    :show-close-icon='false'
    @hide='()=> closeDialog()'>
    <template #header>
      <div class='w-full'>
        <div class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 w-full'>
          <div class='align-items-center flex gap-1 max-h-3rem'>
            <Button
              class='border-round-sm h-2rem mr-2 py-1 w-2rem'
              icon='pi pi-arrow-left'
              severity='danger'
              @click='closeDialog'/>
          </div>
          <div class='flex justify-content-between w-full'>
            <span class='font-bold text-lg'>
              {{ projectId ? t("work.common.update") : t("work.common.create") }} {{t(`work.common.project`) }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <FormProject
      :id='projectId'
      @hide-dialog='()=> closeDialog()'>
    </FormProject>
  </Sidebar>
  <div class='flex flex-column gap-2'>
    <div class='border-1 border-300 border-round-sm flex justify-content-between p-2 surface-0'>

      <SelectButton
        v-model='searchParams.filterType'
        class='border-none'
        option-label='label'
        option-value='value'
        :options='filterOptions'
        :pt='{
          button: {
            style: {
              padding: "5px",
              borderRadius: "4px",
            }
          }
        }'
        @change='changeFilter'>
        <template #option='slotProps'>
          <b
            v-if='slotProps.index == 0'
            class='flex gap-2'>
            <div class='align-content-center'>{{ slotProps.option.label }}</div>
            <div
              class='number-project'>{{ totalFilter }}
            </div>
          </b>

          <b
            v-if='slotProps.index == 1'
            class='flex gap-2'>
            <div class='align-content-center'>{{ slotProps.option.label }}</div>
            <div
              class='number-project'>{{ totalAdmin }}
            </div>
          </b>

          <b
            v-if='slotProps.index == 2'
            class='flex gap-2'>
            <div class='align-content-center'>{{ slotProps.option.label }}</div>
            <div
              class='number-project'>{{ totalImplement }}
            </div>
          </b>

          <b
            v-if='slotProps.index == 3'
            class='flex gap-2'>
            <div class='align-content-center'>{{ slotProps.option.label }}</div>
            <div
              class='number-project'>{{ totalFollow }}
            </div>
          </b>
        </template>
      </SelectButton>
    </div>
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
    :loading='loading'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectKanban
    v-if='showRow == "kanban"'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectGroupItem
    v-if='showRow == "group"'
    :expand-column='expandGroupNames'
    :projects='projects'
    @refresh='refetch'/>

  <ProjectGroupItem
    v-if='showRow == "type"'
    :expand-column='expandTypeNames'
    :group-field='"typeName"'
    :projects='projects'
    @refresh='refetch'/>

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
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
      <div class='cursor-pointer flex gap-1 p-2'>
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
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import type Menu from 'primevue/menu';
import { computed, inject, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllLabelGraphql } from '@/apps/work/api/graphql/label-api';
import { getProjectGraphql } from '@/apps/work/api/graphql/project';
import { getAllActiveProjectGroup } from '@/apps/work/api/graphql/projectGroup';
import { getAllActiveProjectType } from '@/apps/work/api/graphql/projectType';
import { useProjectStore } from '@/apps/work/store/project';
import FormProject from '@/apps/work/views/project/component/FormProject.vue';
import ProjectGridItem from '@/apps/work/views/project/component/ProjectGridItem.vue';
import ProjectGroupItem from '@/apps/work/views/project/component/ProjectGroupItem.vue';
import ProjectKanban from '@/apps/work/views/project/component/ProjectKanban.vue';
import { FilterType, optionsRecipe, StatusProject } from '@/apps/work/views/project/model';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import { associate } from '@/common/helpers/extension/array.extension';
import { Direction, type Order } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const sortRef = ref<InstanceType<typeof Menu> | null>(null);
const {
  sort,
  projects
} = storeToRefs(useProjectStore());
const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const totalFilter = ref(0);
const totalAdmin = ref(0);
const totalImplement = ref(0);
const totalFollow = ref(0);
const totalOrganization = ref(0);
type ViewType = 'list' | 'kanban' | 'group' | 'type';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const totalUnderConstruction = ref(0);
const totalPrepareForDeployment = ref(0);
const totalProcessing = ref(0);
const totalCompleted = ref(0);
const totalPause = ref(0);
const totalCancel = ref(0);
const totalClose = ref(0);
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const showRow = ref<string>('list');
const expandGroupNames = ref();
const expandTypeNames = ref();
const labels = ref([]);
const moreInfoStore = useUserMoreInfoStore();
const projectTypes = ref();
const projectGroups = ref();
moreInfoStore.fetchAllUsers();
const searchParams = ref({
  projectStatus: StatusProject.ALL.toString(),
  filterType: FilterType.ALL.toString(),
  searchProjectPayload: {} as any
});

const projectId = ref();
const {
  onResult,
  load,
  loading,
  refetch,
  onError
} = getProjectGraphql(searchTerm.value, searchParams.value.projectStatus, searchParams.value.filterType, searchParams.value.searchProjectPayload);

getAllLabelGraphql().onResult((res) => labels.value = res.data.getAllLabel);

getAllActiveProjectType().onResult((res) => projectTypes.value = res.data.getAllActiveProjectType);

getAllActiveProjectGroup().onResult((res) => projectGroups.value = res.data.getAllActiveProjectGroup);

onError((err) => {
  toastError({ message: t('work.project.errors.' + err.graphQLErrors[0].extensions.errorCode) });
});
const data = ref();

const sortMap = computed<Record<string, Order & { icon: string }>>({
  get() {
    return associate(sort.value, item => [item.property, {
      property: item.property ? item.property : '',
      direction: item.direction ? item.direction : Direction.DESC,
      icon: item.direction == Direction.ASC ? 'pi-sort-amount-up' : 'pi-sort-amount-down'
    }]);
  },
  set(value) {
    const rs: Order[] = [];
    Object.values(value).forEach((value) => {
      rs.push({
        property: value.property ? value.property : '',
        direction: value.direction ? value.direction : Direction.DESC
      });
    }
    );
    sort.value = rs;
  }
});

onResult((res) => {
  data.value = res.data.getProjects.projects;
  totalFilter.value = res.data.getProjects.totalFilter;
  totalAdmin.value = res.data.getProjects.totalAdmin;
  totalImplement.value = res.data.getProjects.totalImplement;
  totalFollow.value = res.data.getProjects.totalFollow;
  totalOrganization.value = res.data.getProjects.totalOrganization;
  totalUnderConstruction.value = res.data.getProjects.totalUnderConstruction;
  totalPrepareForDeployment.value = res.data.getProjects.totalPrepareForDeployment;
  totalProcessing.value = res.data.getProjects.totalProcessing;
  totalCompleted.value = res.data.getProjects.totalCompleted;
  totalPause.value = res.data.getProjects.totalPause;
  totalCancel.value = res.data.getProjects.totalCancel;
  totalClose.value = res.data.getProjects.totalClose;
  projects.value = cloneDeep(data.value);
  expandTypeNames.value = Array.from(new Set(projects.value.map(project => project.typeName)));
  expandGroupNames.value = Array.from(new Set(projects.value.map(project => project.groupName)));

  sortMap.value = {
    'createdTime': {
      'property': '',
      'direction': Direction.DESC,
      'icon': 'pi-sort-amount-up'
    }
  };
});

load(undefined, {
  keyword: searchTerm.value,
  projectStatus: searchParams.value.projectStatus,
  filterType: searchParams.value.filterType,
  searchProjectPayload: searchParams.value.searchProjectPayload
});

function openForm(id?: string | undefined) {
  projectId.value = id;
  visibleForm.value = true;
}

watch(submit, () => {
  searchParams.value.searchProjectPayload = cloneDeep({
    ...model.value,
    fromDate: model.value.fromDate
      ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    toDate: model.value.toDate
      ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
    createDate: model.value.createDate
      ? moment(model.value.createDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null
  });
  load(undefined, {
    keyword: searchTerm.value,
    projectStatus: searchParams.value.projectStatus,
    filterType: searchParams.value.filterType,
    searchProjectPayload: cloneDeep({
      ...model.value,
      fromDate: model.value.fromDate
        ? moment(model.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null,
      toDate: model.value.toDate
        ? moment(model.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null,
      createDate: model.value.createDate
        ? moment(model.value.createDate).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null
    })
  });
});

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
        + (totalUnderConstruction.value + totalPrepareForDeployment.value + totalProcessing.value
            + totalCompleted.value + totalPause.value + totalCancel.value + totalClose.value) + ')',
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
    projectStatus: searchParams.value.projectStatus,
    filterType: searchParams.value.filterType,
    searchProjectPayload: searchParams.value.searchProjectPayload
  });
}

watch(searchTerm, (newValue) => {
  load(undefined, {
    keyword: newValue,
    projectStatus: searchParams.value.projectStatus,
    filterType: searchParams.value.filterType,
    searchProjectPayload: searchParams.value.searchProjectPayload
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

watch(labels, () => {
  setFields({
    label: {
      col: 12,
      // optionsDropdown: labels.value?.map((label: any) => ({
      //   name: label.labelTitle,
      //   id: label.id
      // })),

      label: 'Nhãn',
      type: String,
      optionsDropdown: labels.value?.map((label: any) => ({
        name: label.labelTitle,
        id: label.id
      })),
      isMultiSelect: true,
    },
    admin: {
      label: 'Người quản trị',
      col: 12,
      isChooseUser: true,
    },
    implementer: {
      label: 'Người thực hiện',
      col: 12,
      isChooseUser: true,
    },
    follower: {
      label: 'Người theo dõi',
      col: 12,
      isChooseUser: true,
    },
    fromDate: {
      label: 'Ngày bắt đầu',
      type: String,
      isDatePicker: true,
      col: 6,
    },
    toDate: {
      label: 'Ngày kết thúc',
      type: String,
      isDatePicker: true,
      col: 6,
    },
    createDate: {
      label: 'Ngày tạo',
      type: String,
      col: 12,
      isHidden: true,
      isDatePicker: true,
    },
    projectName: {
      isHidden: true,
      label: 'Tên dự án',
      col: 12,
    },
    projectCode: {
      isHidden: true,
      label: 'Mã dự án',
      col: 12
    },
    projectType: {
      label: 'Loại dự án',
      col: 12,
      isHidden: true,
      optionsDropdown: projectTypes,
    },
    projectGroup: {
      label: 'Nhóm dự án',
      col: 12,
      isHidden: true,
      optionsDropdown: projectGroups
    },
    recipe: {
      label: 'Cách tính tiến độ',
      col: 12,
      isHidden: true,
      optionsDropdown: optionsRecipe.map((recipe) => ({
        name: recipe.label,
        id: recipe.value
      }))
    },
    creator: {
      label: 'Người tạo',
      col: 12,
      isChooseUser: true,
      isHidden: true,
    },

    splitButton: {
      label: '',
      col: 3,
      isSplitButton: true,
    }
  });
});

const visibleForm = ref<boolean>(false);
</script>

<style scoped>
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
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1rem !important;
}
</style>

<script lang='ts'>
export default { name: 'ProjectManager' };
</script>