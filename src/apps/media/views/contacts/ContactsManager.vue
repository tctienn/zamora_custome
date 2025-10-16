<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='align-items-center flex gap-2'>
          <ButtonIcon
            v-tooltip.top="t('admin.user.showFollowOrganization')"
            class='align-self-center focus:shadow-none p-1'
            icon='menu'
            rounded
            text
            @click='showFilter = !showFilter'/>
         
          <span class='font-bold'>{{
            t('media.menu.mediaContacts')
          }}</span>
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex flex-warp gap-1 h-3rem mr-1 my-1'>
        <ButtonIcon
          class='focus:shadow-none font-medium p-2'
          icon='order_play'
          :label='t("meeting.calendar.extension")'
          @click='exportDialogVisible = true'/>

        <ButtonIcon
          v-tooltip.top='t("common.refresh")'
          class='focus:shadow-none font-normal hover:surface-200'
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='reload'/>
      </div>
    </template>
  </Toolbar>

  <div class='flex gap-3'>
    <div
      v-if='showFilter'
      class='show-tree'>
      <Tree
        v-model:selectionKeys='selectedOrganization'
        class='h-full overflow-auto'
        :expanded-keys='expandKey'
        selection-mode='single'
        :style='`max-height: calc(100vh - 9rem + 1px)`'
        :value='organizations'>
        <template #default='slotProps'>
          <div
            class='flex justify-content-between'
            :class="
              (slotProps.node.parentId == '' || slotProps.node.parentId == null
                ? 'font-bold'
                : '') +
                ' ' +
                (slotProps.node.status == 'DEACTIVATE' ? 'text-red-500' : '')
            ">
            <div>{{ slotProps.node.label }}</div>
            <div>{{ slotProps.node.countUser }}</div>
          </div>
        </template>
      </Tree>
    </div>

    <div class='w-full'>
      <DataTable
        v-if='showTable'
        v-model:selection='selectedRow'
        class='h-full overflow-auto'
        row-hover
        v-bind='DEFAULT_DATATABLE_CONFIG'
        show-gridlines
        :total-records='totalRecords'
        :value='users'
        @sort='onSort($event)'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t('common.emptyRecords', {
              itemType: toLower(t('admin.user.objectName')),
            })
          }}</span>
        </template>

        <Column
          class='text-center'
          header='TT'>
          <template #body='slotProps'>
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column :header="t('admin.user.username')">
          <template #body='{ data: { id } }'>
            <AppUser
              avatar-size='2.3'
              name-visible
              :user-id='id'/>
          </template>
        </Column>

        <Column :header="t('admin.user.birthDay')">
          <template #body='{ data: { birthDay } }'>
            <div class='text-center'>
              <div>
                {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
              </div>
            </div>
          </template>
        </Column>

        <Column :header="t('admin.user.gender')">
          <template #body='{ data: { gender } }'>
            <div class='text-center'>
              <div>
                {{ gender ? t('admin.user.male') : t('admin.user.female') }}
              </div>
            </div>
          </template>
        </Column>

        <Column :header="t('media.common.position')">
          <template #body='{ data: { positionName } }'>
            <div class='flex gap-3'>
              <div>
                <div>{{ positionName }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="t('admin.user.phone')">
          <template #body='{ data: { phone } }'>
            <div class='flex'>
              <div>
                <div>{{ phone }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="t('admin.user.email')">
          <template #body='{ data: { email } }'>
            <div class='flex'>
              <div>
                <p>{{ email }}</p>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <ExportDialog
    v-if='exportDialogVisible'
    v-model:visibleDialog='exportDialogVisible'
    :export-options='exportOptions'
    :search='{
      keyword: searchParams.keyword,
      organization: searchParams.organization,
    }'
    @hide-dialog='hideExportDialogVisibleDialog'/>
</template>

<script lang='ts' setup>
import { assign, get, throttle, toLower } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { DataTableSortEvent } from 'primevue/datatable';
import { computed, inject, nextTick, onMounted, reactive, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserEdge } from '@/apps/admin/model/User';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { exportExcelContact } from '@/apps/media/api/rest/contactApi';
import { GATEWAY_URL } from '@/common/api/configService';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { listToTree } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n() || {};
const { user } = storeToRefs(useUserStore());
const searchTerm = inject('searchTerm', ref(''));

const showTable = ref(true);

const dataTable = ref(null);
const selectedRow = ref();
const selectedOrganization = ref();
const organizations = ref([]);
let expandKey = {};

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createDate',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  organization: '',
  pageable: pageable,
});
const totalRecords = ref(0);
const users = ref<any[]>([]);
const showFilter = ref(false);
const urlImage = GATEWAY_URL + '/files/preview/';

