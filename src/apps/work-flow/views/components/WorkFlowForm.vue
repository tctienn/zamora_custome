<template>
  <form
    ref='flowForm'
    @submit.prevent='handleSubmitForm'>
    <div class='formgrid grid mb-4'>
      <div class='col'>
        <div class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('application.name') }}
          </label>
          <div>
            <Dropdown
              v-model='flow.app'
              class='p-component w-full'
              option-value='app'
              :options='appOptions'
              show-clear>
              <template #option='{option:option}'>
                {{ mapMenuCode?.[option?.app]?.name || '' }}
              </template>
              <template #value='{value}'>
                {{ mapMenuCode?.[value]?.name || '&nbsp;' }}
              </template>
            </Dropdown>
          </div>
        </div>

        <div class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('work-flow.flow.name') }}
          </label>
          <InputText
            v-model='flow.name'
            class='p-component p-inputtext w-full'
            name='name'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>
        <div
          v-if='flow.app'
          class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('work-flow.flow.type') }}
          </label>
          <Dropdown
            v-model='flow.type'
            class='p-component w-full'
            option-label='name'
            option-value='type'
            :options='typeOptions'
            show-clear>
          </Dropdown>
          <ValidateErrorMessage :errors='v$.type.$errors'/>
          <input
            v-model='flow.type'
            hidden
            name='type'>
        </div>
        <div class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('work-flow.flow.orgType') }}
          </label>
          <Dropdown
            v-model='flow.orgType'
            class='p-component w-full'
            option-label='label'
            option-value='value'
            :options='orgTypeOptions'>
          </Dropdown>
          <ValidateErrorMessage :errors='v$.orgType.$errors'/>
          <input
            v-model='flow.orgType'
            hidden
            name='orgType'>
        </div>
        <div
          v-if='flow.orgType'
          class='field'>
          <label
            v-required
            class='font-bold'>
            {{ t('work-flow.flow.org') }}
          </label>
          <OrganizationTree
            v-model='flow.orgIds'
            class='p-component w-full'
            :org-type='flow.orgType'
            :selection-mode="'multiple'">
          </OrganizationTree>
          <ValidateErrorMessage :errors='v$.orgIds.$errors'/>
          <input
            v-model='flow.orgType'
            hidden
            name='orgType'>
        </div>

        <div class='field'>
          <label
            class='font-bold'>{{ t('work-flow.flow.description') }}</label>
          <Textarea
            v-model='flow.description'
            auto-resize
            class='w-full'
            editor-style='height: 15rem;'
            maxlength='2000'
            name='description'
            rows='5'>
          </Textarea>
        </div>

        <div class='field'>
          <label class='font-bold'>{{ t('common.status') }}</label>
          <div class='align-items-center flex'>
            <InputSwitch
              v-model='flow.status' 
              :false-value='getStatusFalseValue()'
              :true-value='getStatusTrueValue()'
              @change='handleStatusChange'/>
            <span class='ml-2'>{{ getStatusLabel() }}</span>
          </div>
          <ValidateErrorMessage :errors='v$.status.$errors'/>
          <input
            v-model='flow.status'
            hidden
            name='status'>
        </div>
      </div>
    </div>
    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
      <Button
        class='border-round-sm p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        :loading='isSubmitting'
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        class='border-round-sm'
        icon='pi pi-save'
        :label="t('common.save')"
        :loading='isSubmitting'
        type='submit'/>
    </div>
  </form>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, maxLength, required } from '@vuelidate/validators';
