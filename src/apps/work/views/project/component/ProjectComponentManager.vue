<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t(`work.project.${component.toLowerCase()}`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-medium p-2'
          icon='add'
          :label="t('common.create')"
          @click='showFormCreate'/>
        <ButtonIcon
          class='focus:shadow-none font-normal hover:surface-200'
          icon='restart_alt'
          :label="t('common.refresh')"
          outlined
          @click='reload'/>
        
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      row-hover
      :total-records='totalRecords'
      :value='data'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column
        field='name'
        :header='t(`work.project.${component.toLowerCase()}`)'>
      </Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`">{{
              t(
                `common.statuses.${status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`,
              )
            }}</span>
        </template>
      </Column>

      <Column
        class='text-center'
        :header="t('common.action')"
        style='width: 20%'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <ProjectComponentForm
    v-if='showForm'
    :id='selectedRow?.id'
    :component='component'
    :is-detail='isDetail'
    :is-sidebar='false'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import type Button from 'primevue/button';
import Column from 'primevue/column';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProjectGroup, searchByProjectGroup, } from '@/apps/work/api/graphql/projectGroup';
import { deleteProjectType, searchByProjectType, } from '@/apps/work/api/graphql/projectType';
import { type Edge, ProjectComponent } from '@/apps/work/model/project';
import ProjectComponentForm from '@/apps/work/views/project/component/ProjectComponentForm.vue';
import { ACTIVITY_STATUSES, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  component: {
    type: String as PropType<ProjectComponent>,
    required: true,
  },
});
const searchTerm = inject('searchTerm', ref(''));
const showForm = ref(false);
const data = ref<{ id: string; name: string }[]>([]);
const selectedRow = ref();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const menuRef = ref();
const isDetail = ref(false);
const confirm = useConfirm();

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: Direction.DESC,
    },
  ],
});

const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
});

const showFormCreate = () => {
  selectedRow.value = undefined;
  showForm.value = true;
};

const {
  onResult: getResult,
  refetch: getRefetch
} =
  props.component === ProjectComponent.TYPE
    ? searchByProjectType(searchParams)
    : searchByProjectGroup(searchParams);
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  props.component === ProjectComponent.TYPE
    ? deleteProjectType()
    : deleteProjectGroup();

const { t } = useI18n();

function toggleActionMenu(event: Event, data: { id: string; name: string }) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
});

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  getRefetch(searchParams);
}

const type = {
  TYPE: 'data.searchByProjectType',
  GROUP: 'data.searchByProjectGroup',
};

getResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, type[`${props.component}`], {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: Edge) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: Edge) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

const menuActions = [
  {
    key: 'detail',
    label: t('common.viewMore'),
    icon: 'visibility',
    command: () => {
      isDetail.value = true;
      showForm.value = true;
    },
  },
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirmDelete();
    },
  },
];

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

function hideDialogFn() {
  showForm.value = false;
  isDetail.value = false;
  selectedRow.value = undefined;
  reload();
}

const handleDelete = () => {
  deleteMutate({ id: selectedRow.value?.id }).then(() => {
    reload();
  });
};

const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t(`work.project.${props.component.toLowerCase()}`),
      itemName: selectedRow.value?.name,
    }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept: () => {
      handleDelete();
    },
  });
};
</script>

<style scoped></style>
