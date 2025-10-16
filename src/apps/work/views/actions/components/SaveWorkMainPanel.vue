<template>
  <div
    class='flex flex-column row-gap-2'>
    <div>
      <div class='field'>
        <label
          v-required
          class='font-medium'
          for='code'>
          {{ t('work.code') }}
        </label>
        <InputText
          id='code'
          v-model='task.code'
          class='p-component p-inputtext w-full'
          :disabled='!parameterTask?.codeSettings?.allowEdit && parameterTask?.codeSettings?.enabled'
          maxlength='255'
          name='code'/>
        <ValidateErrorMessage :errors='v$.task.code.$errors'/>
      </div>

      <div class='field'>
        <label
          v-required
          class='font-medium'
          for='name'>
          {{ t('work.name') }}
        </label>
        <InputText
          id='name'
          v-model='task.name'
          class='p-component p-inputtext w-full'
          maxlength='255'
          name='name'/>
        <ValidateErrorMessage :errors='v$.task.name.$errors'/>
      </div>

      <div class='field'>
        <label
          class='font-medium'>
          {{ t('Nhóm công việc') }}
        </label>
        <Dropdown
          v-model='task.groupId'
          class='p-component  w-full'
          filter
          option-label='name'
          option-value='id'
          :options='resultTaskGroup?.getAllActiveTaskGroup'
          show-clear>
        </Dropdown>
      </div>

      <div class='field'>
        <label
          class='font-medium'>
          {{ t('Thuộc dự án') }}
        </label>
        <Dropdown
          v-model='task.projectId'
          class='p-component w-full'
          :disabled='disabledProjectSelection'
          filter
          option-label='name'
          option-value='id'
          :options='resultProject?.getProjectsRelateWithId'
          :show-clear='!disabledProjectSelection'
          @change='changeProjectId'>
        </Dropdown>
      </div>

      <div class='field'>
        <label
          v-required
          class='font-medium'>{{ t('Người giao việc') }}</label>
        <NamedSelectUser
          v-model='task.assignerId'
          class='p-component'
          name='assignerId'
          :placeholder="`${t('common.choose')} ${t('work.work.assigner').toLowerCase()}`"/>
        <ValidateErrorMessage :errors='v$.task.assignerId.$errors'/>
      </div>

      <div class='field'>
        <label
          v-required
          class='font-medium'>{{ t('work.project.implementers') }}</label>
        <NamedMultiSelectUser
          v-model:list-user='implementers'
          class='p-component w-full'
          :disabled='!(task.createdBy==user.id || task.assignerId==user.id || (isImplementer && editableFields?.addAssignee))'
          name='implementers'
          :options='implementerPool'
          :placeholder="`${t('common.choose')} ${t('work.project.implementers').toLowerCase()}`"
          :select-max='999'/>
        <ValidateErrorMessage :errors='v$.participants.implementer.$errors'/>
      </div>

      <div class='field'>
        <label
          class='font-medium'>{{ t('work.project.followers') }}</label>
        <NamedMultiSelectUser
          v-model:list-user='followers'
          class='p-component'
          name='followers'
          :placeholder="`${t('common.choose')} ${t('work.project.followers').toLowerCase()}`"
          :select-max='999'/>
      </div>

      <div
        v-if='phaseOptions?.length>0 &&task.projectId'
        class='field'>
        <label
          class='font-medium'>{{ 'Giai đoạn' }}

        </label>
        <div class='align-items-center flex gap-2'>
          <Dropdown
            v-model='task.phaseId'
            class='p-component'
            :disabled='disabledPhaseSelection'
            option-label='name'
            option-value='id'
            :options='phaseOptions'
            :show-clear='!disabledPhaseSelection'
            style='min-width:25%'>

          </Dropdown>
          <span class='font-medium white-space-nowrap'>
            {{
              selectedPhase ? `(Từ ${formatDateTime(selectedPhase.fromDate, 'DD/MM/YYYY')} đến ${formatDateTime(selectedPhase.toDate, 'DD/MM/YYYY')} )` : ''
            }}
          </span>
        </div>
      </div>

      <div class='flex gap-1'>
        <div class='field w-6'>
          <label
            v-required
            class='font-medium'>{{ t('Ngày bắt đầu') }}
          </label>
          <div class='flex'>
            <Calendar
              v-model='task.startTime'
              date-format='dd/mm/yy'
              :disabled='!(task.createdBy==user.id || task.assignerId==user.id || (isImplementer && editableFields?.updateDate)) && !!task.id'
              hide-on-date-time-select
              hour-format='24'
              :select-other-months='true'
              show-icon
              show-time
              style='min-width:50%'/>
          </div>
          <ValidateErrorMessage :errors='v$.task.startTime.$errors'/>
        </div>
        <div class='field'>
          <label
            v-required
            class='font-medium'>{{ t('Ngày kết thúc') }}</label>
          <div class='flex'>
            <Calendar
              v-model='task.dueTime'
              date-format='dd/mm/yy'
              :disabled='!(task.createdBy==user.id || task.assignerId==user.id || (isImplementer && editableFields?.updateDate)) && !!task.id'
              hide-on-date-time-select
              hour-format='24'
              :select-other-months='true'
              show-icon
              show-time
              style='min-width:50%'/>
          </div>
          <ValidateErrorMessage :errors='v$.task.dueTime.$errors'/>
        </div>
      </div>

      <div
        class='field'>
        <label
          class='font-medium'
          for='description'>
          {{ t('common.description') }}
        </label>
        <AppEditor
          v-model='task.description'
          class='w-full'
          editor-style='height: 15rem;'
          :readonly='(taskId&&!(task.createdBy==user.id || task.assignerId==user.id || (isImplementer && editableFields?.descriptionGoal)))==true'>
        </AppEditor>
      </div>

      <div class='field'>
        <label
          class='font-medium'>{{ t('work.project.target') }}</label>
        <AppEditor
          v-model='task.target'
          class='w-full'
          editor-style='height: 15rem;'
          :readonly='(taskId&&!(task.createdBy==user.id || task.assignerId==user.id || (isImplementer && editableFields?.descriptionGoal)))==true'>
        </AppEditor>
      </div>

      <div class='flex gap-3 justify-content-start'>
        <div class='field'>
          <label
            v-required
            class='font-medium'>{{ t('Mức độ ưu tiên') }}</label>
          <Dropdown
            v-model='task.priority'
            class='p-component w-full'
            option-label='label'
            option-value='value'
            :options='TASK_PRIORITY_OPTIONS'>
          </Dropdown>
          <!--        <ValidateErrorMessage :errors='v$.priority.$errors'/>&ndash;&gt;-->
        </div>
        <div class='field'>
          <label
            v-required
            class='font-medium'>{{ t('Trạng thái') }}</label>
          <Dropdown
            v-model='task.statusId'
            class='w-full'
            option-value='id'
            :options='statusOptions'>
            <template #option='{option}'>
              <span
                class='status-badge'
                :style="{'background-color':'#'+option.color,
                         'color':calculateColorBasedOnBackgroundColor('#'+option.color||'ffffff')
                }">
                {{ option?.name }}
              </span>
            </template>
            <template #value='{value}'>
              <template
                v-for='item in [statusOptions.find((e:any)=>e.id==value)]'
                :key='item?.id'>
                <span
                  class='status-badge'
                  :style="{'background-color':`#${item?.color||`ffffff`}`,
                           'color':calculateColorBasedOnBackgroundColor(`#${item?.color||'ffffff'}`)
                  } ">
                  {{ item?.name || '&nbsp;' }}
                </span>
              </template>
            </template>
          </Dropdown>
        </div>
      </div>
      <div class='flex gap-3 gap-3 justify-content-start'>
        <div class='flex gap-3 gap-3 justify-content-start'>
          <div class='field'>
            <label
              class='font-medium'>{{ t('work.project.createdDate') }}</label>
            <div>
              <Calendar
                v-model='task.createdDate'
                date-format='dd/mm/yy'
                :select-other-months='true'
                show-icon/>
              <input
                v-model='task.createdDate'
                hidden
                name='createdDate'>
            </div>
          </div>
          <div class='field w-18rem'>
            <label
              class='font-medium'>{{ t('work.project.seqNumber') }}</label>
            <div>
              <InputNumber
                v-model='task.orderNo'
                class='w-full'/>
              <input
                hidden
                name='sequenceNumber'>
            </div>
          </div>
        </div>
        <div class='field'>
          <label
            class='font-medium'>{{ t('work.project.createdBy') }}</label>
          <AppUser
            v-model='task.createdBy'
            avatar-size='2.5'
            :is-flex='true'
            :overlay-visible='true'
            :user-id='task.createdBy ?? user.id'>
          </AppUser>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { allStatus } from '@/apps/work/api/graphql/config-work-status-api';
