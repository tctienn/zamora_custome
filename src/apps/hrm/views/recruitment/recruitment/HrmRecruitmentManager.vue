<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t('hrm.recruitment.titleManage') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          v-if='hasPermission("HRM/HRM_DEVELOPMENT/HRM_RECRUITMENT/CREATE")'
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showFormCreate'>
        </Button>
        <Button
          v-if='hasPermission("HRM/HRM_DEVELOPMENT/HRM_RECRUITMENT/CREATE")'
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("hrm.campaign.titleCreate")'
          @click='showFormCreateCompaign'>
        </Button>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("hrm.candidate.titleCreate")'
          @click='showFormCreateCandidate'>
        </Button>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("hrm.interview.titleCreate")'
          @click='showFormCreateInterview'>
        </Button>
        <Button
          class='focus:shadow-none font-normal gap-2 hover:surface-200'
          :label='t("common.viewBy")'
          severity='secondary'
          @click='viewTypeRef?.toggle'>
          <template #icon>
            <i
              class='pi pi-list'
              style='margin-top: 1px'></i>
            <i class='flex-order-2 mt-1 pi pi-angle-down'/>
          </template>
        </Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-import'
          label='Import'
          severity='secondary'></Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'></Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-cog'
          :label='t("common.setting")'
          severity='secondary'></Button>
      </div>
    </template>
  </Toolbar>
  <HrmRecruitmentList v-if="viewType === 'recruitment'"/>
  <HrmCampaignList v-if="viewType === 'campaign'"/>
  <HrmCandidateList v-if="viewType === 'candidate'"/>
  <HrmRecruitmentFormSidebar
    v-model='recruitmentEdit'
    v-model:visible='visible'/>
  <HrmCampaignFormSidebar
    v-model='recruitmentEdit'
    v-model:campaign='campaignEdit'
    v-model:visible='visibleCampaign'/>
  <HrmCandidateFormSidebar
    v-model:candidate='candidateEdit'
    v-model:visible='visibleCandidate'/>
  <HrmInterviewFormSidebar
    v-model:interview='interviewEdit'
    v-model:visible='visibleInterview'/>
  <HrmRecruitmentDetailSidebar
    v-model='recruitmentEdit'
    v-model:visible='visibleDetail'/>

  <HrmCampaignDetailSidebar
    v-model:campaign='campaignEdit'
    v-model:visible='visibleDetailCampaign'/>
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
</template>

<script setup lang='ts'>
import type Menu from 'primevue/menu';
import type { Ref } from 'vue';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import { getDetailRecruitmentCampaignById } from '@/apps/hrm/api/graphql/campaign';
import { getDetailRecruitmentCandidateById } from '@/apps/hrm/api/graphql/candidate';
import type { Candidate } from '@/apps/hrm/model/candidate';
import type { Campaign } from '@/apps/hrm/model/compaign';
import type { Interview } from '@/apps/hrm/model/interview';
import { type Recruitment } from '@/apps/hrm/model/recruitment';

import { getDetailRecruitmentProposalById } from '../../../api/graphql/recruitment';
import HrmCampaignDetailSidebar from '../campaign/HrmCampaignDetailSidebar.vue';
import HrmCampaignFormSidebar from '../campaign/HrmCampaignFormSidebar.vue';
import HrmCandidateFormSidebar from '../candidate/HrmCandidateFormSidebar.vue';
import HrmInterviewFormSidebar from '../interview/HrmInterviewFormSidebar.vue';
import HrmCampaignList from '../list/campaign/HrmCampaignList.vue';
import HrmCandidateList from '../list/candidate/HrmCandidateList.vue';
import HrmRecruitmentList from '../list/recruitment/HrmRecruitmentList.vue';
import HrmRecruitmentDetailSidebar from './HrmRecruitmentDetailSidebar.vue';
import HrmRecruitmentFormSidebar from './HrmRecruitmentFormSidebar.vue';

const { t } = useI18n();
const hasPermission = usePermissionStore().hasPermission;
const visible = ref<boolean>(false);
const visibleCampaign = ref<boolean>(false);
const visibleCandidate = ref<boolean>(false);
const visibleInterview = ref<boolean>(false);
const visibleDetail = ref<boolean>(false);
const visibleDetailCampaign = ref<boolean>(false);
const visibleDetailCandidate = ref<boolean>(false);
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const viewType = ref<'recruitment' | 'campaign' | 'candidate' | 'interview'>('recruitment');
const recruitmentEdit = ref<Recruitment>({} as Recruitment);
const campaignEdit = ref<Campaign>({} as Campaign);
const interviewEdit = ref<Interview>({} as Interview);
const candidateEdit = ref<Candidate>({
  isMemberOfCommunistParty: false,
  nationalityCode: 'VN',
} as Candidate);
const isRefresh = ref(false);
const isOpening = ref(true);

function resetData() {
  recruitmentEdit.value = {} as Recruitment;
  interviewEdit.value = {} as Interview;
  campaignEdit.value = {} as Campaign;
  candidateEdit.value = {
    isMemberOfCommunistParty: false,
    nationalityCode: 'VN',
  } as Candidate;
}

function showFormCreate() {
  visible.value = true;
}

function showFormCreateCompaign() {
  visibleCampaign.value = true;
}

function showFormCreateCandidate() {
  visibleCandidate.value = true;
}

function showFormCreateInterview() {
  visibleInterview.value = true;
}

