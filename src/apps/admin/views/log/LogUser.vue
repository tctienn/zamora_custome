<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.log.logUser') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-2'>
        <Button
          class='focus:shadow-none font-normal h-full hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'
          @click='exportExcel'></Button>
      </div>
    </template>
  </Toolbar>
  <DataTable
    class='h-full overflow-auto'
    row-hover
    scroll-height='flex'
    scrollable
    :style="{
      'max-height': { viewHeight },
    }"
    :total-records='totalRecords'
    :value='logs'
    @sort='onSort($event)'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('admin.log.module')) })
      }}</span>
    </template>

    <Column
      body-class='justify-content-center text-center'
      :header='t("common.ordinalNumber")'>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>

    <Column
      :header='t("admin.log.user")'
      :sortable='true'>
      <template #body='{data: {userId}}'>
        <AppUser
          name-visible
          :user-id='userId'/>
      </template>
    </Column>

    <Column
      field='module'
      :header='t("admin.log.module")'
      :sortable='true'>
    </Column>

    <Column
      field='function'
      :header='t("admin.log.function")'
      :sortable='true'>
      <template #body='{data}'>
        <span
          :class='`function-${toLower(data.function)}`'>{{
          t(`common.functions.${toLower(data.function)}`)
        }}</span>
      </template>
    </Column>

    <Column
      field='action'
      :header='t("admin.log.action")'
      :sortable='true'>
      <template #body='{data: {action}}'>
        <span :class='`action-${toLower(action)}`'>{{
          t(`common.actionsUserLog.${toLower(action)}`)
        }}</span>
      </template>
    </Column>

    <Column
      field='time'
      :header='t("admin.log.time")'
      :sortable='true'>
      <template #body='{data: {time}}'>
        {{ moment(time).format('HH:mm DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='objectName'
      :header='t("admin.log.objectName")'
      :sortable='true'>
    </Column>

    <Column
      field='ip'
      :header='t("admin.log.ip")'
      :sortable='true'>
    </Column>
  </DataTable>
  <LogUserForm
    v-if='logUserFormVisible'
    :item='logAction'
    :visible-dialog='logUserFormVisible'
    @hide-dialog='hideLogUserFormDialog'/>
</template>

<script setup lang='ts'>
import { assign, get, throttle, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getLogUserGraphql } from '@/apps/admin/api/graphql/log-user-graphql-api';
import type { LogAction, LogEdge } from '@/apps/admin/model/log';
import type { UserEdge, UserInterface } from '@/apps/admin/model/User';
import LogUserForm from '@/apps/admin/views/log/LogUserForm.vue';
import { exportExcel } from '@/apps/meeting/api/rest/meetingApi';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastWarn } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const logs = ref<any[]>([]);
const totalRecords = ref(0);
const searchKeyword = ref('');
const logUserFormVisible = ref(false);
const logAction = ref<LogAction>();
const { moment } = useMoment();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'time',
    direction: Direction.DESC
  }]
});
const searchParams = reactive(
  {
    keyword: '',
    pageable: pageable
  }
);
let currentParams = { ...searchParams };
const {
  onResult: getLogUserResult,
  refetch: getRefetch,
  variables: getLogVariable
} = getLogUserGraphql(searchParams);

getLogUserResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.logs', {
    totalCount: 0,
    edges: [],
  });
  logs.value = [...logs.value, ...edges.map((edge: LogEdge) => edge.node)];
  totalRecords.value = totalCount;
});

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]
  });
  assign(searchParams, pageable);
  reload();
}

function hideLogUserFormDialog() {
  logUserFormVisible.value = false;
  getRefetch(currentParams);
}

function scrollEvent(e: Event) {
  e.target instanceof HTMLElement
  && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
  && moreUsers();
}

function moreUsers() {
  if (logs.value.length >= totalRecords.value) {
    return;
  }
  searchParams.pageable.page++;
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener(
      'scrollend',
      throttle(scrollEvent, 2000),
    );
  }
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

function calculateHeight() {
  const height = window.innerHeight - 143;
  return `${height}px`;
}

function reload() {
  logs.value = [];
  pageable.page = 0;
  getLogVariable.value = searchParams;
}

const viewHeight = ref(calculateHeight());
const exportExcel = () => {
  toastWarn({ message: 'Chức năng sắp ra mắt' });
};
</script>

<script lang='ts'>
export default { name: 'LogUser' };
</script>

<style scoped>

</style>
