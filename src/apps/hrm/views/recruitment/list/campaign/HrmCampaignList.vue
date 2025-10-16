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
    <HrmCampaignListTable
      v-model:canLoadMore='canLoadMore'
      :campaigns='campaigns'
      :is-loading='isLoading'
      :on-load-more='loadNextPage'
      :total-record='totalRecord'/>
  </div>
</template>

<script setup lang='ts'>
import camelcase from 'camelcase';
import { get } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { inject, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { countAllRecruitmentCampaignAndByEachStatus, searchRecruitmentCampaign } from '@/apps/hrm/api/graphql/campaign';
import { type Campaign, CampaignStatus } from '@/apps/hrm/model/compaign';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

import HrmCampaignListTable from './HrmCampaignListTable.vue';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const isRefresh = inject('isRefresh', ref(false));
const isLoadMore = ref<boolean>(true);
const canLoadMore = ref<boolean>(true);
const campaigns = ref<Campaign[]>([]);
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
  status: CampaignStatus | null;
}>({
  textSearch: '',
  status: null,
  sortBy: '',
  sortDirection: ''
});
const searchParams = reactive({
  searchRecruitmentCampaignProposalReq: searchInput,
  pageable: pageable,
});

const {
  onResult: getCampaignResult,
  refetch: getCampaignRefetch,
  onError: getCampaignError
} =
  searchRecruitmentCampaign(searchParams);

const {
  onResult: onCountStatusResult,
  refetch: countStatusRefetch
} = countAllRecruitmentCampaignAndByEachStatus();

watch(searchTerm, (newValue) => {
  searchParams.searchRecruitmentCampaignProposalReq.textSearch = newValue;
  isLoading.value = true;
  getCampaignRefetch(searchParams);
});

watch(isRefresh, () => {
  refetchData();
  isRefresh.value = false;
});

getCampaignResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchRecruitmentCampaign', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    campaigns.value = [
      ...campaigns.value,
      ...content,
    ];
  } else {
    campaigns.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getCampaignError(()=>{
  isLoading.value = false;
});
function refetchData() {
  searchParams.searchRecruitmentCampaignProposalReq.textSearch = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getCampaignRefetch(searchParams);
  countStatusRefetch();
}

function loadNextPage() {
  searchParams.pageable.page += 1;
  isLoadMore.value = true;
}

onCountStatusResult((res) => {
  const counts = res.data?.countAllRecruitmentCampaignAndByEachStatus || {};
  menus.forEach(m => {
    m.count = counts[m.code as keyof typeof counts] || 0;
  });
});

const menus = reactive<MenuItem[]>(createMenus());
function createMenus(): MenuItem[] {
  const severities = ['secondary', 'info', 'primary', 'success', 'warn', 'danger'];
  const map = Object.keys(CampaignStatus).map((s, index) => ({
    label: t(`hrm.campaign.statusOptions.${s}`),
    code: camelcase(s),
    severity: severities[index % severities.length],
    command: () => {
      searchParams.searchRecruitmentCampaignProposalReq.status =
    s == 'TOTAL_ALL' ? null : (s as CampaignStatus);
    },
  }));
  return map;
}

provide('refetchData', refetchData);
provide('searchInput', searchInput);
</script>