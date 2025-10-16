<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t('mission.jobResult.headerTitle')"
    :style='{
      width: "80vw",
    }'
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='formJobReport'
        class='mb-6'>
        <div class='formgrid grid mb-4'>
          <div
            v-if='isJobNeedToApproveByGeneralLeader'
            class='col-6 field'>
            <label>{{ t(`Lãnh đạo phê duyệt`) }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <NamedSelectUser
                v-model='jobSignature.generalLeaderId'
                :button-select-user='false'
                class='w-full'
                name='generalLeaderId'
                :options = 'leadershipUserIds'
                style='height: 40px'/>
              <ValidateErrorMessage :errors='v$.generalLeaderId.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible></AppUser>
            </div>
          </div>
          <div class='col-12 mb-3'> 
            <label class='font-semibold text-xl uppercase'>{{ t(`mission.jobResult.content.title`) }}</label>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`mission.jobResult.content.placeholder`)
            }}</label>
  
            <Textarea
              v-model='jobReport.resultContent'
              class='w-full'
              cols='30'
              disabled
              :placeholder='t(`mission.jobResult.content.placeholder`)'
              rows='8'/>
            <input
              v-model='jobReport.resultContent'
              hidden
              name='resultContent'>
          
          </div>

          <div class='col-6 field'>
            <div
              class='wrapper-content-result'>
              <label>{{
                t(`mission.jobResult.assignment.title`)
              }} <span class='font-bold'>{{ jobContent }}</span></label>
              <div>{{
                t(`mission.jobResult.assignment.deadline`)
              }} <span class='font-bold'>{{ formatDate(processingDeadline, 'DD/MM/YYYY') || '' }}</span></div>
              <div class='align-items-center flex gap-5'>
                <label>{{
                  t(`mission.jobResult.assignment.assigner`)
                }} <span class='font-bold'>{{ usersMoreInfo[mainHandler]?.fullName || '' }}</span></label>
                <label>{{
                  t(`mission.jobResult.assignment.unit`)
                }} <span class='font-bold'>{{ hostUnit }}</span></label>
              </div>
              <label>{{
                t(`mission.jobResult.assignment.description`)
              }} <span
                v-sanitize-html='description'
                class='font-bold'></span></label>
            </div>
          </div>
          <div class='align-content-center align-items-center col-12 flex justify-content-between mb-2 vertical-align-middle'>
            <p class='mb-0'><label
              class='font-semibold text-xl'
              for='attach'>{{ t('mission.jobResult.document.title') }}</label><span class='font-italic text-sm'>{{ t('mission.jobResult.document.note') }}</span></p>
          </div>
          <ListFileReport
            v-model:receiving-docs='attachedFiles'
            class='col-12 mt-2'
            :is-detail='true'
            :on-delete='handleDeleteFileAttachment'/>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            icon='pi pi-send'
            :label='t(`mission.jobResult.actions.giveBack`)'
            severity='warning'
            @click='handleleaderDenyJob'/>
          <Button
            v-if='!isDetail'
            :class="['p-button-plain', !isJobNeedToApproveByGeneralLeader ? 'p-button-success' : '']"
            icon='pi pi-file'
            :label="!isJobNeedToApproveByGeneralLeader ? 'Duyệt' : t('mission.jobResult.actions.signature')"
            :loading='isSubmitting'
            @click='submit()'/>
        </div>
      </form>
      <AddFileModalReport
        v-if='showAddFileDialog'
        v-model:visible-dialog='showAddFileDialog'
        @submit='handleSubmitFile' />
      <LeaderDenyDialog
        v-if='showDenyDialog'
        :id='id'
        v-model:visible='showDenyDialog'
        @refresh="emits('hide-dialog')"/>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getDetailJobById } from '@/apps/mission/api/graphql/job-api';
// eslint-disable-next-line max-len
import { deleteJobReportToLeaderAttachment, getDetailJobReportToLeaderByJobId, leaderApprovedJobReportOfEmployeeAndSendToGeneralLeaderForSignature } from '@/apps/mission/api/graphql/job-report-api';
import { type JobType, RoleType } from '@/apps/mission/model/job/job';
import type { IJobReport, IJobSignature } from '@/apps/mission/model/jobReport/jobReport';
import type { FileAttachmentInterface } from '@/apps/mission/model/mission/mission';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';

