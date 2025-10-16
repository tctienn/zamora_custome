<template>
  <JobFormWrapper ref='wrapperRef'>
    <template #form>
      <div class='relative'>
        <Button
          class='absolute p-button-text right-0 z-5'
          icon='pi pi-comments'
          label='Trao đổi'
          :style="{ top: '10px', right: '10px !important' }"
          @click='toggleChatPanel'/>
        <TabView
          v-model:activeIndex='activeTabIndex'>
          <TabPanel
            header='Thông tin chung'>
            <div>
              <form
                ref='jobForm'
                class='mt-2'
                @submit.prevent='handleSubmitForm()'>
                <div class='formgrid grid mb-6 mx-0'>
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-12 field'>
                    <label
                      v-required>
                      {{ t('mission.job.properties.activityId') }}
                    </label>
                    <div v-if='!isDetail'>
                      <Dropdown
                        v-model='job.activityId'
                        class='p-component w-full'
                        :disabled='isReadonlyMode'
                        filter
                        name='activityId'
                        option-label='activityName'
                        option-value='id'
                        :options='activityOptions'>
                      </Dropdown>
                    </div>
                    <div
                      v-else
                      class='font-bold mt-3'>
                      <p>{{ job.activityName }}</p>
                    </div>
                    <input
                      v-model='job.activityId'
                      hidden
                      name='activityId'>
                    <ValidateErrorMessage :errors='v$.activityId.$errors'/>
                  </div>
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-12 field'>
                    <label>
                      {{ t('mission.job.properties.missionId') }}
                    </label>
                    <div v-if='!isDetail'>
                      <Dropdown
                        v-model='activityDetail.missionId'
                        class='p-component w-full'
                        :disabled='true'
                        name='missionId'
                        option-label='name'
                        option-value='id'
                        :options='missionOptions'>
                      </Dropdown>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ job.missionName }}</p>
                    </div>
                    <input
                      v-model='job.missionId'
                      hidden
                      name='missionId'>
                  </div>
           
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-6 field'>
                    <label> {{ t('mission.job.properties.expectedDate') }}</label>
                    <div
                      v-if='!isDetail'
                      class='w-full'>
                      <NamedInputCalendar
                        v-model='activityDetail.expectedTime'
                        :disabled='true'
                        format='DD/MM/YYYY'
                        input-format='YYYY-MM-DD'
                        :select-other-months='true'
                        show-icon/>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ formatDate(activityDetail.expectedTime, 'DD/MM/YYYY') || '' }}</p>
                    </div>
                  </div>
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-6 field'>
                    <label> {{ t('mission.job.properties.endDate') }}</label>
                    <div
                      v-if='!isDetail'
                      class='w-full'>
                      <NamedInputCalendar
                        v-model='activityDetail.endTime'
                        :disabled='true'
                        format='DD/MM/YYYY'
                        input-format='YYYY-MM-DD'
                        :select-other-months='true'
                        show-icon/>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ formatDate(activityDetail.endTime, 'DD/MM/YYYY') || '' }}</p>
                    </div>
                  </div>
             
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-6'>
                    <div class='field'>
                      <label>
                        {{ t('mission.mission.properties.budget') }}
                      </label>
                      <div v-if='!isDetail'>
                        <InputText
                          v-model='budgetActivity'
                          class='p-component p-inputtext w-full'
                          :disabled='true'
                          maxlength='255'
                          @input='formatBudgetInput'
                          @keydown='preventNonNumeric'/>
                      </div>
                      <div
                        v-else
                        class='font-bold'>
                        <p>{{ budgetActivity }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-6'>
                    <div class='field'>
                      <label>
                        {{ t('mission.mission.properties.host') }}
                      </label>
                      <div v-if='!isDetail'>
                        <TreeSelect
                          v-model='selectedOrganization'
                          class='w-full'
                          :disabled='true'
                          :options='tree'
                          selection-mode='single'/>
                      </div>
                      <div
                        v-else
                        class='font-bold'>
                        <p>{{ hostUnitName }}</p>
                      </div>
                    </div>
                  </div>
        
                  <div class='col-12 field'>
                    <label
                      v-required>
                      {{ t('mission.job.properties.jobName') }}
                    </label>
                    <div v-if='!isDetail'>
                      <InputText
                        v-model='job.jobName'
                        class='p-component p-inputtext w-full'
                        :disabled='isReadonlyMode'
                        maxlength='255'/>
                      <ValidateErrorMessage :errors='v$.jobName.$errors'/>
                      <input
                        name='jobName'
                        type='hidden'
                        :value='job.jobName' />
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ job.jobName }}</p>
                    </div>
                  </div>
                  <div class='col-12 field'>
                    <label>
                      {{ t('mission.job.properties.jobCode') }}
                    </label>
                    <div v-if='!isDetail'>
                      <InputText
                        v-model='job.jobCode'
                        class='p-component p-inputtext w-full'
                        :disabled='!allowEditCode || isReadonlyMode'
                        maxlength='255'/>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ job.jobCode }}</p>
                    </div>
                    <input
                      name='jobCode'
                      type='hidden'
                      :value='job.jobCode' />
                    <ValidateErrorMessage :errors='v$.jobCode.$errors'/>
                  </div>
         
                  <div :class="[jobType === 'ON_MISSION' ? 'col-6' : 'col-12', 'field']">
                    <label
                      v-required> {{ t('mission.job.properties.processingDeadline') }}</label>
                    <div
                      v-if='!isDetail'
                      class='mb-1 w-full'>
                      <NamedInputCalendar
                        v-model='job.processingDeadline'
                        :disabled='isReadonlyMode'
                        format='DD/MM/YYYY'
                        input-format='YYYY-MM-DD'
                        :max-date='activityDetail.endTime'
                        :min-date='activityDetail.expectedTime?.toISOString()'
                        name='processingDeadline'
                        :select-other-months='true'
                        show-icon/>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p>{{ formatDate(job.processingDeadline, 'DD/MM/YYYY') || '' }}</p>
                    </div>
                    <ValidateErrorMessage :errors='v$.processingDeadline.$errors'/>
                  </div>
                  <div
                    v-if="jobType === 'ON_MISSION'"
                    class='col-6'>
                    <div class='field'>
                      <label>
                        {{ t('mission.mission.properties.budget') }}
                      </label>
                      <div v-if='!isDetail'>
                        <InputText
                          v-model='budgetJob'
                          class='p-component p-inputtext w-full'
                          :disabled='isReadonlyMode'
                          maxlength='255'
                          @input='formatBudgetInput'
                          @keydown='preventNonNumeric'/>
                        <ValidateErrorMessage :errors='v$.budget.$errors'/>
                      </div>
                      <div
                        v-else
                        class='font-bold'>
                        <p>{{ budgetJob }}</p>
                      </div>
                      <input
                        name='budget'
                        type='hidden'
                        :value='job.budget' />
                    </div>
                  </div>
           
                  <div class='col-12 field'>
                    <label>{{ t('mission.job.properties.description') }}</label>
                    <div
                      v-if='!isDetail'
                      :class="{ 'disabled-editor': isReadonlyMode }">
                      <AppEditor
                        v-model='job.description'
                        class='w-full'
                        :disabled='isReadonlyMode'
                        editor-style='height: 15rem;'>
                      </AppEditor>
                    </div>
                    <div
                      v-else
                      class='font-bold'>
                      <p v-sanitize-html='job.description'></p>
                    </div>
                    <input
                      v-model='job.description'
                      hidden
                      name='description'>
                  </div>
                  <div class='col-12'>
                    <div class='align-content-center align-items-center flex justify-content-between mb-2 vertical-align-middle'>
                      <label
                        class='font-semibold text-xl'
                        for='attach'>{{ t('mission.mission.properties.attachFile') }}</label>
                      <div class='align-items-center flex gap-1'>
                        <ButtonIcon
                          v-if='!isDetail'
                          class='border-round-sm'
                          icon='add'
                          :label="t('mission.mission.properties.addFile')"
                          severity='warning'
                          size='small'
                          @click='handleShowFileModal'/>

                        <ButtonIcon
                          v-if='!isDetail'
                          class='border-round-sm'
                          icon='cloud_upload'
                          @click='chooseFromEcmDialogVisible = true'/>
                      </div>
                    </div>
                    <div :class="{ 'disabled-editor': isReadonlyMode }">
                      <AttachFileMission
                        v-model:deleted-attachment='deleteFileIds'
                        v-model:receiving-docs='attachedFiles'
                        class='mt-2'
                        :is-detail='isDetail'/>
                    </div>
                  </div>
            
                </div>
                <div
                  class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
                  <Button
                    class='p-button-plain'
                    icon='pi pi-times'
                    :label="t('common.close')"
                    severity='danger'
                    @click="emits('hide-dialog')"/>
                  <Button
                    v-if='!isDetail'
                    :disabled='isReadonlyMode'
                    icon='pi pi-save'
                    :label="t('common.save')"
                    :loading='isSubmitting'
                    type='submit'/>
                </div>
              </form>
              <AddFileModal
                v-if='showAddFileDialog'
                v-model:visible-dialog='showAddFileDialog'
                @submit='handleSubmitFile' />
              <ChooseFromEcmDialog
                v-model:visible='chooseFromEcmDialogVisible'
                @choose-files='chooseFileEcm'/>
            </div>
          </TabPanel>
          <TabPanel
            :disabled='!job.id'
            header='Danh sách giao việc'>
            <JobAssignmentForm
              ref='assignmentFormRef'
              :active-tab-index='activeTabIndex'
              :is-creator='isCreator'
              :is-detail='isDetail'
              :job='job'
              :job-assign='jobAssign'
              :job-type = 'jobType'
              :level-one-organizations='levelOneOrganizations'
              :list-personal='listPersonal'
              :receiver-type='receiverType'
              :selected-personal='selectedPersonal'
              :selected-units='selectedUnits'
              @hide-dialog="emits('hide-dialog')"
              @submit='handleSubmitForm(true)'
              @update:job-assign='jobAssign = $event'
              @update:receiver-type='receiverType = $event'
              @update:selected-personal='selectedPersonal = $event'
              @update:selected-units='selectedUnits = $event'/>
          </TabPanel>
          <TabPanel
            v-if='isDetail && isStaff'
            header='Báo cáo kết quả'>
            <JobResultProcessor
              v-if='showFormResultProcessor'
              :id='props.id'
              :is-detail='isDetail'
              :visible-dialog='showFormResultProcessor'
              @hide-dialog="emits('hide-dialog')"/>
          </TabPanel>
        </TabView>
      </div>
    </template>

    <template #chat>
      <CommentDocIn
        ref='commentDocInRef'
        :job-id='id'/>
    </template>
  </JobFormWrapper>