function splitCodes(str?: string) {
  return str ? str.split(',').map((code) => code.trim()) : [];
}

function mapAttachment(att: IAttachmentFile) {
  return {
    quote: att.quote || '',
    attachment: {
      name: att.attachment,
      size: att.size
    },
    id: att.id,
    downloadPath: att.downloadPath
  };
}

function mapWithYear<T extends { fromYear?: number | Date; toYear?: number | Date }>(value: T): T {
  return {
    ...value,
    fromYear: value.fromYear ? new Date(typeof value.fromYear === 'number' ? value.fromYear : value.fromYear.getFullYear(), 0, 1) : null,
    toYear: value.toYear ? new Date(typeof value.toYear === 'number' ? value.toYear : value.toYear.getFullYear(), 11, 31) : null,
  };
}

function mapPersonYear<T extends { receivedIn?: number | string | Date }>(value: T): T {
  return {
    ...value,
    receivedIn: value.receivedIn ? new Date(value.receivedIn) : null,
  };
}

function mapWithMonthYear<T extends { fromMonthYear?: string | Date; toMonthYear?: string | Date; }>(value: T): T {
  return {
    ...value,
    fromMonthYear: value.fromMonthYear ? new Date(value.fromMonthYear) : null,
    toMonthYear: value.toMonthYear ? new Date(value.toMonthYear) : null,
  };
}

function getDetail(visible: Ref<boolean>, id?: string) {
  if (id) {
    if (viewType.value === 'recruitment') {
      getDetailRecruitmentProposalById(id).onResult((res) => {
        const value = res.data.getDetailRecruitmentProposalById;
        console.log(value);
        recruitmentEdit.value = {
          ...value,
          fromTime: value.fromTime ? new Date(value.fromTime) : null,
          toTime: value.toTime ? new Date(value.toTime) : null,
          levelCode: splitCodes(value.levelCode),
          majorCode: splitCodes(value.majorCode),
          experienceCode: splitCodes(value.experienceCode),
          foreignLanguageCode: splitCodes(value.foreignLanguageCode),
          files: (value.files || []).map(mapAttachment)
        };
        visible.value = true;
      });
    }

    if (viewType.value === 'campaign') {
      getDetailRecruitmentCampaignById(id).onResult((res) => {
        const value = res.data.getDetailRecruitmentCampaignById;
        campaignEdit.value = {
          ...value,
          personInChargeId: splitCodes(value.personInChargeId),
          personFollowerId: splitCodes(value.personFollowerId),
          files: (value.files || []).map(mapAttachment)
        };
        visible.value = true;
      });
    }

    if (viewType.value === 'candidate') {
      isOpening.value = true;
      getDetailRecruitmentCandidateById(id).onResult((res) => {
        if (!isOpening.value) {
          return;
        }
        const value = res.data.getDetailRecruitmentCandidateById;
        candidateEdit.value = {
          ...value,
          workExperiences: (value.workExperiences || []).map(mapWithMonthYear),
          candidateEducations: (value.educations || []).map(mapWithYear),
          extracuurricularActivities: (value.extracurricularActivities || []).map(mapWithMonthYear),
          certificates: (value.candidateCertificates || []).map(mapPersonYear),
          titlesAndAwards: (value.candidateTitlesAndAwards || []).map(mapPersonYear),
          dateOfBirth: value.dateOfBirth ? new Date(value.dateOfBirth) : null,
          dateOfIssue: value.dateOfIssue ? new Date(value.dateOfIssue) : null,
          hobbyCode: (value.hobbies || []).map((h: { code: string }) => h.code),
        };
        visible.value = true;
      });
    }

  }
}

const handleEditRecruitment = (id?: string) => {
  getDetail(visible, id);
};

const handleViewDetailRecruitment = (id: string) => {
  if (hasPermission('HRM/HRM_DEVELOPMENT/HRM_RECRUITMENT/VIEW')) {
    getDetail(visibleDetail, id);
  }
};

const handleEditCampaign = (id?: string) => {
  getDetail(visibleCampaign, id);
};

const handleViewDetailCampaign = (id: string) => {
  if (hasPermission('HRM/HRM_DEVELOPMENT/HRM_RECRUITMENT/VIEW')) {
    getDetail(visibleDetailCampaign, id);
  }
};

const handleEditCandidate = (id?: string) => {
  getDetail(visibleCandidate, id);
};

const handleViewDetailCandidate = (id: string) => {
  getDetail(visibleDetailCandidate, id);
};

const viewTypeMenu = ref([
  {
    label: 'Danh sách đề xuất',
    key: 'recruitment',
    command: () => {
      viewType.value = 'recruitment';
    },
  }, {
    label: 'Danh sách chiến dịch',
    key: 'campaign',
    command: () => {
      viewType.value = 'campaign';
    },
  },
  {
    label: 'Danh sách ứng viên',
    key: 'candidate',
    command: () => {
      viewType.value = 'candidate';
    },
  }
]);

provide('resetData', resetData);
provide('handleEditRecruitment', handleEditRecruitment);
provide('handleViewDetailRecruitment', handleViewDetailRecruitment);
provide('handleEditCampaign', handleEditCampaign);
provide('handleViewDetailCampaign', handleViewDetailCampaign);
provide('handleEditCandidate', handleEditCandidate);
provide('handleViewDetailCandidate', handleViewDetailCandidate);
provide('isRefresh', isRefresh);
provide('isOpening', isOpening);
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}
</style>