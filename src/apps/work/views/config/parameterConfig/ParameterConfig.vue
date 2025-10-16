<template>
  <div
    class='flex h-full justify-content-center'>
    <div style=' width: 70%'>

      <div class='card'>
        <h4>{{ t('work.parameterConfig.header') }}</h4>
        <div class='flex'>
          <div class='col-10 field'>
            <label>{{ t('work.parameterConfig.allowCrossTaskView') }}</label>
          </div>
          <div class='col-2 field'>
            <div>
              <InputText
                v-model='allowCrossTaskView.id'
                hidden/>
              <InputSwitch
                v-model='allowCrossTaskView.paramValue'
                @change='saveConfig(allowCrossTaskView.id,"ALLOW_CROSS_TASK_IMPLEMENTER",allowCrossTaskView.paramValue)'/>
            </div>
          </div>
        </div>

        <div class='flex'>
          <div class='col-10 field'>
            <label>{{ t('work.parameterConfig.allowLinkingSubtasksToParent') }}</label>
          </div>
          <div class='col-2 field'>
            <div>
              <InputText
                v-model='allowLinkingSubtasksToParent.id'
                hidden/>
              <InputSwitch
                v-model='allowLinkingSubtasksToParent.paramValue'
                @change='saveConfig(allowLinkingSubtasksToParent.id,"ALLOW_CROSS_TASK_JOINER",allowLinkingSubtasksToParent.paramValue)'/>
            </div>
          </div>
        </div>

        <div class='flex'>
          <div class='col-10 field'>
            <label>{{ t('work.parameterConfig.allowCrossTaskViewers') }}</label>
          </div>
          <div class='col-2 field'>
            <div>
              <InputText
                v-model='allowCrossTaskViewers.id'
                hidden/>
              <InputSwitch
                v-model='allowCrossTaskViewers.paramValue'
                @change='saveConfig(allowCrossTaskViewers.id,"ALLOW_LINKING_SUB_TASKS_TO_PARENT",allowCrossTaskViewers.paramValue)'/>
            </div>
          </div>
        </div>

        <div class='flex'>
          <div class='col-10 field'>
            <label>{{ t('work.parameterConfig.allowParticipantsToViewLinkedSubtasks') }}</label>
          </div>
          <div class='col-2 field'>
            <div>
              <InputText
                v-model='allowParticipantsToViewLinkedSubtasks.id'
                hidden/>
              <InputSwitch
                v-model='allowParticipantsToViewLinkedSubtasks.paramValue'
                @change='saveConfig(allowParticipantsToViewLinkedSubtasks.id,"ALLOW_PARTICIPANTS_TO_VIEWS_LINKED_SUB_TASKS",allowParticipantsToViewLinkedSubtasks.paramValue)'/>
            </div>
          </div>
        </div>

        <div class='flex'>
          <div class='col-10 field'>
            <label>{{ t('work.parameterConfig.autoTransitionOnStartDate') }}</label>
          </div>
          <div class='col-2 field'>
            <div>
              <InputText
                v-model='autoTransitionOnStartDate.id'
                hidden/>
              <InputSwitch
                v-model='autoTransitionOnStartDate.paramValue'
                @change='saveConfig(autoTransitionOnStartDate.id,"AUTO_TRANSITION_ON_START_DATE",autoTransitionOnStartDate.paramValue)'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllByParamCodes, saveTaskCommonSetting } from '@/apps/work/api/graphql/task-common-setting-api';
import type { TaskCommonSetting } from '@/apps/work/model/parameterConfig';

const allowCrossTaskView = ref({} as TaskCommonSetting);
const allowLinkingSubtasksToParent = ref({} as TaskCommonSetting);
const allowCrossTaskViewers = ref({} as TaskCommonSetting);
const allowParticipantsToViewLinkedSubtasks = ref({} as TaskCommonSetting);
const autoTransitionOnStartDate = ref({} as TaskCommonSetting);
const { t } = useI18n();

enum typeConfig {
  ALLOW_CROSS_TASK_IMPLEMENTER = 'ALLOW_CROSS_TASK_IMPLEMENTER',
  ALLOW_CROSS_TASK_JOINER = 'ALLOW_CROSS_TASK_JOINER',
  ALLOW_LINKING_SUB_TASKS_TO_PARENT = 'ALLOW_LINKING_SUB_TASKS_TO_PARENT',
  ALLOW_PARTICIPANTS_TO_VIEWS_LINKED_SUB_TASKS = 'ALLOW_PARTICIPANTS_TO_VIEWS_LINKED_SUB_TASKS',
  AUTO_TRANSITION_ON_START_DATE = 'AUTO_TRANSITION_ON_START_DATE'
}

const listParamCode: string[] = [typeConfig.ALLOW_CROSS_TASK_IMPLEMENTER, typeConfig.ALLOW_CROSS_TASK_JOINER, typeConfig.ALLOW_LINKING_SUB_TASKS_TO_PARENT,
  typeConfig.ALLOW_PARTICIPANTS_TO_VIEWS_LINKED_SUB_TASKS, typeConfig.AUTO_TRANSITION_ON_START_DATE];
const {
  mutate: saveTaskConfigCommonMutate,
  onDone: saveTaskCommonOnDone
} = saveTaskCommonSetting();
const {
  onResult: findAllByParamCodeOnResult,
  refetch: findAllByParamCodeRefetch
} = findAllByParamCodes(listParamCode);

onMounted(() => {
  findAllByParamCodeOnResult((res) => {
    for (const b of res.data.findAllByParamCodes) {
      if (b.paramCode === typeConfig.ALLOW_CROSS_TASK_IMPLEMENTER) {
        allowCrossTaskView.value = {
          ...b,
          paramValue: JSON.parse(b.paramValue)
        };
      } else if (b.paramCode === typeConfig.ALLOW_CROSS_TASK_JOINER) {
        allowLinkingSubtasksToParent.value = {
          ...b,
          paramValue: JSON.parse(b.paramValue)
        };
      } else if (b.paramCode === typeConfig.ALLOW_LINKING_SUB_TASKS_TO_PARENT) {
        allowCrossTaskViewers.value = {
          ...b,
          paramValue: JSON.parse(b.paramValue)
        };
      } else if (b.paramCode === typeConfig.ALLOW_PARTICIPANTS_TO_VIEWS_LINKED_SUB_TASKS) {
        allowParticipantsToViewLinkedSubtasks.value = {
          ...b,
          paramValue: JSON.parse(b.paramValue)
        };
      } else if (b.paramCode === typeConfig.AUTO_TRANSITION_ON_START_DATE) {
        autoTransitionOnStartDate.value = {
          ...b,
          paramValue: JSON.parse(b.paramValue)
        };
      }
    }
  });
});

function saveConfig(id: string, typeConfig: string, value: boolean) {
  saveTaskConfigCommonMutate({
    taskCommonSettingInput: {
      id: id,
      groupCode: '',
      paramCode: typeConfig,
      paramValue: value,
      description: '',
      orderNo: 0,
      tenantId: '',
      isActive: true,
      isDelete: false
    }
  });
}

saveTaskCommonOnDone(() => {
  findAllByParamCodeRefetch();
});
</script>

<script lang='ts'>
export default { name: 'ParameterConfig' };
</script>