</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, provide, ref, watch, watchEffect } from 'vue';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { findAllActivity } from '@/apps/mission/api/graphql/activity-api';
import { deleteJobFileAttachment, getDetailJobById } from '@/apps/mission/api/graphql/job-api';
import { findAllMission } from '@/apps/mission/api/graphql/mission';
import { findParameterMsConfig, getJobCode, increaseJobStartValue } from '@/apps/mission/api/graphql/parameter-config';
import { createJob, updateJob } from '@/apps/mission/api/rest/job';
import { appendFilesToFormData, findLabelById } from '@/apps/mission/helpers/convert';
import { useCurrencyFormatter } from '@/apps/mission/helpers/currencyFormat';
import type { ActivityDetail, ActivityInput, ActivityInterface } from '@/apps/mission/model/activity/activity';
import { defaultJob, type EnhancedOrganization, type JobAssignmentInput, type JobInput, type JobType, type PersonalInterface, RoleType } from '@/apps/mission/model/job/job';
import { type FileAttachmentInterface, type IFileAttachment, type MissionInterface, StatusMission } from '@/apps/mission/model/mission/mission';
import AddFileModal from '@/apps/mission/views/mission/component/AddFileModal.vue';
import AttachFileMission from '@/apps/mission/views/mission/component/AttachFileMission.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import type { EcmFile } from '@/common/model/ecm';
import { useUserStore } from '@/common/store/user';

