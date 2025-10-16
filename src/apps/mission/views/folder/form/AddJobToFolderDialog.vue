<template>
  <Dialog
    v-model:visible='visible'
    :header='`Thêm công việc vào hồ sơ: ${nameFolder}`'
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 65vw'
    @hide="emits('hide-dialog')">
    <div class='flex justify-content-end'>
      <InputText
        v-model='searchJob.keyword'
        placeholder='Tìm kiếm'/>
    </div>
    <div class='mb-6'>
      <DataTable
        v-model:selection='selectedJobs'
        data-key='id'
        :value='jobsData'>
        <Column
          header-style='width: 3%'
          selection-mode='multiple'></Column>
        <Column
          class='col-2'
          field='jobName'
          header='Công việc'></Column>
        <Column
          class='col-1'
          field='activityName'
          header='Hoạt động'></Column>
        <Column
          class='col-2 p-0 text-700'
          field='assignerList'
          :header='t("mission.job.jobTableCol.assignJob")'
          header-class='float-left'>
          <template #body='{ data }'>
            <div
              v-for='(assigner, idx) in data.assignerList'
              :key='idx'
              class='my-1'>
              <p>{{capitalizeName(getAssignerName(assigner)) }}</p>
            </div>
          </template>
        </Column>
        <Column
          class='col-1 text-center'
          field='status'
          :header='t("mission.mission.missionTableCol.status")'>
          <template #body='{data: { status }}'>
            <Badge
              class='capitalize font-semibold py-0 status-badge'
              :severity='getStatusSeverity(status)?.color'
              :value='getStatusSeverity(status)?.text'></Badge>
          </template>
        </Column>
      </DataTable>
    </div>
    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
      style='width: 100%; left: 0; z-index: 1000'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='submit'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import moment from 'moment/moment';
import { type Ref, ref } from 'vue';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { saveFolderJobs } from '@/apps/mission/api/graphql/folder';
import { searchJobGraphql } from '@/apps/mission/api/graphql/job-api';
import { getStatusSeverity } from '@/apps/mission/helpers/convert';
import { type JobInterface, JobType, type SearchJobInput } from '@/apps/mission/model/job/job';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);
const selectedJobs = ref<JobInterface[]>([]);
const organizationMap = ref<Record<string, string>>({});
const userMap = ref<Record<string, string>>({});
const nameFolder = inject<Ref<string>>('nameFolder', ref(''));

const pageableJobs = ref({
  page: 0,
  size: 50
});

const searchJob = ref<SearchJobInput>({
  keyword: '',
  activityId: null,
  fromDate: null,
  toDate: null,
  year: moment().format(DateTimeFormat.ISO_LOCAL_YEAR),
  jobType: JobType.ON_MISSION,
  mainHandler: null,
  status: null
});

const jobsData = ref<JobInterface[]>([]);

const {
  onResult: onJobResult,
  load: loadJob,
  loading: loadingJob,
  refetch: refetchJob,
} = searchJobGraphql();

function fetchData() {
  loadJob(undefined, {
    jobSearchDto: searchJob.value,
    pageable: {
      ...pageableJobs.value,
      page: pageableJobs.value.page
    }
  });
}

onJobResult((res) => {
  jobsData.value = res.data.searchJob.content;
});

fetchData();

const {
  mutate: saveFolderJobsMutate,
  onDone,
  onError
} = saveFolderJobs();

const submit = () => {
  saveFolderJobsMutate({
    id: props.id,
    listJobs: selectedJobs.value.map(job => job.id)
  });
};

onDone((res) => {
  emits('hide-dialog');
  toastSuccess({ message: t('Lưu thành công.') });
});

onError((err) => {
  console.error(err);
});

function capitalizeName(name: string): string {
  if (!name) {
    return '';
  }
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
function getAssignerName(assigner: { assignId: string; assignType: 'UNIT' | 'PERSONAL' }) {
  if (assigner.assignType === 'UNIT') {
    return organizationMap.value[assigner.assignId] || '';
  } else if (assigner.assignType === 'PERSONAL') {
    return userMap.value[assigner.assignId] || '';
  }
  return '';
}

getAllOrganizationPublicGraphql().onResult((res) => {
  const organizations = res.data?.allOrganizationPublic || [];
  organizationMap.value = organizations.reduce((acc: Record<string, string>, org: { id: string | number; name: string; }) => {
    acc[org.id] = org.name;
    return acc;
  }, {});
});

getAllUserMoreInfoGraphql().onResult((res) => {
  const users = res.data?.getAllUserMoreInfo || [];
  userMap.value = users.reduce((acc: Record<string, string>, user: { id: string | number; fullName: string; }) => {
    acc[user.id] = user.fullName;
    return acc;
  }, {});
  
});
</script>

<style scoped>

</style>