import { cloneDeep, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import InputSwitch from 'primevue/inputswitch';
import { computed, onUnmounted, type PropType, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import { OrganizationType } from '@/apps/document/model/organization';
import { createFlow, getFlowEntity, updateFlow } from '@/apps/work-flow/api/graphql/flow-api';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import ValidateErrorMessage from '@/common/components/custom/ValidateErrorMessage.vue';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { associateBy, distinctByFields } from '@/common/helpers/extension/array.extension';
import { useMenuStore } from '@/common/store/menu';

import { defaultFlow, type FlowInterface } from '../../model/flow';

const props = defineProps(
  {
    flowId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    flowTypeData: {
      type: Array as PropType<FlowType[]>,
      default: () => []
    }
  },
);
const emits = defineEmits(['hide-dialog', 'createdSuccess']);
const flow = ref<FlowInterface>({} as FlowInterface);
if (props.flowId) {
  getFlowEntity(props.flowId).onResult(param => {
    flow.value = cloneDeep(param.data.getFlowEntity);
    if (!flow.value.status) {
      flow.value.status = 'INACTIVE';
    }
  });
} else {
  flow.value = cloneDeep(defaultFlow);
  if (!flow.value.status) {
    flow.value.status = 'INACTIVE';
  }
}

const flowForm = ref<HTMLFormElement>();
const { t } = useI18n();
const appOptions = computed(() => (distinctByFields(props.flowTypeData as unknown as Record<string, never>[], ['app']) as unknown as FlowType[]));
const typeOptions = computed<FlowType[]>(() => {
  return props.flowTypeData.filter(e => e.app === flow.value.app);
});
const {
  mutate: createFlowMutation,
  loading: isSubmitting
} = createFlow();
const {
  mutate: updateFlowMutation,
  loading: isUpdating
} = updateFlow();

const validateRules = {
  name: {
    required: helpers.withMessage(t('work-flow.flow.error.flowNameEmpty'), required),
    maxLength: helpers.withMessage(t('work-flow.flow.error.flowNameTooLong', { number: 100 }), maxLength(100))
  },
  app: { required: helpers.withMessage(t('work-flow.flow.error.flowTypeEmpty'), required) },
  type: { required: helpers.withMessage(t('work-flow.flow.error.flowTypeEmpty'), required) },
  orgType: { required: helpers.withMessage(t('work-flow.flow.error.orgTypeEmpty'), required) },
  orgIds: { required: helpers.withMessage(t('work-flow.flow.error.orgIdsEmpty'), required) },
  status: { required: helpers.withMessage(t('work-flow.flow.error.statusEmpty'), required) }
};

const v$ = useVuelidate(validateRules, flow.value);

function handleSubmitForm() {
  const handleSuccess = (message: string, flowId: string) => {
    toastSuccess({ message });
    emits('hide-dialog');
    if (!props.flowId) {
      emits('createdSuccess', flowId);
    }
    flow.value = cloneDeep(defaultFlow);
    v$.value.$reset();
  };

  const handleError = (error: any) => {
    toastErrorData({ error });
  };
  const handleValidation = (isValid: boolean) => {
    if (isValid && flowForm.value) {
      // isSubmitting.value = true;
      const action = props.flowId ? updateFlowMutation({
        id: props.flowId,
        flowEntityInput: omit(flow.value, ['id'])
      }) : createFlowMutation({ flowEntityInput: omit(flow.value, ['id']) });

      action
        .then((res) => {
          const successMessage = props.flowId
            ? t('common.result.message.updateSuccess')
            : t('common.result.message.createSuccess');
          handleSuccess(successMessage, res?.data?.createFlow?.id);
        })
        .catch(handleError);
    }
  };

  v$.value.$validate().then(handleValidation);
}

const orgTypeOptions = [
  {
    label: t('work-flow.flow.orgTypeTree.administrative'),
    value: OrganizationType.ADMINISTRATIVE
  }, {
    label: t('work-flow.flow.orgTypeTree.party'),
    value: OrganizationType.PARTY
  }, {
    label: t('work-flow.flow.orgTypeTree.union'),
    value: OrganizationType.UNION
  }
];
const { configuredApps } = storeToRefs(useMenuStore());
const mapMenuCode = computed(() =>
  configuredApps.value ? associateBy(configuredApps.value, item => item.code) : {}
);

// Status handling functions
function getStatusTrueValue() {
  // Check if flow.status is already a boolean
  if (typeof flow.value.status === 'boolean') {
    return true;
  }
  // For string values, return 'ACTIVE'
  return 'ACTIVE';
}

function getStatusFalseValue() {
  // Check if flow.status is already a boolean
  if (typeof flow.value.status === 'boolean') {
    return false;
  }
  // For string values, return 'INACTIVE'
  return 'INACTIVE';
}

function getStatusLabel() {
  // Handle boolean values
  if (typeof flow.value.status === 'boolean') {
    return flow.value.status ? t('common.statuses.active') : t('common.statuses.deactivate');
  }
  // Handle string values (default case)
  return flow.value.status === 'ACTIVE' ? t('common.statuses.active') : t('common.statuses.deactivate');
}

function handleStatusChange() {
  // Ensure flow.status is always a string ('ACTIVE' or 'INACTIVE')
  if (typeof flow.value.status === 'boolean') {
    flow.value.status = flow.value.status ? 'ACTIVE' : 'INACTIVE';
  }
}

onUnmounted(() => {
  v$.value.$reset();
});
</script>

<style scoped>

</style>