import CommentDocIn from './comment/comment-doc-in/CommentDocIn.vue';
import JobResultProcessor from './formResult/JobResultProcessor.vue';
import JobAssignmentForm from './JobAssignmentForm.vue';
import JobFormWrapper from './JobFormWrapper.vue';
const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  jobType: {
    type: String as PropType<JobType | null>,
    default: null
  },
  isDetail: {
    type: Boolean,
    default: false
  },
  rolesUser: {
    type: Array as PropType<string[]>,
    default: () => []
  }
});
const emits = defineEmits(['hide-dialog']);

const tree = ref<TreeNode[]>([]);
const selectedOrganization = ref<TreeSelectionKeys>();
const moreInfoStore = useUserMoreInfoStore();
moreInfoStore.fetchAllUsers();
const { preventNonNumeric, createBudgetInputHandler, formatCurrency } = useCurrencyFormatter();
const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const attachedFiles = ref<IFileAttachment[]>([]);
const chooseFromEcmDialogVisible = ref(false);
const { mutate: deleteAttachment } = deleteJobFileAttachment();
const activityOptions = ref<ActivityInterface[]>([]);
const listPersonal = ref<PersonalInterface[]>([]);
const missionOptions = ref<MissionInterface[]>([]);
const budgetJob = ref<string>('');
const budgetActivity = ref<string>('');
const isStaff = computed(()=> props.rolesUser.includes(RoleType.NHAN_VIEN));

