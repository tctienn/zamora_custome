<template>
  <Dialog
    v-model:visible='visible'
    style='width: 90vw;'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>

    <template #header>
      <div class='align-items-center column-gap-2 flex flex-row'>
        <ButtonIcon
          icon='add_circle'
          icon-size='1.5'
          rounded
          text
          @click='addTask'/>
        <span
          class='p-dialog-title'
          data-pc-section='headertitle'>{{ t('work.quickCreate') }}</span>
      </div>
    </template>

    <div
      v-for='(task, index) in tasks'
      :key='index'
      class='column-gap-3 flex flex-row'>
      <div class='column-gap-3 flex flex-1 flex-row p-fluid'>
        <div class='field flex-1'>
          <label
            v-required
            for='name'>
            {{ t('work.name') }}
          </label>
          <InputText
            id='name'
            v-model='task.name'
            :class='{"p-invalid": v$.tasks.$each.$response?.$errors[index].name?.length}'/>
          <ValidateErrorMessage
            v-if='v$.tasks.$each.$response?.$errors[index].name'
            :errors='v$.tasks.$each.$response?.$errors[index].name'/>
        </div>

        <div class='field flex-1'>
          <label
            v-required
            for='startDate'>
            {{ t('common.startDate') }}
          </label>
          <Calendar
            v-model='task.startTime'
            :class='{"p-invalid": v$.tasks.$each.$response?.$errors[index].startTime?.length}'
            date-format='DD, dd/mm/yy'
            hide-on-date-time-select
            hour-format='24'
            show-time/>
          <ValidateErrorMessage
            v-if='v$.tasks.$each.$response?.$errors[index].startTime'
            :errors='v$.tasks.$each.$response?.$errors[index].startTime'/>
        </div>

        <div class='field flex-1'>
          <label
            for='deadline'>
            {{ t('work.deadline') }}
          </label>
          <Calendar
            v-model='task.dueTime'
            :class='{"p-invalid": v$.tasks.$each.$response?.$errors[index].dueTime?.length}'
            date-format='dd/mm/yy'
            hide-on-date-time-select
            hour-format='24'
            show-button-bar
            show-time/>
          <ValidateErrorMessage
            v-if='v$.tasks.$each.$response?.$errors[index].dueTime'
            :errors='v$.tasks.$each.$response?.$errors[index].dueTime'/>
        </div>

        <div class='field flex-1'>
          <label
            v-required
            for='assigner'>
            {{ t('work.assigner') }}
          </label>
          <Dropdown
            v-model='task.assigner'
            :class='{"p-invalid": v$.tasks.$each.$response?.$errors[index].assigner?.length}'
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                name-visible
                :user-id='option.id'/>
            </template>
            <template #value='{ value }'>
              <AppUser
                v-if='value'
                avatar-size='1.5'
                name-visible
                :user-id='value.id'/>
            </template>
          </Dropdown>
          <ValidateErrorMessage
            v-if='v$.tasks.$each.$response?.$errors[index].assigner'
            :errors='v$.tasks.$each.$response?.$errors[index].assigner'/>
        </div>

        <div class='field flex-1'>
          <label
            v-required
            for='implementer'>
            {{ t('work.implementer') }}
          </label>
          <MultiSelect
            v-model='task.participants'
            :class='{"p-invalid": v$.tasks.$each.$response?.$errors[index].participants?.length}'
            display='chip'
            :options='users'>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                name-visible
                :user-id='option.id'/>
            </template>
            <template #chip='{ value }'>
              <AppUser
                v-if='findIndex(task.participants, ["id", value.id]) <= 2'
                avatar-size='1.5'
                :name-visible='true'
                :user-id='value.id'/>

              <!--              <AppUser-->
              <!--                v-if='findIndex(task.participants, ["id", value.id]) <= 2'-->
              <!--                avatar-size='1.5'-->
              <!--                :info-visible='false'-->
              <!--                :name-visible='task.participants.length <= 1'-->
              <!--                :user='value'/>-->
              <div
                v-else-if='findIndex(task.participants, ["id", value.id]) === 3'
                class='more_implementers'>
                {{ `+${task.participants.length - 3}` }}
              </div>
              <div
                v-else
                class='hidden'>
              </div>
            </template>
          </MultiSelect>

          <ValidateErrorMessage
            v-if='v$.tasks.$each.$response?.$errors[index].participants'
            :errors='v$.tasks.$each.$response?.$errors[index].participants'/>
        </div>
      </div>

      <div
        v-if='tasks.length > 1'
        class='flex flex-column remove-task-btn'>
        <ButtonIcon
          class='p-1 w-auto'
          icon='do_not_disturb_on'
          rounded
          severity='danger'
          text
          @click='tasks.splice(index, 1)'/>
      </div>

    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { find, findIndex, get, isEmpty, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { saveTasksGraphql } from '@/apps/work/api/graphql/task-api';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import { CompletionType, ParticipantType, SourceType, type Task, TaskPriority } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import AppUser from '@/common/components/app/AppUser.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { User } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();
const { moment } = useMoment();
const { user } = storeToRefs(useUserStore());

const taskStore = useTaskStore();
const { statuses } = taskStore;

const quickSaveWorkFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveWork()
  }
};
provide('dialogFooterButtons', quickSaveWorkFooterButtons);

