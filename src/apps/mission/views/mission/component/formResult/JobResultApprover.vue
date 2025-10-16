<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    :style='{
      width: "80vw",
    }'>
    <template #header>
      <div class='align-items-start flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-dialog')"/>
          <div class='p-sidebar-header-content'>
            {{ t('mission.jobResult.headerTitleSignature') }}
          </div>
        </div>
        <div class='col-2 px-2 py-0'>
          <Dropdown
            v-model='jobApprover.flag'
            class='w-full'
            option-label='name'
            option-value='code'
            :options='flagOptions'
            placeholder='Chọn cờ'
            :style='dropdownStyle'>
            <template #value='slotProps'>
              <div
                v-if='slotProps.value'
                class='align-items-center flex'>
                <i
                  class='mr-2 pi pi-flag'
                  :style='{ color: getColor(slotProps.value) }'/>
                <div :style='{ color: getColor(slotProps.value) }'>
                  {{ getLabel(slotProps.value) }}
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option='slotProps'>
              <div class='align-items-center flex'>
                <i
                  class='mr-2 pi pi-flag'
                  :style='{ color: slotProps.option.color }'/>
                <div :style='{ color: slotProps.option.color }'>
                  {{ slotProps.option.name }}
                </div>
              </div>
            </template>
          </Dropdown>
          <ValidateErrorMessage :errors='v$.flag.$errors'/>
        </div>
      </div>
    </template>
    <div>
      <form
        ref='formJobReport'
        class='mb-6'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 mb-3 wrapper-content-result'> 
            <div><label>{{
              t(`mission.jobResult.summary`)
            }} <span class='font-bold'></span></label></div>
            <div><label>{{
              t(`mission.jobResult.reportResult`)
            }} <span class='font-bold'>{{ jobContent }}</span></label></div>
            <div><label>{{
              t(`mission.jobResult.unitSubmit`)
            }} <span class='font-bold'>{{ hostUnit }}</span></label></div>
            <div><label>{{
              t(`mission.jobResult.submitContent`)
            }} <span
              v-sanitize-html='description'
              class='font-bold'></span></label></div>
            <div><label>{{
              t(`mission.jobResult.dueDate`)
            }} <span class='font-bold'>{{ formatDate(processingDeadline, 'DD/MM/YYYY') || '' }}</span></label></div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`mission.jobResult.note`)
            }}</label>
  
            <Textarea
              v-model='jobReport.resultContent'
              class='w-full'
              cols='30'
              disabled
              :placeholder='t(`mission.jobResult.note`)'
              rows='8'/>
            <input
              v-model='jobReport.resultContent'
              hidden
              name='resultContent'>
          
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
          <div class='align-items-center col-12 field flex gap-5 mt-2'>
            <div class='align-items-center flex h-3rem'>
              <Checkbox
                binary
                input-id='returnProcessor'
                :model-value='jobApprover.rejectedAndReturnToLeader'
                @update:model-value='(val: boolean) => {
                  jobApprover.rejectedAndReturnToLeader = val;
                  if (val) jobApprover.rejectedAndReturnToEmployee = false;
                }'/>
              <label
                class='ml-2'
                for='returnProcessor'>{{ t('mission.jobResult.returnSubordinates') }}</label>
            </div>
            <div
              class='align-items-center flex h-3rem'>
              <Checkbox
                binary
                input-id='returnSubordinates'
                :model-value='jobApprover.rejectedAndReturnToEmployee'
                @update:model-value='(val: boolean) => {
                  jobApprover.rejectedAndReturnToEmployee = val;
                  if (val) jobApprover.rejectedAndReturnToLeader = false;
                }'/>
              <label
                class='ml-2'
                for='returnSubordinates'>{{ t('mission.jobResult.returnProcessor') }}</label>
            </div>
           
          </div>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='secondary'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            class='p-button-plain'
            icon='pi pi-file'
            :label='isRejecting ? t(`mission.jobResult.actions.giveBack`) : t(`mission.jobResult.actions.success`)'
            :severity='isRejecting ? "danger" : "success"'
            @click='isRejecting ? rejectDialogVisible = true : submit()'/>
        </div>
      </form>
      <AddFileModalReport
        v-if='showAddFileDialog'
        v-model:visible-dialog='showAddFileDialog'
        @submit='handleSubmitFile' />
    </div>
  </Sidebar>
  <Dialog
    v-model:visible='rejectDialogVisible'
    header='Nhập lý do từ chối'
    :style="{ width: '40vw' }">
    <div class='p-fluid'>
      <Textarea
        v-model='rejectReason'
        auto-resize
        class='w-full'
        placeholder='Nhập lý do từ chối'
        rows='5'/>
    </div>
    <template #footer>
      <Button
        class='p-button-text'
        label='Hủy'
        @click='rejectDialogVisible = false;rejectReason = ""'/>
      <Button
        :disabled='!rejectReason.trim()'
        label='Xác nhận'
        severity='danger'
        @click='() => { submit(rejectReason); rejectDialogVisible = false; rejectReason = ""}'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getDetailJobById } from '@/apps/mission/api/graphql/job-api';