const job = ref<JobInput>({} as JobInput);
const activity = ref<ActivityInput>({} as ActivityInput);
const activityDetail = ref<ActivityDetail>({} as ActivityDetail);
const showAddFileDialog = ref<boolean>(false);
const activeTabIndex = ref<number>(0);
const jobStatus = computed(() => job.value.status);
const deleteFileIds = ref<Set<string>>(new Set());
const isRefreshCode = inject('isRefreshCode', ref(0));

const isReadonlyMode = computed(() => !!props.id && !props.isDetail && jobStatus.value !== 'NEW');

const levelOneOrganizations = ref<OrganizationInterface[]>([]);
const jobAssign = ref<JobAssignmentInput>({} as JobAssignmentInput);
const selectedUnits = ref<EnhancedOrganization[]>([]);
const selectedPersonal = ref<EnhancedOrganization[]>([]);
const receiverType = ref<'UNIT' | 'PERSONAL'>('UNIT');
const departmentsUser = ref<string[]>([]);
const assignmentFormRef = ref();
const isCreator = ref<boolean>(false);
const jobForm = ref<HTMLFormElement>();
const isSubmitting = ref<boolean>(false);
const showFormResultProcessor = ref<boolean>(false);
const wrapperRef = ref<InstanceType<typeof JobFormWrapper>>();
function toggleChatPanel() {
  wrapperRef.value?.toggleChat();
}

watch(activeTabIndex, ()=>{
  if(activeTabIndex.value == 2){
    showFormResultProcessor.value = true;
  }
});
const isLeader = props.rolesUser.includes(RoleType.LANH_DAO);
if(user.value.id){
  if(usersMoreInfo.value[user.value.id]?.departments.length){
    departmentsUser.value = usersMoreInfo.value[user.value.id]?.departments.map(d => d.id);
  }
  const allUsers = Object.values(usersMoreInfo.value);
  let filteredUsers;
  if (isLeader) {
    filteredUsers = allUsers.filter(u => u.id !== user.value.id);
  } else {
    filteredUsers = allUsers.filter(({ departments }) => {
      const departmentIds = departments?.map(d => d.id) || [];
      return departmentIds.some(depId => departmentsUser.value.includes(depId));
    });
  }
  listPersonal.value = filteredUsers .map((user) => {
    return {
      id: user.id,
      fullName: user.fullName,
      positionName: user.positionName || '',
      departmentName: user.departments?.[0]?.name || ''
    };
  });
}
findAllActivity().onResult(res => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowTime = now.getTime();
  const activity = get(res, 'data.findAllActivity') || [];
  activityOptions.value = activity.filter((item: ActivityInterface) => {
    return item.expectedTime && item.endTime && item.status
    && ![
      StatusMission.WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY, 
      StatusMission.GENERAL_LEADER_REJECTED_ACTIVITY, 
      StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST].includes(item.status as StatusMission)
    && new Date(item.expectedTime).setHours(0, 0, 0, 0) <= nowTime && new Date(item.endTime).setHours(0, 0, 0, 0) >= nowTime;
  }).map((item: ActivityInterface)=> ({
    ...item,
    activityName: `${item.activityCode} - ${item.activityName}`
  }));
});