const visible = ref(props.dialogVisible);
const defaultTask: Task = {
  name: '',
  weight: 1.0,
  type: SourceType.NONE,
  completionType: CompletionType.AUTO,
  isRepeat: false,
  remind: false,
  percent: 0.0,
  autoProgress: true,
  startTime: new Date(),
  assigner: user.value,
  participants: [],
  priority: TaskPriority.NORMAL
};
const tasks = ref<Task[]>([defaultTask]);

const users = ref<User[]>([]);

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});

const validateTime = (dueTime: Date, task: Task) => {
  const startTime = (task.startTime as Date)?.getTime() ?? 0;
  return startTime === 0 || !dueTime || startTime < dueTime.getTime();
};

const validateRules = {
  tasks: {
    $each: helpers.forEach({
      name: { required: helpers.withMessage(t('work.validate.nameEmpty'), required) },
      startTime: { required: helpers.withMessage(t('work.validate.startTimeEmpty'), required) },
      dueTime: { range: helpers.withMessage(t('work.validate.dueMustGreaterThanStart'), validateTime) },
      assigner: { required: helpers.withMessage(t('work.validate.assignerNotSelected'), required) },
      participants: { required: helpers.withMessage(t('work.validate.assignerNotSelected'), required) },
    })
  },
};

const v$ = useVuelidate(validateRules, { tasks: tasks }, {
  $lazy: true,
  $autoDirty: true
});

function addTask() {
  const lastTask = tasks.value[tasks.value.length - 1];
  if (!lastTask || lastTask && !isEmpty(lastTask.name)) {
    tasks.value.push(defaultTask);
  }
}

const {
  mutate: saveTasksMutate,
  onDone: saveTasksOnDone,
  onError: saveTasksOnError
} = saveTasksGraphql();

function saveWork() {
  const startStatus = find(statuses, ['type', StatusType.START]);
  v$.value.$validate().then((isValid) => {
    if (startStatus && isValid) {
      const data = map(tasks.value, (task) => (
        {
          name: task.name,
          statusId: startStatus.id,
          startTime: moment(task.startTime).format('YYYY-MM-DDTHH:mm:ss'),
          dueTime: task.dueTime ? moment(task.dueTime).format('YYYY-MM-DDTHH:mm:ss') : null,
          participants: map(task.participants, (user) => ({
            type: ParticipantType[ParticipantType.IMPLEMENTER],
            participantId: user.id,
            percent: 1 / task.participants.length || 0
          }))
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
  taskStore.addTasks(get(response, 'data.saveTasks', []));
});

saveTasksOnError((err) => {
  toastError({ message: t('work.task.error.' + err.graphQLErrors[0].extensions.errorCode) });
});
</script>

<script lang='ts'>
export default { name: 'QuickSaveWork' };
</script>

<style lang='scss' scoped>
.remove-task-btn {
  margin-top: 2.5rem;
}

:deep(.p-multiselect-label) {
  display: flex;

  :nth-child(4) {
    background-color: transparent;
  }

  :nth-child(n + 5 of .p-multiselect-token) {
    display: none !important;
  }

  .more_implementers, .hidden {
    + svg.p-multiselect-token-icon {
      display: none !important;
    }
  }
}

</style>