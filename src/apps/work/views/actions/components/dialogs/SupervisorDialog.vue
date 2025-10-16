<template>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      class='flex flex-column mt-2 row-gap-2 w-12'>
      <div class='flex flex-column row-gap-2'>
        <div class='field p-fluid'>
          <label
            class='mr-2'
            for='supervisor'>
            {{ t('work.supervisor') }}
          </label>
          <MultiSelect
            v-model='user'
            display='chip'
            filter
            :option-label="option => option.fullName + ' (' + option.email + ')'"
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #chip='{ value }'>
              <AppUser
                avatar-size='1.5'
                :info-visible='false'
                :user='value'/>
            </template>
          </MultiSelect>
        </div>
      </div>
    </div>
    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { get, map, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { changeParticipantGraphql, participantByTaskIdGraphql } from '@/apps/work/api/graphql/task-participant-api';
import { Participant } from '@/apps/work/model/task';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { User } from '@/common/model/User';

interface ConfigFormProps {
  visibleDialog: boolean,
  idTask: string,
  isDetail: boolean,
}

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetailCreate: false,
  idTask: ''
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();
const visible = ref(props.visibleDialog);
const headerDialog = t('common.editItem', { item: toLower(t('work.taskSupervisor.objectSupervisor')) });
const deadlineTaskFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveSupervisorTask()
  }
};
provide('dialogFooterButtons', deadlineTaskFormFooterButtons);

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();
const { onResult: participantByTaskIdResult } = participantByTaskIdGraphql('fa33dc4b-65fa-4858-ba12-6280a6f2850b');
const users = ref<User[]>([]);
let user = ref<User[]>([]);
getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});
participantByTaskIdResult(async (response) => {
  const participants: Participant[] = await get(response, 'data.participantByTaskId', []);
  const participantSupervisor = participants.filter(p => p.type === 'SUPERVISOR');
  if (!participantSupervisor || !users.value) {
    user.value = [];
  } else {
    participantSupervisor.forEach(p => {
      const userFind = users.value.find(u => u.id == p.participantId);
      if (userFind) {
        user.value.push(userFind);
      }
    });
  }
});

const {
  mutate: saveMutate,
  onDone: saveOnDone,
  onError: saveOnError
} = changeParticipantGraphql();

function saveSupervisorTask() {
  const participants = map(user.value, (user) => ({
    type: 'SUPERVISOR',
    participantId: user.id,
    percent: 0.4
  }));
  saveMutate({
    taskId: 'fa33dc4b-65fa-4858-ba12-6280a6f2850b',
    participants: participants
  });
}

saveOnDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('work.taskSupervisor.objectSupervisor'),
      itemName: ''
    })
  });
  emits('reload');
  emits('hide-dialog');
});

saveOnError((error) => {
  toastError(error);
});

</script>

<script lang='ts'>
export default { name: 'SupervisorDialog' };
</script>