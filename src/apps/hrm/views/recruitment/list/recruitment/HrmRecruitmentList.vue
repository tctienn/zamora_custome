<template>
  <div>
    <TabMenu
      class='tab-menu-pagination'
      :model='menus'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
          <Badge
            v-if='item["count"]'
            :class="{
              'text-white': item['severity'] === 'secondary',
            }"
            :severity="item['severity']"
            :value='item["count"]'></Badge>
        </div>
      </template>
    </TabMenu>
    <HrmRecruitmentListTable
      v-model:canLoadMore='canLoadMore'
      :is-loading='isLoading'
      :on-load-more='loadNextPage'
      :recruitments='recruitments'
      :total-record='totalRecord'/>
  </div>
</template>

<script setup lang='ts'>
import camelcase from 'camelcase';
import { get } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { provide, reactive, watch } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import { countAllRecruitmentProposalAndByEachStatus, searchRecruitmentProposal } from '@/apps/hrm/api/graphql/recruitment';
import { type Recruitment, RecruitmentStatus } from '@/apps/hrm/model/recruitment';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

import HrmRecruitmentListTable from './HrmRecruitmentListTable.vue';
const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const isRefresh = inject('isRefresh', ref(false));
const isLoadMore = ref<boolean>(true);
const canLoadMore = ref<boolean>(true);
const recruitments = ref<Recruitment[]>([]);
const isLoading = ref<boolean>(true);
const totalRecord = ref<number>();

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});

const searchInput = reactive<{
  textSearch: string;
  sortBy?: string;
  sortDirection?: string;
  status: RecruitmentStatus | null;
}>({
  textSearch: '',
  status: null,
  sortBy: '',
  sortDirection: ''
});
const searchParams = reactive({
  searchRecruitmentProposalReq: searchInput,
  pageable: pageable,
});

const {
  onResult: getRecruitmentResult,
  refetch: getRecruitmentRefetch,
  onError: getRecruitmentError
} =
  searchRecruitmentProposal(searchParams);

const {
  onResult: onCountStatusResult,
  refetch: countStatusRefetch
} = countAllRecruitmentProposalAndByEachStatus();

watch(searchTerm, (newValue) => {
  searchParams.searchRecruitmentProposalReq.textSearch = newValue;
  isLoading.value = true;
  getRecruitmentRefetch(searchParams);
});

watch(isRefresh, () => {
  refetchData();
  isRefresh.value = false;
});

getRecruitmentResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchRecruitmentProposal', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    recruitments.value = [
      ...recruitments.value,
      ...content,
    ];
  } else {
    recruitments.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getRecruitmentError(()=>{
  isLoading.value = false;
});
function refetchData() {
  searchParams.searchRecruitmentProposalReq.textSearch = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getRecruitmentRefetch(searchParams);
  countStatusRefetch();
}

function loadNextPage() {
  searchParams.pageable.page += 1;
  isLoadMore.value = true;
}

onCountStatusResult((res) => {
  const counts = res.data?.countAllRecruitmentProposalAndByEachStatus || {};
  menus.forEach(m => {
    m.count = counts[m.code as keyof typeof counts] || 0;
  });
});

const menus = reactive<MenuItem[]>(createMenus());
function createMenus(): MenuItem[] {
  const severities = ['secondary', 'info', 'primary', 'success'];
  const map = Object.keys(RecruitmentStatus).map((s, index) => ({
    label: t(`hrm.recruitment.statusOptions.${s}`),
    code: camelcase(s),
    severity: severities[index % severities.length],
    command: () => {
      searchParams.searchRecruitmentProposalReq.status =
    s == 'TOTAL_ALL' ? null : (s as RecruitmentStatus);
    },
  }));
  return map;
}

provide('refetchData', refetchData);
provide('searchInput', searchInput);
</script>