findAllMission().onResult(res => {
  missionOptions.value = get(res, 'data.findAllMission');
});
getAllOrganizationPublicGraphql().onResult((res) => {
  const orgs:OrganizationInterface[] = res.data?.allOrganizationPublic || [];
  
  const rootOrgs = orgs.filter((org) => !org.parentCode);
  const rootCodes = rootOrgs.map((r) => r.code);
  
  if (!rootOrgs) {
    return;
  }
  tree.value = convertToOrganizationTreeNodes(orgs);
  if (props.id && activity.value.hostUnit && tree.value.length > 0) {
    selectedOrganization.value = { [activity.value.hostUnit]: true };
  } else if (tree.value[0]?.key) {
    activity.value.hostUnit = tree.value[0].key;
  }
  levelOneOrganizations.value = orgs.filter((org) =>
    
    org.parentCode !== null
    && rootCodes.includes(org.parentCode)
    && !departmentsUser.value.includes(org.id)
   || org.id === '6882e527f8e78142c4015284'
  || org.code === 'LDTT'
  );
});

const allowEditCode = ref<boolean>(true);

if (props.id) {
  getDetailJobById(props.id).onResult(res => {
    const value = get(res, 'data.getDetailJobById');
    job.value = {
      ...value,
      processingDeadline: value.processingDeadline ? new Date(value.processingDeadline) : undefined
    };
    budgetJob.value = formatCurrency(value.budget);
    handleFetchDetailActivityById(value.activityId);
    isCreator.value = value.isCreator;
    const handler = value.unitHandlers || value.personalHandlers;
    if (handler?.handleAttachmentFile?.fileId) {
      jobAssign.value.handleAttachmentFile = {
        fileId: handler.handleAttachmentFile.fileId,
        fileName: handler.handleAttachmentFile.fileName,
        downloadPath: handler.handleAttachmentFile.downloadPath
      };
    }
    if (Array.isArray(value.jobAttachments)) {
      attachedFiles.value = value.jobAttachments.map((att: FileAttachmentInterface) => ({
        quote: att.quote || '',
        attachment: {
          name: att.attachment,
          size: att.size
        }, 
        downloadPath: att.downloadPath,
        id: att.id
      }));
    }

    if (handler) {
      jobAssign.value.jobContent = handler.jobContent || '';
      jobAssign.value.jobHandleId = handler.jobHandleId;
      receiverType.value = handler.employmentContact || 'UNIT';

      if (Array.isArray(handler.assignList)) {
        const assignList = handler.assignList.map((item:EnhancedOrganization) => ({
          assignId: item.assignId,
          isMainHandle: item.isMainHandle,
          isFollower: item.isFollower
        }));

        if (receiverType.value === 'UNIT') {
          selectedUnits.value = assignList;
        } else {
          selectedPersonal.value = assignList;
        }
      }
    }
  });
} else {
  job.value = cloneDeep(defaultJob);
}
const { onResult: findParameterConfigResult } = findParameterMsConfig();
findParameterConfigResult((res) => {
  const settings = res.data.findParameterMsConfig?.value?.job?.codeSettings;
  allowEditCode.value = !!settings?.allowEdit;

  if (!props.id && settings?.enabled) {
    const { onResult } = getJobCode();
    onResult((res) => {
      job.value.jobCode = res.data.getJobCode;
    });
  }
});

const handleShowFileModal = ()=>{
  showAddFileDialog.value = true;
};

watchEffect(() => {
  activity.value.hostUnit = Object.keys(selectedOrganization.value || {})[0] || '';
});

const hostUnitName = computed(() => activity.value.hostUnit ? findLabelById(tree.value, activity.value.hostUnit) : '');

