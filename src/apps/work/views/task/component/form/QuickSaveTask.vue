<template>
  <Dialog
    v-model:visible='visible'
    class='w-8'
    :dismissable-mask='false'
    :header='t("work.task.menuOptions.quickCreateTask")'
    modal
    @hide='hideDialog'>
    <template #header>
      <div class='align-items-center column-gap-2 flex flex-row'>
        <ButtonIcon
          v-tooltip.top='"Thêm một dòng"'
          icon='add_circle'
          icon-size='1.5'
          rounded
          text
          @click='addTask'/>
        <span
          class='p-dialog-title'>{{ t('work.quickCreate') }}</span>
      </div>
    </template>
    <DataTable
      edit-mode='cell'
      :value='tasks'>
      <Column
        class='col-width'
        field='code'>
        <template #body='{data,index}'>
          {{ data?.code }}
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].code'/>
        </template>
        <template #header>
          <span v-required>
            Mã công việc
          </span>
        </template>
        <template #editor='{index}'>
          <Textarea
            v-model='tasks[index].code'
            auto-resize
            class='w-full'
            @focus='($event.target as HTMLInputElement)?.select()'>
          </Textarea>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].code'/>
        </template>
      </Column>

      <Column
        class='col-width'
        field='name'>
        <template #body='{data,index}'>
          {{ data?.name }}
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].name'/>
        </template>
        <template #header>
          <span v-required>
            Tên công việc
          </span>
        </template>
        <template #editor='{index}'>
          <Textarea
            v-model='tasks[index].name'
            auto-resize
            class='w-full'
            @focus='($event.target as HTMLInputElement)?.select()'>
          </Textarea>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].name'/>
        </template>
      </Column>
      <Column
        body-class='text-center'
        class='col-width'
        field='startTime'>
        <template #header>
          <span v-required>
            Ngày bắt đầu
          </span>
        </template>
        <template #body='{data,index}'>
          {{ data?.startTime ? formatDate(data?.startTime, 'DD/MM/YYYY HH:mm') : '' }}
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].startTime'/>
        </template>
        <template #editor='{index}'>
          <Calendar
            v-model='tasks[index].startTime'
            show-time>
          </Calendar>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].startTime'/>
        </template>
      </Column>
      <Column
        body-class='text-center'
        class='col-width'
        field='dueTime'
        :header='"Ngày kết thúc"'>
        <template #body='{data,index}'>
          {{ data?.dueTime ? formatDate(data?.dueTime, 'DD/MM/YYYY HH:mm') : '' }}
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].dueTime'/>
        </template>
        <template #editor='{index}'>
          <Calendar
            v-model='tasks[index].dueTime'
            class='w-full'
            show-time>
          </Calendar>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].dueTime'/>
        </template>
      </Column>

      <Column
        class='col-width'>
        <template #header>
          <span v-required>
            Người giao việc
          </span>
        </template>
        <template #body='{data,index}'>
          <AppUser
            name-visible
            :user-id='data?.assigner?.id'>
          </AppUser>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].assignerId'/>
        </template>
        <template #editor='{index}'>
          <Dropdown
            v-model='tasks[index].assigner'
            class='w-full'
            :option-value='data => ({
              id:data.id,
              fullName:data.fullName
            })'
            :options='allUsers'>
            <template #value='slotProps'>
              <AppUser
                v-if='slotProps.value?.id'
                avatar-size='2'
                is-highlight
                name-visible
                :user-id='slotProps.value.id'/>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option='slotProps'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='slotProps.option.id'></AppUser>
            </template>
          </Dropdown>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].assignerId'/>
        </template>
      </Column>

      <Column
        class='col-width'>
        <template #header>
          <span v-required>
            Người thực hiện
          </span>
        </template>
        <template #body='{data,index}'>
          <AppGroupAvatar
            :overlay-visible='false'
            :user-ids='data?.participants?.map((e:Participant)=>e.participantId)'
            :users-highlight='tasks[index].assigner?.id ? [tasks[index]?.assigner?.id || ""]:undefined'>
          </AppGroupAvatar>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].participants'/>
        </template>
        <template #editor='{index}'>
          <MultiSelect
            v-model='tasks[index].participants'
            class='w-full'
            display='chip'
            :option-value='data => ({
              participantId:data.id,
              type:ParticipantType.IMPLEMENTER
            })'
            :options='allUsers'>
            <template #option='slotProps'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments','username']"
                name-visible
                :user-id='slotProps.option.id'></AppUser>
            </template>
            <template #chip='{ value }'>
              <AppUser
                avatar-size='1.5'
                name-visible
                :user-id='value?.participantId'></AppUser>
            </template>
          </MultiSelect>
          <ValidateErrorMessage :errors='v$.tasks.$each.$response.$errors[index].participants'/>
        </template>
      </Column>

      <Column>
        <template #body='{index}'>
          <AppIcon
            v-tooltip='t("common.delete")'
            class='align-content-center cursor-pointer'
            name='delete'
            size='1.5'
            @click='deleteTask(index)'>
          </AppIcon>
        </template>
      </Column>

    </DataTable>

    <template #footer>
      <Button
        class='border-round-sm'
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='hideDialog'>
      </Button>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        :label='t("common.save")'
        @click='submit'>
      </Button>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getTaskCodeGraphql } from '@/apps/work/api/graphql/parameter-config';
