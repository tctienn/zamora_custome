<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('work-flow.flow.list') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label="t('common.create')"
          @click='createFlow'/>
        <Button
          class='focus:shadow-none font-medium hover:surface-200 p-2'
          icon='pi pi-file-export'
          :label="t('common.export')"
          @click='exportFlows'/>
      </div>
    </template>
  </Toolbar>
  <div class='flex flex-column h-full surface-0'>
    <!-- TabView for application filter -->
    <TabView
      v-model:activeIndex='activeAppTabIndex'
      @tab-change='onAppTabChange'>
      <TabPanel
        v-for='app in appFilterOptionsWithCount'
        :key='app.code'>
        <template #header>
          <div class='align-items-center flex gap-2 py-1'>
            <span>{{ app.nameWithoutCount }}</span>
            <Badge
              class='align-items-center flex justify-content-center min-w-1rem p-0'
              :value='app.count' />
          </div>
        </template>
        <!-- Tab content is empty as we only need the tabs for filtering -->
      </TabPanel>
    </TabView>
    
    <DataTable
      ref='dataTableRef'
      v-model:selection='selectedFlow'
      :loading='loadingTab'
      row-hover
      scroll-height='calc(100vh - 14rem)'
      scrollable
      selection-mode='single'
      :value='filterFlows'>
      <Column
        body-class='text-center'
        :header='t("common.ordinalNumber")'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        body-class='w-6'
        field='name'
        :header="t('work-flow.flow.flowName')">
        <template #body='{data}'>
          <span
            class='cursor-pointer hover:text-blue-400'
            @click='toEditor({data: data})'>
            {{ data?.name }}
          </span>
        </template>
      </Column>
      <Column
        body-class='text-center'
        field='app'
        :header="t('application.name')"
        header-class='text-center'>
        <template #body='{data}'>
          {{ mapMenuCode?.[data?.app]?.name }}
        </template>
      </Column>
      <Column
        body-class='text-center'
        field='type'
        :header="t('work-flow.flow.flowType')"
        header-class='text-center'>
        <template #body='{ data: data }'>
          {{ mapTypeName[data.type] }}
        </template>
      </Column>
      <Column
        body-class='text-center'
        :header="t('work-flow.flow.orgType')">
        <template #body='{ data: data }'>
          {{ data.orgType ? t(`work-flow.flow.orgTypeTree.${ data.orgType?.toLowerCase() }`) : '' }}
        </template>
      </Column>
      <Column
        body-class='text-center'
        :header="t('common.status')"
        header-class='text-center'>
        <template #body='{data}'>
          <Tag 
            class='border-round-sm px-2 py-1'
            :severity='mapStatus(data.status)?.severity'>
            {{ mapStatus(data.status)?.text }}
          </Tag>
        </template>
      </Column>
      <!--    <Column-->
      <!--      field='description'-->
      <!--      :header="t('work-flow.flow.description')">-->
      <!--      <template #body='{ data, field }'>-->
      <!--        <div-->
      <!--          v-sanitize-html='data[field]'-->
      <!--          class='description'-->
      <!--          style='max-height: 10rem'></div>-->
      <!--      </template>-->
      <!--    </Column>-->
      <Column
        body-class='text-center'
        :header="t('common.action')">
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.5'
            rounded
            text
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
    <div
      v-if='loadingMore'
      class='align-items-center flex justify-content-center p-2'>
      <ProgressSpinner
        stroke-width='4'
        style='width: 30px; height: 30px' />
    </div>
  </div>
  <Menu
    ref='menuAction'
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
  <Sidebar
    v-model:visible='visibleView'
    class='w-10'
    position='right'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-4'
      }
    }"
    :show-close-icon='false'>
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='align-items-center border-round-sm flex justify-content-center'
              icon='arrow_back'
              severity='danger'
              size='small'
              style='width: 30px; height: 30px;'
              @click='visibleView = !visibleView'/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ t('common.status') }} {{selectedFlow?.name || '' }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <WorkFlowView :flow-id="selectedFlow?.id || ''"></WorkFlowView>
  </Sidebar>
  <Sidebar
    v-model:visible='visibleForm'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-4'
      }
    }"
    :show-close-icon='false'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='visibleForm = false'>
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='align-items-center border-round-sm flex justify-content-center'
              icon='arrow_back'
              severity='danger'
              size='small'
              style='width: 30px; height: 30px;'
              @click='visibleForm = !visibleForm'/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ selectedFlow?.id ? t('common.update') : t('common.create') }} {{t(`work-flow.flow.flow`).toLowerCase() }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <WorkFlowForm
      :flow-id='selectedFlow?.id'
      :flow-type-data='flowTypeData'
      @created-success='createdSuccess'
      @hide-dialog='hideFormHandle'>
    </WorkFlowForm>
  </Sidebar>
  <ConfirmDialog
    group='delete'>
    <template #message='{message}'>
      <div class='align-items-center flex flex gap-3 surface-border w-full'>
        <i
          class='text-6xl text-primary-500'
          :class='message.icon'></i>
        <div
          class='white-space-pre-wrap'
          :class='{flex:(selectedFlow?.name?.length||0) <100}'>{{ message.message }}
          <div
            class='font-semibold word-break-break-word'
            style='max-width:50vw'>{{ selectedFlow?.name }}
          </div>
        </div>
      </div>
    </template>

  </ConfirmDialog>
</template>

<script lang='tsx' setup>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Badge from 'primevue/badge';
import Column from 'primevue/column';
import type { DataTableRowDoubleClickEvent } from 'primevue/datatable';
import type Menu from 'primevue/menu';
import ProgressSpinner from 'primevue/progressspinner';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { deleteFlow, search, updateFlow } from '@/apps/work-flow/api/graphql/flow-api';
import { flowTypes } from '@/apps/work-flow/api/rest/flow-register';
import { type FlowInterface } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import WorkFlowForm from '@/apps/work-flow/views/components/WorkFlowForm.vue';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { associateBy } from '@/common/helpers/extension/array.extension';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';
import { useMenuStore } from '@/common/store/menu';

const pageable = reactive<Pageable>({
  page: 0,
  size: 20, // Giảm size để tải từng phần dữ liệu
  sort: [
    {
      property: 'lastModifiedTime',
      direction: Direction.DESC,
    },
    {
      property: 'createdTime',
      direction: Direction.DESC,
    },
  ],
});
const {
  onResult: allFlowsOnResult,
  onError: allFlowsOnError,
  refetch: allFlowsRefetch,
} = search('', pageable);

const router = useRouter();

const { t } = useI18n();

const confirm = useConfirm();
const selectedFlow = ref<FlowInterface>();
const visibleForm = ref<boolean>(false);
const visibleView = ref<boolean>(false);
const flows = ref<FlowInterface[]>([]);

const filterFlows = computed(() => {
  return flows.value.filter(e => appFilter.value == 'ALL' || e.app == appFilter.value);
});
let totalFlows = 0;
allFlowsOnResult((res) => {
  const {
    edges,
    totalCount
  } = get(res, 'data.search', {
    edges: [],
    totalCount: 0,
  });
  totalFlows = totalCount;
  if (edges) {
    // Nếu là trang đầu tiên, thay thế dữ liệu, nếu không thì thêm vào
    if (pageable.page === 0) {
      flows.value = edges.map((e: Edge<FlowInterface>) => ({ ...e.node }));
    } else {
      flows.value = [
        ...flows.value,
        ...edges.map((e: Edge<FlowInterface>) => ({ ...e.node })),
      ];
    }
  }
});

const {
  mutate: deleteFlowMutate,
  loading: isDeleting,
  onError: deleteError,
  onDone: deleteDone,
} = deleteFlow();

flowTypes().then(data => {
  if (data) {
    flowTypeData.value = data;
  }
});

const menuAction = ref();

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: FlowInterface;
}) {
  menuAction.value.toggle(event);
  selectedFlow.value = data;
}

