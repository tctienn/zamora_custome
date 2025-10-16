<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:expandedRowGroups='expandedRowGroups'
    v-model:selection='selectedRow'
    class='full-height-table sticky-rowheader'
    expandable-row-groups
    :group-rows-by='groupField'
    :row-class='getRowClass'
    row-group-mode='subheader'
    row-hover
    scroll-height='calc(100vh - 12rem)'
    :show-gridlines='true'
    sort-mode='single'
    :sort-order='1'
    :value='data'>
    <template #groupheader='slotProps'>
      <span class='font-bold line-height-3 ml-2 vertical-align-middle'>{{
        groupField === 'organizationId' ? findOrganizationName(slotProps.data.organizationId)?.name : slotProps.data.hospitalCode
      }}</span>
    </template>
    <Column
      :field='groupField'
      header=''></Column>
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
      field='fullName'
      header='Họ và tên '
      style='width: 20vw'>
      <template #body='{data}'>
        <div class='align-items-center flex gap-2'>
          <HrmAvatar
            :avatar='generateAvatarUrl(data["avatar"])'
            class='border-round-sm cursor-pointer'
            width='2.5rem'/>
          <span class='font-semibold white-space-nowrap'>
            {{ data.fullName }}
          </span>
        </div>
      </template>
    </Column>
    <Column
      field='jobTitle'
      header='Chức vụ'
      style='width: 16vw'></Column>
    <Column
      class='text-center'
      field='employee.joinDate'
      header='Ngày vào'
      style='width: 8vw'>
      <template #body='{ data }'>
        {{ data.joinDate && moment(data.joinDate).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='codeBHXH'
      header='Mã số BHXH'
      style='width: 17vw'>
    </Column>
    <Column
      class='text-center'
      field='cardNumBHYT'
      header='Số thẻ BHYT'
      style='width: 17vw'></Column>
    <Column
      class='text-right'
      field='paymentLevel'
      :header="t('hrm.insurance.paymentLevel')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentLevel) }}
      </template>
    </Column>
    <Column
      class='text-right'
      field='paymentBHXH'
      :header="t('hrm.insurance.paymentBHXH')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentBHXH) }}
      </template>
    </Column>
    <Column
      class='text-right'
      field='paymentBHYT'
      :header="t('hrm.insurance.paymentBHYT')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentBHYT) }}
      </template>
    </Column>
    <Column
      class='text-right'
      field='paymentBHTN'
      :header="t('hrm.insurance.paymentBHTN')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentBHTN) }}
      </template>
    </Column>
    <Column
      class='text-right'
      field='paymentBHTNLD'
      :header="t('hrm.insurance.paymentBHTNLĐ')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentBHTNLD) }}
      </template>
    </Column>
    <Column
      class='text-right'
      field='paymentTotal'
      :header="t('hrm.insurance.paymentTotal')"
      style='width: 15vw'>
      <template #body='{ data }'>
        {{ formatNumberVN(data.paymentTotal) }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='dateCreated'
      :header="t('hrm.insurance.dateCreated')"
      style='width: 10vw'>
      <template #body='{ data }'>
        {{ data.dateCreated && moment(data.dateCreated).format('MM/YYYY') }}
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

    <ColumnGroup
      v-if='totalData'
      type='footer'>
      <Row>
        <Column
          :colspan='6'
          footer='Tổng cộng:'
          footer-style='text-align:left'/>
        <Column
          :footer='formatNumberVN(totalData.paymentLevel)'
          footer-style='text-align:right'/>
        <Column
          :footer='formatNumberVN(totalData.paymentBHXH)'
          footer-style='text-align:right'/>
        <Column
          :footer='formatNumberVN(totalData.paymentBHYT)'
          footer-style='text-align:right'/>
        <Column
          :footer='formatNumberVN(totalData.paymentBHTN)'
          footer-style='text-align:right'/>
        <Column
          :footer='formatNumberVN(totalData.paymentBHTNLD)'
          footer-style='text-align:right'/>
        <Column
          :footer='formatNumberVN(totalData.paymentTotal)'
          footer-style='text-align:right'/>
        <Column footer=''/>
        <Column footer=''/>
      </Row>
    </ColumnGroup>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <InsuranceCoverageFormEdit
    v-if='showInsuranceCoverageForm'
    :id='selectedRow.insuranceByMonthId'
    :full-name='selectedRow.fullName'
    :visible-dialog='showInsuranceCoverageForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>

import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getInsuranceByMonth, getTotalInsuranceByMonth } from '@/apps/hrm/api/graphql/insurance';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { SearchInsurance } from '@/apps/hrm/model/insurance';
import InsuranceCoverageFormEdit from '@/apps/hrm/views/insurance/components/InsuranceCoverageFormEdit.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { assignIfExists } from '@/common/helpers/utils';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  groupField: {
    type: String,
    default: 'organizationId'
  },
});
const emits = defineEmits(['hide-dialog']);
const searchTerm = inject('searchTerm', ref(''));
const selectedRow = ref();
const { t } = useI18n();
const menuRef = ref();
const filter = reactive<SearchInsurance>({});
const expandedRowGroups = ref();
const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
});
const searchParam = reactive({
  searchInsurance: filter,
  month: props.month,
  year: props.year,
  pageable: pageable
});
const canLoadMore = ref(true);
const isLoadMore = ref(true);

