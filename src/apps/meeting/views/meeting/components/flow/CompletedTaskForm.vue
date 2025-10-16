<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='outcome?.label'
    :style="user ? {} : { width: '20vw'}"
    @hide="emits('hide-dialog')">
    <div>
      <form ref='form'>
        <div
          class='formgrid grid mb-4'>
          <div
            v-if='user && outcome?.name === "APPROVE"'
            class='col-12 field'>
            <label
              class='font-bold'>Chuyển đến: </label>
            <div>
              <AppUser
                avatar-size='2.5'
                class='p-2'
                info-visible
                :infos="['positionName', 'departments']"
                name-visible
                :user-id='user'></AppUser>
            </div>
          </div>
          <div class='col-12 field'>
            <label
              class='font-bold'>Nội dung: </label>
            <Textarea
              v-model='comment'
              class='w-full'
              cols='30'
              name='note'
              rows='3'/>
          </div>
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
            icon='pi pi-send'
            :label="t('common.perform')"
            :loading='isLoading'
            @click='submit'/>
        </div>
      </form>
    </div>
  </Dialog>

</template>

<script lang='ts' setup>

import { get } from 'lodash';
import type { ButtonProps } from 'primevue/button';
import { inject, onMounted, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { nextNodesIgnoreStatus } from '@/apps/work-flow/api/graphql/task';
import { createNextTasks } from '@/apps/work-flow/api/graphql/work';
import type { Outcome } from '@/apps/work-flow/model/flow';
import { handleCompleteTask } from '@/apps/work-flow/views/process/task-menu';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  taskId: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  outcome: {
    type: Object as PropType<Outcome | undefined>,
    default: undefined
  },
  workId: {
    type: String,
    default: ''
  },
  currentNodeId: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    default: ''
  },
});
const emits = defineEmits(['hide-dialog']);
const isLoading = ref(false);
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const user = ref();
const { t } = useI18n();
const nodes = ref();
const {
  load,
  refetch
} = nextNodesIgnoreStatus(props.workId, props.currentNodeId, props.outcome?.name);

const roles = ref();
const { onResult: currentUserResult } =
  currentUser();
currentUserResult((res) => {
  roles.value = get(res, 'data.currentUser.roles', []);
});
const injectedRefreshMeeting = inject('refreshMeeting', ref(false));

onMounted(() => {
  (load() || refetch())
    ?.then(result => {
      if (result) {
        nodes.value = result?.nextNodesIgnoreStatus || [];
        user.value = nodes.value[0].data?.options?.userIds[0];
      }
    });
});

const comment = ref('');
const dialogFooterButtons: { closeButton: ButtonProps, actionButton: ButtonProps } = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    onClick: () => visible.value = false
  },
  actionButton: {
    icon: 'check',
    label: t('common.confirm'),
    onClick: submit
  }
};

provide('dialogFooterButtons', dialogFooterButtons);

function submit() {
  isLoading.value = true;
  if (props.taskId && props.outcome?.name) {
    handleCompleteTask(props.taskId, props.outcome.name, comment.value)
      .then(() => {
        const firstNode = nodes.value[0];
        const assignedIds = props.outcome?.name === 'APPROVE' ? [user.value] : [props.createdBy];

        if (firstNode?.data?.options) {
          return createNextTasks().mutate({
            workId: props.workId,
            currentTaskId: props.taskId,
            assignedIds: assignedIds,
            currentNodeId: props.currentNodeId,
            nextNodeId: firstNode.id
          }) as Promise<any>;
        }

        return Promise.resolve();
      })
      .then(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        injectedRefreshMeeting.value = true;
        visible.value = false;
        emits('hide-dialog');
        isLoading.value = false;
      });
  }
}
</script>

<style scoped>

</style>