const {
  onResult: getUserOnResult,
  refetch: getRefetch,
  variables: getUserVariables,
} = getAllUserNotAdminGraphql(searchParams);

const {
  onResult: getAllOrganizationResult,
  refetch: getOrganizationRefetch
} =
    getAllOrganizationGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
  expandKey = createCodeObject(organizations.value);
  organizations.value = listToTree(
    organizations.value.map((organization: OrganizationInterface) => ({
      key: organization.code,
      label: organization.name,
      data: organization.code,
      countUser: organization.users?.length,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

getUserOnResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.getAllUserNotAdmin', {
    totalCount: 0,
    edges: [],
  });
  users.value = [...users.value, ...edges.map((edge: UserEdge) => edge.node)];
  totalRecords.value = totalCount;
});

function createCodeObject(objects: any[]): { [key: string]: boolean } {
  return objects.reduce(
    (acc, obj) => {
      acc[obj.code] = true;
      return acc;
    },
      {} as { [key: string]: boolean },
  );
}

watch(selectedOrganization, (newValue) => {
  reload();
  pageable.page = 0;
  searchParams.organization = Object.keys(newValue).toString();
  getUserVariables.value = searchParams;
});

watch(searchTerm, (newValue) => {
  users.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getUserVariables.value = searchParams;
});

function scrollEvent(e: Event) {
  e.target instanceof HTMLElement
  && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
  && moreUsers();
}

function moreUsers() {
  if (users.value.length >= totalRecords.value) {
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

watch(showTable, (newValue) => {
  reload();
  nextTick(() => {
    if (newValue && dataTable.value) {
      addScrollEventListener('.p-datatable-wrapper');
    } else {
      addScrollEventListener('.data-view-scroll');
    }
  });
});

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

function reload() {
  users.value = [];
  pageable.page = 0;
  getUserVariables.value = searchParams;
  getOrganizationRefetch();
}

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
        direction: sortOrder === 1 ? 'ASC' : 'DESC',
      },
    ],
  });
  assign(searchParams, pageable);
  reload();
}

const exportDialogVisible = ref(false);
const exportOptions = computed(() => {
  const fileName = 'Danh bạ';
  return [
    {
      label: t('document.exportDoc.exportPdf'),
      fileName: fileName + '.pdf',
      exportFunction: () => {
      },
      icon: '/images/file-types/pdf-logo.png',
    },
    {
      label: t('document.exportDoc.exportWord'),
      fileName: fileName + '.docx',
      exportFunction: () => {
      },
      icon: '/images/file-types/word-logo.png',
    },
    {
      label: t('document.exportDoc.exportExcel'),
      fileName: fileName + '.xlsx',
      exportFunction: exportExcelContact,
      icon: '/images/file-types/excel-logo.png',
    },
  ];
});

function hideExportDialogVisibleDialog() {
  exportDialogVisible.value = false;
}
</script>

<script lang='ts'>
export default { name: 'UserManager' };
</script>

<style scoped>
label {
  font-weight: bold;
}

.avatar {
  display: inline-block;
  margin-top: 25px;
}

.avatar-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  color: white;
  font-size: 35px;
}

.data-view-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  height: 80vh;
}

:deep(.p-treenode-label) {
  width: 100%;
}

:deep(.p-tree-selectable) {
  height: 80vh;
}

:deep(.p-tree-selectable:hover) {
  overflow: auto;
}

.show-tree {
  width: 35rem;
}

@media screen and (min-width: 1200px) {
  .show-tree {
    width: 35rem;
  }
}
</style>
