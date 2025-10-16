<template>
  <form
    ref='meetingForm'
    class='mt-4'
    @reset.prevent='submitAndResetForm'
    @submit.prevent='submitMeetingForm'>
    <div class='formgrid grid mb-4'>
      <div class='col'>
        <div class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('meeting.meeting.content') }}
          </label>
          <InputText
            v-model='meeting.content'
            class='p-component p-inputtext w-full'
            maxlength='5000'
            name='content'/>
          <ValidateErrorMessage :errors='v$.content.$errors'/>
        </div>
        <div class='flex gap-3'>
          <div class='field'>
            <label
              v-required
              class='font-bold'>{{
                t('meeting.meeting.startTime')
              }}</label>
            <div>
              <NamedInputCalendar
                v-model='meeting.startTime'
                format='DD/MM/YYYY HH:mm'
                input-format='YYYY-MM-DDTHH:mm:ss'
                name='startTime'
                :select-other-months='true'
                show-icon
                show-time/>
              <ValidateErrorMessage :errors='v$.startTime.$errors'/>
            </div>
          </div>
          <div class='field'>
            <label class='font-bold'>{{
              t('meeting.meeting.finishTime')
            }}</label>
            <div>
              <NamedInputCalendar
                v-model='meeting.endTime'
                format='DD/MM/YYYY HH:mm'
                input-format='YYYY-MM-DDTHH:mm:ss'
                name='endTime'
                :select-other-months='true'
                show-icon
                show-time/>
              <ValidateErrorMessage :errors='v$.endTime.$errors'/>
            </div>
          </div>
          <div
            v-if='!meeting.id'
            class='field'>
            <label class='font-bold'>{{ t('meeting.meeting.repeat') }}</label>
            <div>
              <Dropdown
                v-model='meeting.repeat'
                option-label='label'
                option-value='value'
                :options='repeatOptions'>
              </Dropdown>
            </div>
            <input
              v-model='meeting.repeat'
              hidden
              name='repeat'/>
          </div>
          <!--          <div class='field ml-1 p-component w-6'>
                      <RepeatMeetingSelect
                        v-model='meeting.cronConfig'
                        :repeat-type='meeting.repeat'>
                      </RepeatMeetingSelect>
                    </div>-->
        </div>

        <div class='field'>
          <label
            v-required
            class='font-bold'>{{
              t('meeting.meeting.host')
            }}</label>
          <NamedSelectUser
            v-model='meeting.hostId'
            class='w-full'
            name='hostId'
            :placeholder="'Chọn người chủ trì'"
            :selected-user-ids='meeting.attendeeIds'
            @update:model-value='changeAttendees'/>
          <ValidateErrorMessage :errors='v$.hostId.$errors'/>
        </div>

        <div class='field'>
          <label
            v-required
            class='font-bold'>{{
              t('meeting.meeting.attendees')
            }}</label>
          <NamedMultiSelectUser
            v-model:list-user='meeting.attendeeIds'
            class='p-component'
            name='attendeeIds'
            :select-max='99999'
            :selected-user-ids='[meeting.hostId]'
            @update:list-user='changeAttendees'/>
          <ValidateErrorMessage :errors='v$.attendeeIds.$errors'/>
        </div>
        <div class='field'>
          <OrganizationDropdown v-model='meeting.roomId'>
          </OrganizationDropdown>
          <ValidateErrorMessage :errors='v$.roomId.$errors'/>
        </div>
        <div class='field flex flex-wrap gap-3'>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='meeting.meetingType'
              input-id='ingredient2'
              name='meetingType'
              :value='MeetingType.OFFLINE'/>
            <label
              class='font-bold ml-2'
              for='ingredient2'>{{
                t('meeting.meeting.offlineMeeting')
              }}</label>
          </div>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='meeting.meetingType'
              input-id='ingredient1'
              name='meetingType'
              :value='MeetingType.ONLINE'/>
            <label
              class='font-bold ml-2'
              for='ingredient1'>{{
                t('meeting.meeting.onlineMeeting')
              }}</label>
          </div>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='meeting.meetingType'
              input-id='ingredient2'
              name='meetingType'
              :value='MeetingType.ONLINE_OFFLINE'/>
            <label
              class='font-bold ml-2'
              for='ingredient2'>{{
                t('meeting.meeting.onlineOfflineMeeting')
              }}</label>
          </div>
        </div>

        <div
          v-if='
            meeting.meetingType && meeting.meetingType !== MeetingType.OFFLINE
          '
          class='field'>
          <label class='font-bold'>{{ t('meeting.meeting.onlineLink') }}</label>
          <InputText
            v-model='meeting.onlineUrl'
            class='p-component p-inputtext w-full'
            maxlength='1000'
            name='onlineUrl'/>
        </div>

        <div class='field'>
          <label class='font-bold'>{{ t('meeting.meeting.guest') }}</label>
          <InputText
            v-model='meeting.guest'
            class='p-component p-inputtext w-full'
            maxlength='5000'
            name='guest'/>
        </div>

        <div class='field'>
          <label class='font-bold'>{{
            t('meeting.meeting.participatingDepartments')
          }}</label>
          <TreeSelect
            v-model='selectedOrg'
            class='p-component w-full'
            display='chip'
            :empty-message="t('common.selectEmpty')"
            input-id='organizationParent'
            :options='organizations'
            :placeholder="t('meeting.meeting.chooseParticipatingDepartments')"
            selection-mode='checkbox'>
            <template #value='{ value, placeholder }'>
              <Chip
                v-for='label in computeLabelDepartment(value, placeholder)'
                :key='label'
                :label='label'>
              </Chip>
            </template>
          </TreeSelect>
          <input
            v-model='meeting.departmentIds'
            hidden
            name='departmentIds'/>
        </div>

        <div class='field'>
          <label class='font-bold'>
            {{ t('Thuộc dự án') }}
          </label>
          <Dropdown
            v-model='meeting.projectId'
            class='p-component w-full'
            filter
            name='projectId'
            option-label='name'
            option-value='id'
            :options='projectOptions'
            show-clear>
          </Dropdown>
        </div>

        <div class='field'>
          <label class='font-bold'>{{ t('meeting.meeting.prepare') }}</label>
          <Textarea
            v-model='meeting.setup'
            :auto-resize='true'
            class='p-component p-inputtext w-full'
            maxlength='5000'
            name='setup'
            :rows='1'/>
        </div>

        <div class='field'>
          <label class='font-bold'>{{
            t('meeting.meeting.mediaDevices')
          }}</label>
          <MultiSelect
            v-model='meeting.mediaDeviceIds'
            class='p-component w-full'
            :max-selected-labels='3'
            option-label='name'
            option-value='id'
            :options='mediaDevices'/>
        </div>

        <div class='field'>
          <label
            class='font-bold'
            for='flow'>{{
              t('work-flow.process.process')
            }}</label>
          <div class='flex w-full'>
            <SelectFlowExisted
              v-model='meeting.flowId'
              :options='flows'/>
          </div>
        </div>

        <div class='field'>
          <label class='font-bold'>{{ t('meeting.meeting.note') }}</label>
          <Textarea
            v-model='meeting.note'
            :auto-resize='true'
            class='p-component p-inputtext w-full'
            maxlength='5000'
            :rows='1'/>
          <input
            v-model='meeting.note'
            hidden
            name='note'/>
        </div>

        <div class='flex justify-content-between'>
          <div class='field w-25rem'>
            <label class='font-bold'>{{
              t('meeting.meeting.numberAttendees')
            }}</label>
            <InputNumber
              v-model='meeting.numberAttendees'
              class='p-component w-full'
              :use-grouping='false'/>
            <input
              v-model='meeting.numberAttendees'
              hidden
              name='numberAttendees'/>
          </div>
          <div class='field w-10rem'>
            <div class='pb-2'>
              <label class='font-bold'>{{
                t('meeting.meeting.important')
              }}</label>
            </div>
            <NameInputSwitch
              v-model='meeting.isImportant'
              name='isImportant'>
            </NameInputSwitch>
          </div>
          <div></div>
        </div>

        <div class='flex justify-content-between'>
          <div>
            <div class='font-bold mb-1'>{{ t('meeting.meeting.remind') }}</div>
            <div class='field gap-2 grid grid-nogutter w-25rem'>
              <InputNumber
                v-model='meeting.remind'
                class='col-2 p-component'
                style='width: 80px'
                :use-grouping='false'/>
              <input
                v-model='meeting.remind'
                hidden
                name='remind'/>
              <Dropdown
                v-model='meeting.remindTimeType'
                name='remindTimeType'
                option-label='label'
                option-value='value'
                :options='remindTimeTypeOptions'>
              </Dropdown>
              <input
                v-model='meeting.remindTimeType'
                hidden
                name='remindTimeType'/>
              <Dropdown
                v-model='meeting.remindType'
                name='remindType'
                option-label='label'
                option-value='value'
                :options='remindTypeOptions'>
              </Dropdown>
              <input
                v-model='meeting.remindType'
                hidden
                name='remindType'/>
            </div>
          </div>
          <div class='field w-10rem'>
            <div class='pb-2'>
              <label class='font-bold'>{{
                t('meeting.meeting.isPrivate')
              }}</label>
            </div>
            <NameInputSwitch
              v-model='meeting.isPrivate'
              name='isPrivate'>
            </NameInputSwitch>
          </div>
          <div></div>
        </div>

        <div class='field'>
          <div class='align-items-center flex justify-content-between relative'>
            <TabMenu
              v-model:activeIndex='activeMenu'
              class='w-full'
              :model='items'>
            </TabMenu>
            <div class='flex gap-2 w-13rem'>
              <ButtonIcon
                class='border-round-sm'
                icon='upload'
                :label="t('common.uploadFile')"
                severity='warning'
                size='small'
                @click='addFile'/>
              <ButtonIcon
                class='border-round-sm'
                icon='create_new_folder'
                @click='chooseFromEcmDialogVisible = true'/>
            </div>
          </div>
          <UploadFilesGrid
            v-if='activeMenu === 0'
            ref='fileAttachments'
            v-model:files-deleted='meeting.filesDeleted'
            v-model:list-file='meeting.fileAttachments'>
            <template #header>
              <div></div>
            </template>
          </UploadFilesGrid>
          <UploadFilesGrid
            v-if='meeting.id && activeMenu === 1'
            ref='reportFileAttachments'
            v-model:files-deleted='meeting.reportFilesDeleted'
            v-model:list-file='meeting.reportFileAttachments'
            file-attachments-name='reportFileAttachments'
            files-deleted-name='reportFilesDeleted'>
            <template #header>
              <div></div>
            </template>
          </UploadFilesGrid>
        </div>
      </div>
    </div>
    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
      <Button
        class='border-round-sm p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        class='border-round-sm p-button-plain'
        icon='pi pi-save'
        :label="t('common.save')"
        :loading='isSubmitting'
        type='submit'/>
      <!--      <Button-->
      <!--        class='border-round-sm p-button-plain'-->
      <!--        icon='pi pi-save'-->
      <!--        :label="t('common.saveAndContinue')"-->
      <!--        :loading='isSubmitting'-->
      <!--        type='reset'/>-->
    </div>
  </form>
  <ChooseFromEcmDialog
    v-model:visible='chooseFromEcmDialogVisible'
    @choose-files='chooseFileEcm'/>

  <MeetingConflictDialog
    v-if='conflictMeetingDialog'
    :data='conflictMeeting'
    :visible-dialog='conflictMeetingDialog'
    @continue-saving='continueSaving'
    @hide-dialog='conflictMeetingDialog = false'/>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, get } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import SelectFlowExisted from '@/apps/document/views/doc/doc-out/component/flow/SelectFlowExisted.vue';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import { createMeeting, updateMeeting, } from '@/apps/meeting/api/rest/meetingApi';