const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      visibleForm.value = true;
    },
  },
  {
    label: `${t('common.view')} ${t('work-flow.flow.flow').toLowerCase()}`,
    icon: 'visibility',
    command: () => {
      visibleView.value = true;
    },
  },
  {
    label: `${t('common.delete')} ${t('work-flow.flow.flow').toLowerCase()}`,
    icon: 'delete',
    command: () => {
      deleteFlowEvent();
    },
  },
];

function deleteFlowEvent() {
  confirm.require(
    {
      group: 'delete',
      icon: 'pi pi-exclamation-triangle',
      header: t('common.confirm'),
      acceptLabel: t('common.delete'),
      acceptClass: 'p-button-danger',
      message: t('common.confirmDeleteType', { itemType: 'quy trình', }),
      defaultFocus: 'reject',
      accept: () => {
        deleteFlowMutate({ id: selectedFlow.value?.id });
      },
    }
  );

}

deleteError((param) => {
  toastError(param);
});
deleteDone((param) => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('work-flow.flow.flow'),
      itemName: selectedFlow.value?.name,
    }),
  });
  flows.value = flows.value.filter((e) => e.id != selectedFlow.value?.id);
});
allFlowsOnError((param) => {
  toastError(param);
});

function hideFormHandle() {
  visibleForm.value = false;
  // Reset pageable về trang đầu tiên
  pageable.page = 0;
  allFlowsRefetch({
    keyword: '',
    pageable: pageable,
  })?.then(() => flows.value = []);
}