import { getTaskCodeGraphql } from '@/apps/work/api/graphql/parameter-config';
import { searchPhase } from '@/apps/work/api/graphql/phase';
import { getProjectsRelateWithId } from '@/apps/work/api/graphql/project';
import { getAllActiveTaskGroup } from '@/apps/work/api/graphql/task-group';
import { type ClientInterface } from '@/apps/work/model/client';
import { StatusType, type TaskStatus } from '@/apps/work/model/configWorkStatus';
import type { ProjectPhase, SearchPhase } from '@/apps/work/model/phase';
import {
  type CheckList,
  CompletionType,
  type Participant,
  ParticipantType,
  RepeatType,
  SourceType,
  type Task,
  type TaskLocation,
  type TaskRepeatConfig,
  type TaskSource
} from '@/apps/work/model/task';
import { TaskPriority } from '@/apps/work/model/work';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDateTime } from '@/common/helpers/time-util';
import { createOptions } from '@/common/helpers/utils';
import type { Attachment } from '@/common/model';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined,
  },
  disabledPhaseSelection: {
    type: Boolean,
    default: false,
  },
  taskId: {
    type: String,
    default: undefined
  }
});

const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const task = defineModel<Task>('task', {
  default: {
    weight: 1,
    repeatConfig: { taskId: '' },
    startTime: new Date(),
    completionType: CompletionType.AUTO,
    createdDate: new Date(),
  }
});