const handleFetchDetailActivityById = (id:string)=>{
  const value = activityOptions.value.find((a) => a.id === id);
  if (value) {
    activityDetail.value = { 
      ...value,
      expectedTime: new Date(value.expectedTime),
      endTime: new Date(value.endTime),
      budget: value.budget?.toString() || '0'
    };
    budgetActivity.value = formatCurrency(value.budget);
    job.value.missionId = value.missionId;
    selectedOrganization.value = { [activityDetail.value.hostUnit]: true };
  }
};
watch(() => job.value.activityId, (newId)=>{
  handleFetchDetailActivityById(newId);
});

const formatBudgetInput = createBudgetInputHandler(budgetJob, (raw) => {
  job.value.budget = raw;
});

const { t } = useI18n();
const MAX_BUDGET = 2_000_000_000;
const validateRules = computed(() => {
  return {
    activityId: props.jobType === 'ON_MISSION'
      ? { required: helpers.withMessage(t('mission.job.errors.activityId'), required) }
      : {},
    jobName: { required: helpers.withMessage(t('mission.job.errors.name'), required) },
    jobCode: { required: helpers.withMessage(t('mission.job.errors.code'), required) },
    processingDeadline: { required: helpers.withMessage(t('mission.job.errors.processingDeadline'), required) },
    budget: {
      maxValue: helpers.withMessage(t('mission.mission.errors.budgetTooHigh'), (value: string | undefined) => {
        if (!value) {
          return true;
        }
        const num = Number(value.toString().replace(/[^0-9.-]/g, ''));
        return !isNaN(num) && num <= MAX_BUDGET;
      }
      ),
    }
  };
});
const v$ = useVuelidate(validateRules, job);

const handleSubmitFile = (fileData: IFileAttachment) => {
  if (fileData?.attachment) {
    const fileLocal: IFileAttachment = {
      ...fileData,
      type: 'LOCAL'
    };
    attachedFiles.value.push(fileLocal);
  }
  showAddFileDialog.value = false;
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteAttachment({ id });
};

function chooseFileEcm(data: EcmFile[]) {
  const ecmFiles: IFileAttachment[] = data.map((d: EcmFile) => ({
    quote: d.name || '',
    attachment: {
      name: d.name,
      size: d.size
    }, 
    downloadPath: d.treePath,
    id: d.id,
    type: 'CLOUD'
  }));
  const nonCloudFiles = attachedFiles.value.filter(f => f.type !== 'CLOUD');
  attachedFiles.value = [...nonCloudFiles, ...ecmFiles];
}

const { mutate: increaseJobStartValueMutate } = increaseJobStartValue();
async function handleSubmitForm(isAssignmentForm?: boolean) {
  const handleSuccess = (message: string) => {
    toastSuccess({ message });
    v$.value.$reset();
  };
  const isValid = await v$.value.$validate();
  const handleValidation = () => {
    if (isValid && jobForm.value) {
      isSubmitting.value = true;
      const formData = new FormData(jobForm.value);
      if (props.jobType) {
        formData.append('jobType', props.jobType);
      }
      appendFilesToFormData(formData, attachedFiles.value);
      const action = props.id ? updateJob(formData, props.id) : createJob(formData);

      action
        .then((res) => {
          if(res){
            if(props.id){
              if(!isAssignmentForm) {
                assignmentFormRef.value?.submitJobAssignmentForm();
              }
              emits('hide-dialog');
            }else{
              job.value.id = res;
              // isCreated.value = true;
              activeTabIndex.value = 1;
              increaseJobStartValueMutate({}).then(() => isRefreshCode.value++);
            }
          }
          for (const fileId of deleteFileIds.value) {
            handleDeleteFileAttachment(fileId);
          }
          deleteFileIds.value = new Set();
          const successMessage = props.id ? t('common.result.message.updateSuccess') : t('common.result.message.createSuccess');
          handleSuccess(successMessage);
        })
        .catch((handleError) => {
          if(handleError.code == 'BudgetInvalid'){
            toastError({ message: t('mission.job.errors.budgetExceedParent') });
          }else{
            toastError({ message: t('mission.mission.errors.errors') });
          }
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }
  };
  handleValidation();
}

provide('handleSubmitForm', handleSubmitForm);
</script>

<style scoped>
::v-deep(.p-calendar) {
  width: 100%;
}

.disabled-editor {
  pointer-events: none;
  opacity: 0.6; /* làm mờ */
}
</style>