import LeaderDenyDialog from '../dialog/LeaderDenyDialog.vue';
import ListFileReport from '../listFileReport/ListFileReport.vue';
import AddFileModalReport from '../modalReport/AddFileModalReport.vue';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  jobType: {
    type: String as PropType<JobType | null>,
    default: null
  },
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
const visibleForm = ref<boolean>(props.visibleDialog);
const jobReport = ref<IJobReport>({} as IJobReport);
const jobSignature = ref<IJobSignature>({} as IJobSignature);
const isSubmitting = ref<boolean>(false);
const showAddFileDialog = ref<boolean>(false);
const isJobNeedToApproveByGeneralLeader = ref<boolean>(false);
const formJobReport = ref<HTMLFormElement>();
const attachedFiles = ref<FileAttachmentInterface[]>([]);
const hostUnit = ref<string>('');
const jobContent = ref<string>('');
const processingDeadline = ref<string>('');
const description = ref<string>('');
const store = useUserMoreInfoStore();
const { usersMoreInfo, allUsers } = storeToRefs(store);
const showDenyDialog = ref<boolean>(false);
const mainHandler = ref('');
const leadershipUserIds = computed(() => {
  return allUsers.value.filter((info) => info.roles?.includes(RoleType.LANH_DAO));
});

const { mutate: deleteFileMutate, } = deleteJobReportToLeaderAttachment();

const {
  mutate,
  onDone,
  onError,
} = leaderApprovedJobReportOfEmployeeAndSendToGeneralLeaderForSignature();
const validateRules = computed(() =>{
  return {
    generalLeaderId: isJobNeedToApproveByGeneralLeader.value ? {
      required: helpers.withMessage(
        t('Vui lòng chọn lãnh đạo cần trình ký'),
        required,
      ),
    } : {}
  };
});
const v$ = useVuelidate(validateRules, jobSignature);

const organizationMap = ref<Record<string, string>>({});
getAllOrganizationPublicGraphql().onResult((res) => {
  const orgs: OrganizationInterface[] = res.data?.allOrganizationPublic || [];
  organizationMap.value = orgs.reduce((acc, org) => {
    acc[org.id] = org.name;
    return acc;
  }, {} as Record<string, string>);
});

if (props.id) {
  const { onResult } = getDetailJobById(props.id);
  onResult((res) => {
    const value = get(res, 'data.getDetailJobById');
    processingDeadline.value = value.processingDeadline;
    description.value = value.description;
    isJobNeedToApproveByGeneralLeader.value = value.isJobNeedToApproveByGeneralLeader;

    hostUnit.value = organizationMap.value[value.hostUnit] || '';
    const handle = value.unitHandlers || value.personalHandlers;
    mainHandler.value = handle?.assignList?.find(({ isMainHandle }: {isMainHandle?: string}) => isMainHandle)?.assignId;
    jobContent.value = handle.jobContent;
  });
  const { onResult: onResultJobReport } = getDetailJobReportToLeaderByJobId(props.id);
  onResultJobReport((res) => {
    const value = get(res, 'data.getDetailJobReportToLeaderByJobId');
    jobReport.value = { ...value };
    attachedFiles.value = value.reportJobAttachments.map((att: FileAttachmentInterface) => ({
      quote: att.quote || '',
      draftDate: att.draftDate || '',
      attachment: {
        name: att.attachment,
        size: att.size
      }, 
      downloadPath: att.downloadPath,
      id: att.id
    }));
  });
  
}

const handleSubmitFile = (fileData: FileAttachmentInterface) => {
  console.log(fileData);
  
  if (fileData?.attachment) {
    attachedFiles.value.push(fileData);
  }
  showAddFileDialog.value = false;
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteFileMutate({ id: id });
};

const submit = () => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && formJobReport.value) {
        isSubmitting.value = true;
        jobSignature.value.jobId = props.id;
        mutate({ request: jobSignature.value, });
      }
    });
};

function handleleaderDenyJob() {
  showDenyDialog.value = true;
}

onDone(() => {
  toastSuccess({
    message: isJobNeedToApproveByGeneralLeader.value
      ? t('Đã gửi trình ký lên cho lãnh đạo') : t('Duyệt thành công') 
  });  
  emits('hide-dialog');
  isSubmitting.value = false;
});

onError((err) => {
  console.log(err.graphQLErrors[0].extensions.errorCode);
  
  toastError({ message: t('mission.mission.errors.errors') });
  isSubmitting.value = false;
});

</script>

<style scoped>

.wrapper-content-result{
    margin-top: 24px;
    border: 1px solid #ced4da; 
    border-radius: 6px;
    padding: 1.5rem 1.2rem;
    min-height: 157px;
}

.wrapper-content-result :deep(img){
  width: 100%;
}
</style>