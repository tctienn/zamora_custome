<template>
  <DataTable
    v-model:selection='selectedRow'
    :row-class='getRowClass'
    row-hover
    v-bind='DEFAULT_DATATABLE_CONFIG'
    scroll-height='calc(100vh - 12rem)'
    :value='data'>
    <Column
      class='text-center'
      header='TT'
      style='width: 2%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='employee.fullName'
      header='Họ và tên'
      style='width: 15vw'>
      <template #body='{data}'>
        <div
          v-if='data.employee'
          class='align-items-center flex gap-2'>
          <HrmAvatar
            :avatar='generateAvatarUrl(data.employee["avatar"])'
            class='border-round-sm cursor-pointer'
            width='2.5rem'/>
          <span class='font-semibold white-space-nowrap'>
            {{ data.employee.fullName }}
          </span>
        </div>
      </template>
    </Column>
    <Column
      field='employee.code'
      header='Mã nhân sự'
      style='width: 10vw'></Column>
    <Column
      field='employee.positionName'
      header='Chức vụ'
      style='width: 25vw'></Column>
    <Column
      class='text-center'
      field='employee.joinDate'
      header='Ngày vào'
      style='width: 8vw'>
      <template #body='{ data }'>
        {{ data.employee?.joinDate && moment(data.employee.joinDate).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='codeBHXH'
      header='Mã số BHXH'
      style='width: 14vw'>
    </Column>
    <Column
      class='text-center'
      field='cardNumBHYT'
      header='Số thẻ BHYT'
      style='width: 14vw'></Column>
    <Column
      class='text-center'
      field='createdTime'
      header='TG tham gia '
      style='width: 13vw'>
      <template #body='{ data }'>
        {{ data.socialInsuranceParticipation && moment(data.socialInsuranceParticipation).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='hospitalCode'
      header='Nơi ĐK khám chữa bệnh'
      style='width: 30vw'></Column>
    <Column
      class='text-center'
      field='status'
      :header="t('common.status')"
      style='width: 15vw'>
      <template #body='{ data: { status } }'>
        <Badge
          v-if='status'
          class='py-0 status-badge'
          :severity='status === "PAYING" ? "success": "danger"'
          :value='t(`hrm.insurance.${status}`)'></Badge>
      </template>
    </Column>
    <Column
      class='text-center'
      field='createdBy'
      :header="t('hrm.insurance.createdBy')"
      style='width: 10vw'>
      <template #body='{ data }'>
        <div class='align-items-center flex justify-content-between'>
          <div></div>
          <AppUser
            :user-id='data.createdBy'/>
          <AppIcon
            class='cursor-pointer'
            name='more_vert'
            size='1.5'
            @click='toggleActionMenu($event, data)'/>
        </div>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <InsuranceForm
    v-if='showForm'
    :id='selectedRow.employeeId'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>

import { get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { deleteInsurance, searchInsurance } from '@/apps/hrm/api/graphql/insurance';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { SearchInsurance } from '@/apps/hrm/model/insurance';
import InsuranceForm from '@/apps/hrm/views/insurance/components/InsuranceForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { assignIfExists } from '@/common/helpers/utils';
import { useGlobalSearchStore } from '@/common/store/search';

const emits = defineEmits(['hide-dialog']);
const searchTerm = inject('searchTerm', ref(''));
const selectedRow = ref();
const { t } = useI18n();
const menuRef = ref();
const hasPermission = usePermissionStore().hasPermission;
const showForm = ref(false);

const { moment } = useMoment();
const data = ref<any>([]);
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
});
const canLoadMore = ref(true);
const isLoadMore = ref(true);

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const filter = reactive<SearchInsurance>({});

const searchParam = reactive({
  searchInsurance: filter,
  pageable: pageable
});

const {
  onResult: searchInsuranceResult,
  refetch: searchInsuranceRefetch,
  load: searchInsuranceLoad
} = searchInsurance();

watch(searchTerm, (newValue) => {
  searchParam.pageable.page = 0;
  data.value = [];
  searchParam.searchInsurance.keyword = newValue;
  searchInsuranceRefetch(searchParam);
});

const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
watch(submit, () => {
  pageable.page = 0;
  data.value = [];
  searchParam.searchInsurance = { ...model.value };
  if (model.value.organizationId) {
    const orgKey = Object.keys(model.value.organizationId)[0];
    assignIfExists(searchParam.searchInsurance, 'organizationId', orgKey);
  }
  model.value.dateFrom && assignIfExists(searchParam.searchInsurance, 'dateFrom', moment(model.value.dateFrom).format(
    DateTimeFormat.ISO_LOCAL_DATE));
  model.value.dateTo && assignIfExists(searchParam.searchInsurance, 'dateTo', moment(model.value.dateTo).format(
    DateTimeFormat.ISO_LOCAL_DATE));
  searchInsuranceRefetch(searchParam);
});

searchInsuranceResult((res) => {
  const { edges } = get(res, 'data.searchInsurance', { edges: [], });
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: any) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

onMounted(() => {
  searchInsuranceLoad(null, searchParam);
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

function refetchTable() {
  searchParam.pageable.page = 0;
  searchInsuranceRefetch();
}

function hideDialogFn() {
  searchParam.pageable.page = 0;
  showForm.value = false;
  searchInsuranceRefetch();
  emits('hide-dialog');
}

const menuActions = [
  {
    key: 'edit',
    visible: hasPermission('/HRM/HRM_INSURANCE/HRM_INSURANCE_GENERAL/UPDATE'),
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    visible: hasPermission('/HRM/HRM_INSURANCE/HRM_INSURANCE_GENERAL/DELETE'),
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDeleteMedia();
    },
  },
];
const confirm = useConfirm();
const {
  mutate: deleteInsuranceMutate,
  onDone: deleteInsuranceOnDone
} =
  deleteInsurance();

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.employee.fullName }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteInsurance();
    },
  });
};

const handleDeleteInsurance = () => {
  deleteInsuranceMutate({ id: selectedRow.value?.id });
};

deleteInsuranceOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  searchParam.pageable.page = 0;
  searchInsuranceRefetch();
});
const getRowClass = (rowData: any) => {
  return rowData.employeeId === selectedRow.value?.employeeId ? 'highlight-row' : '';
};

defineExpose({ refetchTable });
</script>

<style scoped>
:deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}

:deep(.status-badge) {
  text-transform: unset !important;
}
</style>