function createdSuccess(flowId: string) {
  visibleForm.value = false;
  // Reset pageable về trang đầu tiên
  pageable.page = 0;
  allFlowsRefetch({
    keyword: '',
    pageable: pageable,
  })?.then(() => flows.value = []);
  router.push({
    name: 'AdminWorkFlowConfigView',
    params: { flowId: flowId },
  });
}

function toEditor(event: DataTableRowDoubleClickEvent | {data: FlowInterface}) {
  const flowId = 'data' in event ? event.data.id : (event as DataTableRowDoubleClickEvent).data.id;
  router.push({
    name: 'AdminWorkFlowConfigView',
    params: { flowId: flowId },
  });
}

function createFlow() {
  selectedFlow.value = undefined;
  visibleForm.value = true;
}

function exportFlows() {
  // TODO: Implement export functionality
  console.log('Export flows');
}

const loadingMore = ref<boolean>(false);
const dataTableRef = ref();
const typeData = ref<FlowType[]>([]);
const mapTypeName = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  typeData.value.forEach((type) => {
    map[type.type] = type.name;
  });
  return map;
});

// Mock status data for flows
const mapStatus = (status: string) => {
  if(status === 'ACTIVE') {
    return {
      text: t('common.statuses.active'),
      severity: 'success' 
    };
  } else if(status === 'INACTIVE') {
    return {
      text: t('common.statuses.deactivate'),
      severity: 'info' 
    };
  } else {
    return {
      text: t('common.statuses.undefined'),
      severity: 'warning' 
    };
  }
};
flowTypes().then((data) => {
  if (data) {
    typeData.value = data;
  }
});

function scrollEvent(event: any) {
  const target = event.target;
  if (!target) {
    return;
  }
  
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = target;
  
  // Kiểm tra nếu đã cuộn đến cuối
  if (
    scrollTop + clientHeight >= scrollHeight - 5 // 5px buffer
    && !loadingMore.value
    && flows.value.length < totalFlows
  ) {
    loadingMore.value = true;
    if (pageable) {
      pageable.page += 1;
    }
    allFlowsRefetch?.({
      keyword: searchTerm.value || '',
      pageable: pageable
    })?.finally(() => {
      loadingMore.value = false;
    });
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, (value) => {
  // Reset về trang đầu tiên khi tìm kiếm
  pageable.page = 0;
  allFlowsRefetch({
    keyword: value,
    pageable: pageable,
  })?.then(() => flows.value = []);
});
onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

const { configuredApps } = storeToRefs(useMenuStore());
const mapMenuCode = computed(() =>
  configuredApps.value ? associateBy(configuredApps.value, item => item.code) : {}
);

// Original app filter options
const appFilterOptions = computed(() => [
  {
    code: 'ALL',
    name: t('common.all')
  },
  ...configuredApps?.value ? configuredApps.value.filter(appCode => 
    flowTypeData.value && flowTypeData.value.some(flowType => flowType.app === appCode.code)) : []
]);

// App filter options with count
const appFilterOptionsWithCount = computed(() => {
  return appFilterOptions.value.map(app => {
    // Calculate the number of flows for each application
    const count = app.code === 'ALL' 
      ? flows.value.length 
      : flows.value.filter(flow => flow.app === app.code).length;
    
    // Return object with separate name and count
    return {
      ...app,
      nameWithoutCount: app.name,
      count: count
    };
  });
});

const appFilter = ref<string>('ALL');

// TabView related variables and functions
const activeAppTabIndex = ref<number>(0);
const loadingTab = ref<boolean>(false);

function onAppTabChange(event: any) {
  // Show loading indicator on table
  loadingTab.value = true;
  
  // Simulate loading process
  setTimeout(() => {
    const selectedApp = appFilterOptions.value[event.index];
    if (selectedApp) {
      appFilter.value = selectedApp.code;
    }
    // Hide loading indicator after completion
    setTimeout(() => {
      loadingTab.value = false;
    }, 100);
  }, 300);
}

const flowTypeData = ref<FlowType[]>([]);
</script>

<style scoped>
.description {
  overflow: hidden;

  &:hover {
    overflow: auto;
  }
}

:deep(.p-tabview .p-tabview-panels) {
  padding: 0;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  padding: 5px 7px;
}
</style>
