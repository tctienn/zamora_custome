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
    <HrmCandidateListTable
      v-model:canLoadMore='canLoadMore'
      :candidates='candidates'
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

import { countAllRecruitmentCandidateAndByEachStatus, searchRecruitmentCandidate } from '@/apps/hrm/api/graphql/candidate';
import { type Candidate, CandidateStatus } from '@/apps/hrm/model/candidate';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

import HrmCandidateListTable from './HrmCandidateListTable.vue';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));
const isRefresh = inject('isRefresh', ref(false));
const isLoadMore = ref<boolean>(true);
const canLoadMore = ref<boolean>(true);
const candidates = ref<Candidate[]>([]);
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
  status: CandidateStatus | null;
}>({
  textSearch: '',
  status: null,
  sortBy: '',
  sortDirection: ''
});
const searchParams = reactive({
  searchRecruitmentCandidateReq: searchInput,
  pageable: pageable,
});

const {
  onResult: getCandidateResult,
  refetch: getCandidateRefetch,
  onError: getCandidateError
} =
  searchRecruitmentCandidate(searchParams);

const {
  onResult: onCountStatusResult,
  refetch: countStatusRefetch
} = countAllRecruitmentCandidateAndByEachStatus();

watch(searchTerm, (newValue) => {
  searchParams.searchRecruitmentCandidateReq.textSearch = newValue;
  isLoading.value = true;
  getCandidateRefetch(searchParams);
});

watch(isRefresh, () => {
  refetchData();
  isRefresh.value = false;
});

getCandidateResult((res) => {
  const {
    totalRecords,
    content
  } = get(res, 'data.searchRecruitmentCandidate', {
    totalRecords: 0,
    content: [],
  });
  
  totalRecord.value = totalRecords;
  if (isLoadMore.value) {
    candidates.value = [
      ...candidates.value,
      ...content.flatMap((campaign: any) =>
        campaign.candidates.map((c: Candidate) => ({
          ...c,
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          campaignCode: campaign.campaignCode,
        }))
      ),
    ];
  } else {
    candidates.value = content.flatMap((campaign:any) =>
      campaign.candidates.map((c: Candidate)=> ({
        ...c,
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        campaignCode: campaign.campaignCode,
      }))
    );
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

getCandidateError(()=>{
  isLoading.value = false;
});
function refetchData() {
  searchParams.searchRecruitmentCandidateReq.textSearch = '';
  searchParams.pageable.page = 0;
  isLoading.value = true;
  getCandidateRefetch(searchParams);
  countStatusRefetch();
}

function loadNextPage() {
  searchParams.pageable.page += 1;
  isLoadMore.value = true;
}

onCountStatusResult((res) => {
  const counts = res.data?.countAllRecruitmentCandidateAndByEachStatus || {};
  menus.forEach(m => {
    m.count = counts[m.code as keyof typeof counts] || 0;
  });
});

const menus = reactive<MenuItem[]>(createMenus());
function createMenus(): MenuItem[] {
  const severities = ['secondary', 'info', 'primary', 'success', 'warn', 'danger'];
  const map = Object.keys(CandidateStatus).map((s, index) => ({
    label: t(`hrm.candidate.statusOptions.${s}`),
    code: camelcase(s),
    severity: severities[index % severities.length],
    command: () => {
      searchParams.searchRecruitmentCandidateReq.status =
    s == 'TOTAL_ALL' ? null : (s as CandidateStatus);
    },
  }));
  return map;
}

provide('refetchDataCandidate', refetchData);
provide('searchInput', searchInput);
</script>