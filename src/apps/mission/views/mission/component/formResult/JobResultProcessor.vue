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
          <div class='col-12 mb-3'> 
            <label class='font-semibold text-xl uppercase'>{{ t(`mission.jobResult.content.title`) }}</label>
          </div>
          <div class='col-6 field'>
            <label v-required>{{
              t(`mission.jobResult.content.placeholder`)
            }}</label>
  
            <Textarea
              v-model='jobReport.resultContent'
              class='w-full'
              cols='30'
              :disabled='isDetail'
              :placeholder='t(`mission.jobResult.content.placeholder`)'
              rows='8'/>
            <ValidateErrorMessage :errors='v$.resultContent.$errors'/>
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
            <Button
              v-if='!isDetail'
              class='p-button-plain'
              icon='pi pi-plus'
              :label="t('mission.mission.properties.addFile')"
              size='small'
              @click='handleShowFileModal'/>
          </div>
          <ListFileReport
            v-model:receiving-docs='attachedFiles'
            class='col-12 mt-2'
            :is-detail='isDetail'
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
          <!-- <Button
            v-if='!isDetail'
            class='p-button-plain'
            icon='pi pi-file'
            :label='t(`mission.jobResult.actions.draft`)'
            severity='secondary'
            @click='submit(true)'/> -->
          <Button
            v-if='!isDetail'
            icon='pi pi-send'
            :label='t(`mission.jobResult.actions.submitToLeader`)'
            :loading='isSubmitting'
            @click='submit()'/>
        </div>
      </form>
      <AddFileModalReport
        v-if='showAddFileDialog'
        v-model:visible-dialog='showAddFileDialog'
        @submit='handleSubmitFile' />
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getDetailJobById } from '@/apps/mission/api/graphql/job-api';
import { getDetailJobReportToLeaderByJobId } from '@/apps/mission/api/graphql/job-report-api';
import { createReport } from '@/apps/mission/api/rest/job-report';
import type { IJobReport } from '@/apps/mission/model/jobReport/jobReport';
import type { FileAttachmentInterface } from '@/apps/mission/model/mission/mission';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';

import ListFileReport from '../listFileReport/ListFileReport.vue';
import AddFileModalReport from '../modalReport/AddFileModalReport.vue';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
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
const isSubmitting = ref<boolean>(false);
const showAddFileDialog = ref<boolean>(false);
const formJobReport = ref<HTMLFormElement>();
const attachedFiles = ref<FileAttachmentInterface[]>([]);
const hostUnit = ref<string>('');
const jobContent = ref<string>('');
const processingDeadline = ref<string>('');
const description = ref<string>('');
const store = useUserMoreInfoStore(); 
const { usersMoreInfo } = storeToRefs(store);
const mainHandler = ref('');

const validateRules = {
  resultContent: {
    required: helpers.withMessage(
      t('mission.jobResult.content.required'),
      required,
    ),
  }
};
const v$ = useVuelidate(validateRules, jobReport);

const organizationMap = ref<Record<string, string>>({});
getAllOrganizationPublicGraphql().onResult((res) => {
  const orgs: OrganizationInterface[] = res.data?.allOrganizationPublic || [];
  console.log(orgs);
  
  organizationMap.value = orgs.reduce((acc, org) => {
    acc[org.id] = org.name;
    return acc;
  }, {} as Record<string, string>);
});

if (props.id) {
  const { onResult } = getDetailJobById(props.id);
  onResult((res) => {
    const value = get(res, 'data.getDetailJobById');
    console.log(value);
    processingDeadline.value = value.processingDeadline;
    description.value = value.description;
    hostUnit.value = organizationMap.value[value.hostUnit] || '';
    const handle = value.unitHandlers || value.personalHandlers;
    mainHandler.value = handle?.assignList?.find(({ isMainHandle }: {isMainHandle?: string}) => isMainHandle)?.assignId;
    jobContent.value = handle.jobContent;
  });
}

if(props.id && props.isDetail){
  const { onResult: onResultJobReport } = getDetailJobReportToLeaderByJobId(props.id);
  onResultJobReport((res) => {
    const value = get(res, 'data.getDetailJobReportToLeaderByJobId');
    console.log(value);
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

const handleShowFileModal = ()=>{
  showAddFileDialog.value = true;
};

const handleSubmitFile = (fileData: FileAttachmentInterface) => {
  console.log(fileData);
  
  if (fileData?.attachment) {
    attachedFiles.value.push(fileData);
  }
  showAddFileDialog.value = false;
};

const handleDeleteFileAttachment = async (id: string) => {
  console.log(id);
};

function appendAttachedFilesToFormData(formData: FormData, files: FileAttachmentInterface[]) {
  files.forEach((file, index) => {
    const prefix = `reportJobAttachment[${index}]`;

    formData.append(`${prefix}.quote`, file.quote);
    formData.append(`${prefix}.draftDate`, moment(file.draftDate).format('YYYY-MM-DD'));
    if (file.attachment instanceof File) {
      formData.append(`${prefix}.attachment`, file.attachment);
    }
    if (file.id) {
      formData.append(`${prefix}.id`, file.id);
    }
  });
}
const submit = (isDraft = false) => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && formJobReport.value) {
        isSubmitting.value = true;
        const formData = new FormData(formJobReport.value);
        appendAttachedFilesToFormData(formData, attachedFiles.value);
        formData.append('isDraft', String(isDraft));
        if(props.id){
          formData.append('jobId', props.id);
        }
        createReport(formData)
          .then(()=>{
            const handleSuccess = t('mission.jobResult.success');
            toastSuccess({ message: handleSuccess });
            emits('hide-dialog');
          })
          .catch(()=>{
            toastError({ message: t('mission.mission.errors.errors') });
          })
          .finally(() => {
            isSubmitting.value = false;
          });
        
      }
    });
};

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