<template>
  <div class='formgrid grid m-0 w-full'>
    <div class='field w-full'>
      <label for='type'>{{ t('work-flow.process.type') }}</label>
      <Dropdown
        v-model='input.type'
        class='w-full'
        disabled
        input-id='type'
        option-label='name'
        option-value='type'
        :options='types'/>
    </div>
    <div
      v-if='input.type'
      class='field w-full'>
      <label for='flow'>{{ t('work-flow.process.flow') }}</label>
      <Dropdown
        v-model='input.flowId'
        class='w-full'
        input-id='flow'
        option-label='name'
        option-value='id'
        :options='flows'/>
    </div>

    <div
      v-if='input.flowId'
      class='field w-full'>
      <label
        v-required
        for='name'>{{ t('work-flow.process.name') }}</label>
      <InputText
        id='name'
        v-model='input.name'
        class='w-full'/>
    </div>

    <div
      v-if='input.flowId'
      class='field w-full'>
      <label for='object'>{{ t('work-flow.process.object') }}</label>
      <Dropdown
        v-model='input.objectId'
        class='w-full'
        disabled
        input-id='object'
        :option-label='objectOptionLabel'
        option-value='id'
        :options='objects'/>
    </div>

    <div
      v-if='input.flowId'
      class='field w-full'>
      <label for='priority'>{{ t('work-flow.process.priorityName') }}</label>
      <Dropdown
        class='w-full'
        input-id='priority'
        :model-value='getPriorityDisplay(input.priority)'
        :options='priorites()'
        @update:model-value='input.priority=$event.value'>
        <template #option='{option}'>
          <div class='align-items-center flex gap-2'>
            <AppIcon
              :class='option["iconClass"]'
              :name='option["icon"]'/>
            <span>{{ option['label'] }}</span>
          </div>
        </template>

        <template #value='{value, placeholder}'>
          <div
            v-if='value'
            class='align-items-center flex gap-2'>
            <AppIcon
              :class='value["iconClass"]'
              :name='value["icon"]'/>
            <span>{{ value['label'] }}</span>
          </div>
          <span v-else>{{ placeholder }}</span>
        </template>
      </Dropdown>
    </div>

    <div
      v-if='input.flowId'
      class='field w-full'>
      <label for='description'>{{ t('work-flow.process.description') }}</label>
      <Textarea
        id='description'
        v-model='input.description'
        class='w-full'
        rows='3'/>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation, type ValidationArgs } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { computed, type ComputedRef, inject, onMounted, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { flowsByType } from '@/apps/work-flow/api/graphql/flow-api';
import { flowTypes, listObjectInfos } from '@/apps/work-flow/api/rest/flow-register';
import type { FlowType, ObjectInfo } from '@/apps/work-flow/model/process/flow-type';
import { Priority, type WorkInput } from '@/apps/work-flow/model/process/work';
import { getPriorityDisplay, priorites } from '@/apps/work-flow/views/process/priority';
import AppIcon from '@/common/components/app/AppIcon.vue';

const dialogRef = inject<ComputedRef>('dialogRef');

const { t } = useI18n();
const types = ref<FlowType[]>([]);
const input = defineModel('input', {
  type: Object as PropType<WorkInput>,
  default: { priority: Priority.MEDIUM }
});
const rules: ValidationArgs = {
  name: { required: helpers.withMessage(t('work-flow.process.validation.name.required'), required) },
  type: { required: helpers.withMessage(t('work-flow.process.validation.type.required'), required) },
  flowId: { required: helpers.withMessage(t('work-flow.process.validation.flow.required'), required) },
  objectId: { required: helpers.withMessage(t('work-flow.process.validation.object.required'), required) }
};
const v$ = useVuelidate(rules, input);
const registerValidation = inject('registerValidation', (key: string, v: Ref<Validation>) => void {});

const {
  result,
  load: loadFlows,
  refetch,
  variables
} = flowsByType();

const flows = computed(() => result.value?.flowsByType || []);
const objects = ref<ObjectInfo[]>([]);

watch(() => input.value.type, (value) => {
  if (!value) {
    objects.value = [];
  } else {
    variables.value = { type: value };
    loadFlows() || refetch();

    listObjectInfos(value).then((data) => {
      objects.value = data || [];
    });
  }
});

const objectOptionLabel = computed(() => {
  const type = types.value.find((v) => v.type === input.value.type);
  return type?.endpoint?.fieldToDisplay ?? 'name';
});

function fillFlowData() {
  const flowType = dialogRef?.value.data['flowType'];
  const objectId = dialogRef?.value.data['objectId'];
  if (flowType) {
    input.value.type = flowType;
  }
  if (objectId) {
    input.value.objectId = objectId;
  }
}

onMounted(() => {
  flowTypes().then((data) => {
    types.value = data || [];
  });

  fillFlowData();
  registerValidation?.('WorkFlowGeneralDialog', v$);
});
</script>

<style scoped>

</style>