import { getAllMediaDeviceByStatusActive } from '@/apps/meeting/graphql/media-device';
import { findConflictMeeting, getMeetingById } from '@/apps/meeting/graphql/meeting';
import { createCron } from '@/apps/meeting/helpers/utils';
import type { IMediaDevice } from '@/apps/meeting/model/mediaDevice';
import {
  defaultMeeting,
  type MeetingInterface,
  MeetingType,
  RemindTimeType,
  RemindType,
  RepeatMeeting,
} from '@/apps/meeting/model/meeting';
import MeetingConflictDialog from '@/apps/meeting/views/meeting/components/MeetingConflictDialog.vue';
import OrganizationDropdown from '@/apps/meeting/views/meeting/components/OrganizationDropdown.vue';
import { getAllProjects } from '@/apps/work/api/graphql/project';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import { flowsByType } from '@/apps/work-flow/api/graphql/flow-api';
import { FlowTypePredefined } from '@/apps/work-flow/components/start-flow';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import NameInputSwitch from '@/common/components/custom/NameInputSwitch.vue';
import UploadFilesGrid from '@/common/components/custom/UploadFilesGrid.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { compareDates } from '@/common/helpers/time-util';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'update']);
const organizations = ref();
let listOrg: OrganizationInterface[] = [];
const selectedOrgSetup = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();