import { generalLeaderPerformsSignatureOrRejectForReportSubmittedByLeader, getDetailJobReportToLeaderByJobId } from '@/apps/mission/api/graphql/job-report-api';
import type { IJobApprover, IJobReport } from '@/apps/mission/model/jobReport/jobReport';
import type { FileAttachmentInterface } from '@/apps/mission/model/mission/mission';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
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
const jobApprover = ref<IJobApprover>({
  flag: 'YELLOW',
  rejectedAndReturnToEmployee: false,
  rejectedAndReturnToLeader: false,
  reasonIfReject: null 
} as IJobApprover);
const isSubmitting = ref<boolean>(false);
const showAddFileDialog = ref<boolean>(false);
const formJobReport = ref<HTMLFormElement>();
const attachedFiles = ref<FileAttachmentInterface[]>([]);
const hostUnit = ref<string>('');
const jobContent = ref<string>('');
const processingDeadline = ref<string>('');
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const description = ref<string>('');
const isRejecting = computed(() => {
  return jobApprover.value.rejectedAndReturnToLeader || jobApprover.value.rejectedAndReturnToEmployee;
});
const {
  mutate,
  onDone,
} = generalLeaderPerformsSignatureOrRejectForReportSubmittedByLeader();
const flagOptions = [
  {
    name: 'Cờ xanh',
    code: 'GREEN',
    color: 'green' 
  },
  {
    name: 'Cờ vàng',
    code: 'YELLOW',
    color: 'orange' 
  },
  {
    name: 'Cờ đỏ',
    code: 'RED',
    color: 'red' 
  }
];

const getColor = (code:string) => {
  const item = flagOptions.find((f) => f.code === code);
  return item ? item.color : '#ccc';
};

const getLabel = (code:string) => {
  const item = flagOptions.find((f) => f.code === code);
  return item ? item.name : '';
};

const dropdownStyle = computed(() => {
  if (!jobApprover.value.flag) {
    return {};
  }
  return { border: `1px solid ${getColor(jobApprover.value.flag)}` };
});

const validateRules = {
  flag: {
    required: helpers.withMessage(
      t('Vui lòng chọn cờ phê duyệt'),
      required,
    ),
  }
};
const v$ = useVuelidate(validateRules, jobApprover);

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
    console.log(value);
    processingDeadline.value = value.processingDeadline;
    description.value = value.description;
    hostUnit.value = organizationMap.value[value.hostUnit] || '';
    const handle = value.unitHandlers || value.personalHandlers;
    jobContent.value = handle.jobContent;
  });

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

const submit = (reasonIfReject: string | null = null) => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && formJobReport.value) {
        isSubmitting.value = true;
        jobApprover.value.jobId = props.id;
        jobApprover.value.reasonIfReject = reasonIfReject;
        mutate({ request: jobApprover.value, });
      }
    });
};

onDone(() => {
  toastSuccess({ message: isRejecting.value ? t('Đã trả lại cho cấp dưới') : t('Công việc đã được phê duyệt') });  
  emits('hide-dialog');
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
:deep(.p-dropdown:not(.p-disabled).p-focus){
  box-shadow: none;
}

.wrapper-content-result :deep(img){
  width: 100%;
}
</style>