const taskChecklist = ref<CheckList[]>([]);
const taskLocation = ref<TaskLocation[]>([]);
const taskSource = ref<TaskSource>({ type: SourceType[SourceType.NONE] });

function setParticipantByType(participantType: ParticipantType, chosenUserIds: string[], participants: Participant[]): Participant[] {
  participants = participants.filter(e => e.type !== participantType);
  const newImplementers = chosenUserIds.map<Participant>(e =>
    ({
      participantId: usersMoreInfo.value[e].id,
      type: participantType,
      percent: 1 / chosenUserIds.length
    })
  );
  return [...participants, ...newImplementers];
}

const implementers = computed<string[]>({
  set(newValue) {
    task.value.participants = setParticipantByType(ParticipantType.IMPLEMENTER, newValue, task.value.participants);
  },
  get() {
    const value = task.value?.participants;
    return filterThenMap(value || [], item => item.type == ParticipantType.IMPLEMENTER, item => item.participantId || '');
  }
});

const followers = computed<string[]>({
  set(newValue) {
    task.value.participants = setParticipantByType(ParticipantType.FOLLOWER, newValue, task.value.participants);
  },
  get() {
    const value = task.value?.participants;
    return filterThenMap(value || [], item => item.type == ParticipantType.FOLLOWER, item => item.participantId || '');
  }
});

const taskCustomers = ref<ClientInterface[]>([]);
const taskAttachments = ref<Attachment[]>([]);
const files = ref<FileList>();
const repeatConfig = ref<TaskRepeatConfig>({
  createTimeConfig: new Date(new Date().setHours(8, 30, 0, 0)),
  type: RepeatType[RepeatType.DAILY]
});
const taskParent = ref<Task | null>(null);

const validateTime = (dueTime: Date) => {
  const startTime = task.value.startTime ? new Date(task.value.startTime)?.getTime() : 0;
  return startTime === 0 || !dueTime || startTime < dueTime.getTime();
};

const validateImplementer = () => {
  return task.value.participants.filter(e => e.type === ParticipantType.IMPLEMENTER).length > 0;
};
const validateInScopeProject = () => {
  if (!implementerPoolIds.value) {
    return true;
  }
  return implementers.value.every(e => implementerPoolIds.value?.includes(e));
};

function startTimeInPhase() {
  if (!selectedPhase.value || !task.value?.startTime) {
    return true;
  }
  return selectedPhase.value.fromDate <= task.value.startTime;
}

function endTimeInPhase() {
  if (!selectedPhase.value || !task.value?.dueTime) {
    return true;
  }
  return selectedPhase.value?.toDate >= task.value.dueTime;
}

const validateRules = {
  task: {
    code: { required: helpers.withMessage(t('work.validate.codeEmpty'), required) },
    name: { required: helpers.withMessage(t('work.validate.nameEmpty'), required) },
    startTime: {
      required: helpers.withMessage(t('work.validate.startTimeEmpty'), required),
      startTimeInPhase: helpers.withMessage(t('work.validate.startTimeBeforePhase'), startTimeInPhase)
    },
    dueTime: {
      range: helpers.withMessage(t('work.validate.endTimeEmpty'), required),
      dueTimeInPhase: helpers.withMessage(t('work.validate.dueTimeBeforePhase'), endTimeInPhase)
    },
    assignerId: { required: helpers.withMessage(t('work.validate.assignerNotSelected'), required) },
  },
  participants: {
    implementer: {
      required: helpers.withMessage(t('work.validate.implementerNotSelected'), validateImplementer),
      inScopeProject: helpers.withMessage(t('work.validate.outScopeProject'), validateInScopeProject)
    }
  }
};
// const validateRules = {};
const v$ = useVuelidate(validateRules, {
  task: task,
  participants: task.value.participants
});