import { saveTasksGraphql } from '@/apps/work/api/graphql/task-api';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import {
  CompletionType,
  type Participant,
  ParticipantType,
  SourceType,
  type Task,
  TaskPriority
} from '@/apps/work/model/task';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import { useTaskStore } from '@/apps/work/store/task';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDate } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  parentTaskId: {
    type: String,
    default: undefined
  }
});
const emits = defineEmits(['hide-dialog', 'reload']);
const visible = defineModel<boolean>('visible', { default: false });

const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const { moment } = useMoment();
const { statuses } = storeToRefs(useTaskStore());
const taskCode = ref('TASk');
const defaultTask: Task = {
  code: taskCode.value,
  name: 'Công việc',
  weight: 1.0,
  type: SourceType.NONE,
  completionType: CompletionType.AUTO,
  isRepeat: false,
  remind: false,
  percent: 0.0,
  autoProgress: true,
  startTime: new Date(),
  assigner: user.value,
  participants: [{
    participantId: user.value.id || '',
    type: ParticipantType.IMPLEMENTER
  }],
  priority: TaskPriority.NORMAL
};
const tasks = ref<Task[]>([{
  ...cloneDeep(defaultTask),
  code: taskCode.value
}]);
const validateTime = (dueTime: Date, task: Task) => {
  const startTime = (task.startTime as Date)?.getTime() ?? 0;
  return startTime === 0 || !dueTime || startTime < dueTime.getTime();
};
const validateRules = {
  tasks: {
    $each: helpers.forEach({
      code: { required: helpers.withMessage(t('work.validate.codeEmpty'), required) },
      name: { required: helpers.withMessage(t('work.validate.nameEmpty'), required) },
      startTime: { required: helpers.withMessage(t('work.validate.startTimeEmpty'), required) },
      dueTime: { range: helpers.withMessage(t('work.validate.dueMustGreaterThanStart'), validateTime) },
      assigner: { required: helpers.withMessage(t('work.validate.assignerNotSelected'), required) },
      participants: { required: helpers.withMessage(t('work.validate.assignerNotSelected'), required) },
    })
  }
};
const v$ = useVuelidate(validateRules, { tasks: tasks },);

function addTask() {
  let newTask = {
    ...cloneDeep(defaultTask),
    code: taskCode.value
  };
  tasks.value.push(newTask);
}

function deleteTask(index: number) {
  tasks.value.splice(index, 1);
}

function hideDialog() {
  emits('hide-dialog');
  visible.value = false;
  tasks.value = [cloneDeep(defaultTask)];

}

function submit() {
  saveWork();
}

const {
  mutate: saveTasksMutate,
  onDone: saveTasksOnDone,
  onError: saveTaskOnError
} = saveTasksGraphql();

saveTaskOnError((error) => {
  const extension = error.graphQLErrors[0]?.extensions;
  const data = {
    message: '',
    code: '',
  };
  if ((extension?.errorCode as string).startsWith('codeIsEarlyExists')) {
    data.message = 'Mã công việc đã tồn tại.';
  } else if ((extension?.errorCode as string).startsWith('userNotInParentTask')) {
    data.message = 'Người tham gia công việc con không thuộc công việc cha.';
  } else if ((extension?.errorCode as string).startsWith('ProjectNotFound')) {
    data.message = 'Không tìm thấy dự án.';
  } else if ((extension?.errorCode as string).startsWith('userNotInProject')) {
    data.message = 'Người tham gia không thuộc dự án.';
  }

  toastErrorData({ error: { data: data } });
});

function saveWork() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const statusId = statuses.value?.find(e => e.type == StatusType.START)?.id;
      const data = map(tasks.value, (task) => (
        {
          code: task.code,
          name: task.name,
          statusId: statusId,
          startTime: moment(task.startTime).format('YYYY-MM-DDTHH:mm:ss'),
          assignerId: task.assigner?.id,
          dueTime: task.dueTime ? moment(task.dueTime).format('YYYY-MM-DDTHH:mm:ss') : null,
          participants: map(task.participants, (user) => ({
            type: ParticipantType[ParticipantType.IMPLEMENTER],
            participantId: user.participantId,
            percent: 1 / task.participants.length || 0
          })),
          parentId: props.parentTaskId
        }
      ));

      saveTasksMutate({ tasks: data });
    }
  }).catch((error) => {
    toastError(error);
  });
}

saveTasksOnDone((response) => {
  toastSuccess({ message: t('common.result.message.created', { itemType: t('work.objectName') }) });
  emits('reload');
  visible.value = false;
  tasks.value = [cloneDeep(defaultTask)];
});

const { parameterTask } = storeToRefs(useParameterConfigStore());
watch(parameterTask, (value) => {
  if (value?.codeSettings.enabled) {
    const { onResult } = getTaskCodeGraphql();
    onResult(res => {
      taskCode.value = res.data?.getTaskCode;
      tasks.value.forEach((task) => task.code = taskCode.value);
    });
  }
});

//Focus test
const inputRefs = ref([]);

</script>

<style scoped>
:deep(.avatar-container) {
  justify-content: center
}

:deep(.group-avatar-container) {
  justify-content: center;
  width: min-content;
  margin: auto;
}

.col-width {
  width: 30%
}
</style>