getAllOrganizationResult((response) => {
  listOrg = get(response, 'data.allOrganizationPublic', []);
  organizations.value = listToTree(
    listOrg.map((organization: OrganizationInterface) => ({
      key: organization.code,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
  selectedOrg.value = calSelectedOrg();
});
const chooseFromEcmDialogVisible = ref(false);
const meeting = ref<MeetingInterface>({} as MeetingInterface);

if (props.id) {
  const { onResult } = getMeetingById(props.id);
  onResult((res) => {
    meeting.value = cloneDeep(res.data.getMeetingById);
    meeting.value = {
      ...meeting.value,
      attendeeIds: meeting.value.attendees
        .map((x) => x.userId)
        .filter((e) => e != meeting.value.hostId),
      startTime: new Date(meeting.value.startTime),
      endTime: meeting.value.endTime ? new Date(meeting.value.endTime) : null,
    };
    selectedOrg.value = calSelectedOrg();
  });
} else {
  meeting.value = cloneDeep(defaultMeeting);
  meeting.value.startTime = new Date(Date.now());
  meeting.value.endTime = new Date(Date.now() + 60 * 60 * 1000);
}

interface CheckStatus {
  [key: string]: {
    checked: boolean;
    partialChecked: boolean;
  };
}

const selectedOrg = ref<CheckStatus>();

function calSelectedOrg(): CheckStatus {
  let rs = meeting.value.departmentIds?.reduce((acc, curr) => {
    acc[curr] = {
      checked: true,
      partialChecked: false,
    };
    return acc;
  }, {} as CheckStatus);
  for (const key in rs) {
    let currOrg: OrganizationInterface | undefined = listOrg.find(
      (e) => e.code == key,
    );
    if (currOrg && currOrg.parentCode && !rs[currOrg.parentCode]) {
      rs[currOrg.parentCode] = {
        checked: false,
        partialChecked: true,
      };
    }
  }
  return rs;
}

const projectOptions = ref<ProjectInterface[]>([]);
const {
  onResult: allProjectsOnResult,
  load: allProjectsLoad
} =
  getAllProjects();
allProjectsOnResult((rs) => {
  projectOptions.value = get(rs, 'data.getAllProjects');
});
allProjectsLoad();
//For commit form
watch(selectedOrg, (value) => {
  const depCodes = [];
  for (const key in value) {
    const depObj = value[key];
    if (depObj.checked) {
      depCodes.push(key);
    }
  }
  meeting.value.departmentIds = depCodes;
});

watch(selectedOrgSetup, (value) => {
  const depCodes = [];
  for (const key in value) {
    const depObj = value[key];
    if (depObj.checked) {
      depCodes.push(key);
    }
  }
});

const { t } = useI18n();
const validateRules = {
  content: {
    required: helpers.withMessage(
      t('meeting.common.error.contentCantEmpty'),
      required,
    ),
  },
  startTime: {
    required: helpers.withMessage(
      t('meeting.common.error.startTimeCantEmpty'),
      required,
    ),
    checkStartTime: helpers.withMessage(
      t('meeting.common.error.startTimeInThePass'),
      (value: Date | undefined) => {
        if (props.id != null) {
          return true;
        }
        return value == undefined || value > new Date(Date.now());
      },
    ),
  },
  endTime: {
    checkEndTime: helpers.withMessage(
      t('meeting.common.error.startTimeAfterEndTime'),
      (value: Date | undefined) => {
        return value == undefined || value > meeting.value.startTime;
      },
    ),
    checkSameDay: helpers.withMessage(
      t('meeting.common.error.startDateSameEndDate'),
      (value: Date | undefined) => {
        return (
          value == undefined
          || compareDates(value, meeting.value.startTime) == 0
        );
      },
    ),
  },
  hostId: {
    required: helpers.withMessage(
      t('meeting.common.error.hostCantEmpty'),
      required,
    ),
  },
  attendeeIds: {
    required: helpers.withMessage(
      t('meeting.common.error.attendeesCantEmpty'),
      required,
    ),
  },
  roomId: {
    required: helpers.withMessage(
      t('meeting.common.error.meetingRoomCantEmpty'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, meeting);

const meetingForm = ref<HTMLFormElement>();
const isSubmitting = ref(false);

const {
  result,
  load: loadFlows,
  refetch,
  variables
} = flowsByType();

const flows = computed(() => result.value?.flowsByType || []);
const { moment } = useMoment();
onMounted(() => {
  variables.value = { type: FlowTypePredefined.MEETING_MEETING };
  loadFlows() || refetch();
});

function handleSubmitForm(shouldReset: boolean) {
  const handleSuccess = (message: string) => {
    toastSuccess({ message });
    if (shouldReset) {
      selectedOrg.value = {};
    } else {
      emits('hide-dialog');
    }
    meeting.value = cloneDeep(defaultMeeting);
    v$.value.$reset();
    isSubmitting.value = false;
  };

  v$.value.$validate().then((isValid: boolean) => {
    if (isValid && meetingForm.value) {
      isSubmitting.value = true;
      const formData = new FormData(meetingForm.value);
      formData.set('flowId', meeting.value.flowId || '');
      formData.set(
        'attendeeIds',
        [...meeting.value.attendeeIds, meeting.value.hostId].join(','),
      );
      meeting.value.projectId
      && formData.set('projectId', meeting.value.projectId);
      meeting.value.mediaDeviceIds
      && formData.set('mediaDeviceIds', meeting.value.mediaDeviceIds.join(','));
      formData.set(
        'cronConfig',
        createCron(meeting.value.repeat, meeting.value.cronConfig),
      );
      if (meeting.value.id) {
        updateMeeting(formData, meeting.value.id)
          .then(() => {
            handleSuccess(t('common.result.message.updateSuccess'));
          }).catch(() => isSubmitting.value = false);
      } else {
        createMeeting(formData)
          .then(() => {
            handleSuccess(t('common.result.message.createSuccess'));
          });
      }
    }
  });
}

const conflictMeeting = ref();
const conflictMeetingDialog = ref(false);
const shouldResetRef = ref(false);

const checkConflict = (shouldReset: boolean) => {
  shouldResetRef.value = shouldReset;
  const { onResult: findConflictMeetingResult } = findConflictMeeting(
    meeting.value.id,
    meeting.value.hostId,
    moment(meeting.value.startTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
    moment(meeting.value.endTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
  );
  findConflictMeetingResult(res => {
    conflictMeeting.value = res.data.findConflictMeeting;
    if (conflictMeeting.value.length > 0) {
      conflictMeetingDialog.value = true;
    } else {
      handleSubmitForm(shouldReset);
    }
  });
};

const continueSaving = () => {
  handleSubmitForm(shouldResetRef.value);
};

function submitMeetingForm() {
  checkConflict(false);
}

function submitAndResetForm() {
  checkConflict(true);
}

const mediaDevices = ref<IMediaDevice[]>();
const { onResult: getAllMediaDeviceByStatusActiveResult } =
  getAllMediaDeviceByStatusActive();

getAllMediaDeviceByStatusActiveResult((res) => {
  mediaDevices.value = res.data.getAllActiveMediaDevices;
});

function chooseFileEcm(data: EcmFile[]) {
  let filesEcm = data.map((d: EcmFile) => ({
    id: undefined,
    name: d.name,
    extension: d.extension,
    size: d.size,
    path: d.treePath,
    isDeleted: false,
    objectType: undefined,
    objectId: undefined,
  }));
  meeting.value.fileAttachments = [
    ...meeting.value.fileAttachments || [],
    ...filesEcm,
  ];
}

function changeAttendees() {
  meeting.value.numberAttendees =
    (meeting.value.attendeeIds?.length || 0) + (meeting.value.hostId ? 1 : 0);
}

const repeatOptions: {
  label: string;
  value: RepeatMeeting;
}[] = [
  {
    label: t('meeting.common.repeat.noRepeat'),
    value: RepeatMeeting.NO_REPEAT,
  },
  {
    label: t('meeting.common.repeat.dailyRepeat'),
    value: RepeatMeeting.DAILY_REPEAT,
  },
  {
    label: t('meeting.common.repeat.weeklyRepeat'),
    value: RepeatMeeting.WEEKLY_REPEAT,
  },
  {
    label: t('meeting.common.repeat.monthlyRepeat'),
    value: RepeatMeeting.MONTHLY_REPEAT,
  },
];

const remindTimeTypeOptions: {
  label: string;
  value: RemindTimeType;
}[] = [
  {
    label: t('meeting.common.remindTime.minute'),
    value: RemindTimeType.MINUTE,
  },
  {
    label: t('meeting.common.remindTime.hour'),
    value: RemindTimeType.HOUR,
  },
  {
    label: t('meeting.common.remindTime.day'),
    value: RemindTimeType.DAY,
  },
];

const remindTypeOptions: {
  label: string;
  value: RemindType;
}[] = [
  {
    label: t('meeting.common.remindType.notification'),
    value: RemindType.NOTIFICATION,
  },
  {
    label: t('meeting.common.remindType.email'),
    value: RemindType.EMAIL,
  },
  {
    label: t('meeting.common.remindType.all'),
    value: RemindType.ALL,
  },
];

const items = ref([
  { label: t('meeting.meeting.meetingDocument') },
  ...!props.id ? [] : [{ label: t('meeting.meeting.reportMeeting') }],
]);

const activeMenu = ref<0 | 1>(0);
const reportFileAttachments = ref();
const fileAttachments = ref();

function addFile() {
  if (activeMenu.value === 0) {
    fileAttachments.value?.addFile();
  } else {
    reportFileAttachments.value?.addFile();
  }
}

const computeLabelDepartment = (value: TreeNode[], placeholder: string) => {
  const mapNode: Map<string, TreeNode> = new Map();
  let rs: string[] = [];
  if (!value) {
    return placeholder;
  }
  for (const node of value) {
    mapNode.set(node.key || '', node);
    if (!mapNode.get(node.parentId)) {
      rs.push(node.label || '');
    }
  }
  return rs;
};
</script>

<style scoped>
:deep(.p-inputnumber-input) {
  width: 100%;
}
</style>