async function validateTask() {
  return await v$.value.$validate();
}

watch(() => repeatConfig.value.type, (newValue) => {
  switch (newValue) {
  case RepeatType[RepeatType.WEEKLY]:
    repeatConfig.value.daysOfMonth = undefined;
    break;
  case RepeatType[RepeatType.DAYS_IN_MONTH]:
    repeatConfig.value.daysOfWeek = undefined;
    break;
  default:
    repeatConfig.value.daysOfWeek = undefined;
    repeatConfig.value.daysOfMonth = undefined;
  }
});
const {
  result: resultProject,
  load: loadProjects
} = getProjectsRelateWithId();
const {
  result: resultTaskGroup,
  load: loadTaskGroup
} = getAllActiveTaskGroup();
loadProjects();
loadTaskGroup();
const TASK_PRIORITY_OPTIONS = createOptions(TaskPriority, key => t(`work.task.priority.${camelCase(key)}`));
const {
  result: allStatusResult,
  onResult: allStatusOnResult
} = allStatus();
const statusOptions = computed<TaskStatus[]>(() => {
  return allStatusResult.value?.allStatus || [];
});
allStatusOnResult(res => {
  if (
    !task.value.statusId
  ) {
    const status = res.data?.allStatus.find((status: TaskStatus) => {
      return status.type == StatusType.START;
    }) as TaskStatus;
    task.value.statusId = status?.id;
  }
});

//Boundary implementer by projectId
const implementerPool = computed<UserMoreInfo[] | undefined>(() => {
  return implementerPoolIds.value?.map((e: string) => usersMoreInfo.value[e]);
});
const implementerPoolIds = ref<string[]>();
watch(() => task.value.projectId, projectId => {
  //Neu co fetch project roi gioi han
  if (projectId) {
    implementerPoolIds.value = resultProject?.value?.getProjectsRelateWithId
      ?.find((e: ProjectInterface) => e.id == projectId)?.implementers;
    //Neu khong thi la all
  } else {
    implementerPoolIds.value = undefined;
  }
}, { immediate: true, });

//Phase

const searchPhaseModel = computed<SearchPhase>(() => ({
  projectId: task.value.projectId,
  from: undefined,
  to: undefined
}));
const {
  result: phaseResult,
  load: loadPhase,
  refetch: refetchPhase
} = searchPhase(searchPhaseModel.value);
const phaseOptions = computed<ProjectPhase[]>(() => {
  return phaseResult.value?.searchPhase || [];
});
const selectedPhase = computed<ProjectPhase | undefined>(() => {
  const selected = phaseOptions.value?.find(e => e.id == task.value.phaseId);
  if (!selected) {
    return undefined;
  }
  return {
    ...selected,
    fromDate: new Date(selected.fromDate + 'T00:00:00'),
    toDate: new Date(selected.toDate + 'T23:59:59'),
  };
});

watch(selectedPhase, phase => {
  if (phase?.fromDate && !task.value?.startTime) {
    task.value.startTime = phase.fromDate;
  }
  if (phase?.toDate && !task.value?.dueTime) {
    task.value.dueTime = phase.toDate;
  }
});

//Truong hop update
watch(() => task.value.projectId, (projectId) => {
  if (projectId) {
    loadPhase(null, { searchModel: searchPhaseModel.value })
    || refetchPhase({ searchModel: searchPhaseModel.value });
  }
}, { immediate: true });

function changeProjectId(event: DropdownChangeEvent) {
  task.value.phaseId = undefined;
}

// Task code in config
const { parameterTask, } = storeToRefs(useParameterConfigStore());

if (!props.taskId && parameterTask.value?.codeSettings?.enabled) {
  const {
    result,
    onResult
  } = getTaskCodeGraphql();
  onResult(res => {
    task.value.code = res.data?.getTaskCode;
  });
}

const editableFields = computed(() => {
  return parameterTask.value?.editableFields;
});
const isImplementer = computed(() => {
  return implementers.value.some(e => e == user.value.id);
});

const disabledProjectSelection = computed<boolean>(() => {
  return !task.value.id && !!task.value?.projectId;
});
defineExpose({
  mainTask: task.value,
  taskData: {
    checklist: taskChecklist,
    location: taskLocation,
    source: taskSource.value,
    attachments: taskAttachments,
    files: files,
    parent: taskParent,
    repeatConfig: repeatConfig.value,
    taskCustomers: taskCustomers
  },
  validateTask
});
</script>

<script lang='ts'>
export default { name: 'SaveWorkMainPanel' };
</script>

<style lang='scss' scoped>
</style>