const {
  onResult: getInsuranceByMonthResult,
  refetch: getInsuranceByMonthRefetch,
  load: getInsuranceByMonthLoad
} = getInsuranceByMonth();

watch(searchTerm, (newValue) => {
  pageable.page = 0;
  data.value = [];
  searchParam.searchInsurance.keyword = newValue;
  getInsuranceByMonthRefetch(searchParam);
});

const {
  onResult: getTotalInsuranceByMonthResult,
  refetch: getTotalInsuranceByMonthRefetch
} = getTotalInsuranceByMonth({
  searchInsurance: searchParam.searchInsurance,
  month: props.month,
  year: props.year
});
const organizations = ref<any[]>([]);
getAllOrganizationGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic || [];
});
const findOrganizationName = (id: string) => {
  return organizations.value.find((item: any) => item.id === id);
};

const totalData = ref<any>(null);

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
  getInsuranceByMonthRefetch(searchParam);
  getTotalInsuranceByMonthRefetch({
    searchInsurance: searchParam.searchInsurance,
    month: props.month,
    year: props.year
  });
});

getTotalInsuranceByMonthResult((res) => {
  totalData.value = res.data.getTotalInsuranceByMonth;
});

watch(
  () => [props.month, props.year],
  ([newMonth, newYear]) => {
    searchParam.pageable.page = 0;
    searchParam.month = newMonth;
    searchParam.year = newYear;
    getInsuranceByMonthRefetch(searchParam);
    getTotalInsuranceByMonthRefetch({
      searchInsurance: searchParam.searchInsurance,
      month: newMonth,
      year: newYear
    });
  }
);

const { moment } = useMoment();
const showInsuranceCoverageForm = ref(false);
const data = ref<any[]>([]);

function hideDialogFn() {
  showInsuranceCoverageForm.value = false;
  emits('hide-dialog');
  searchParam.pageable.page = 0;
  getInsuranceByMonthRefetch(searchParam);
}

getInsuranceByMonthResult((res) => {
  const { edges } = get(res, 'data.getInsuranceByMonth', { edges: [], });
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

function formatNumberVN(value: number): string {
  return value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '';
}

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      showInsuranceCoverageForm.value = true;
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
    pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  getInsuranceByMonthLoad(null, searchParam);
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

function refetchTable() {
  searchParam.pageable.page = 0;
  getInsuranceByMonthRefetch(searchParam);
}

const getRowClass = (rowData: any) => {
  return rowData.id === selectedRow.value?.id ? 'highlight-row' : '';
};
defineExpose({ refetchTable });
</script>

<style scoped>
:deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}
</style>