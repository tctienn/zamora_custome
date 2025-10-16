<template>
  <component
    :is="(isSidebar && !isDetail) ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="isDetail ? t(`work.task.taskGroup`) : t(`meeting.common.${id ? 'update' : 'create'}`) + ' ' + t(`work.task.taskGroup`)"
    :position="(isSidebar && !isDetail) ? 'right' : undefined"
    @hide="emits('hide-dialog')">

    <div>
      <form
        ref='form'
        @submit.prevent='submitForm'>
        <div class='formgrid grid mb-4'>
          <div class='col'>
            <div class='field'>
              <label
                v-required
                class='font-bold'>{{ t('common.name') }} {{ t(`work.task.taskGroup`) }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='formValue.name'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='name'/>
                <ValidateErrorMessage :errors='v$.name.$errors'/>
              </div>
              <div v-else>
                {{ formValue.name }}
              </div>
            </div>
            <input
              v-model='formValue.id'
              hidden=''/>

            <div class='align-items-center flex justify-content-between'>
              <div class='field'>
                <label
                  class='font-bold'>{{ t('meeting.meetingRoom.status') }}</label>
                <div>
                  <NamedDropdown
                    v-if='!isDetail'
                    v-model='formValue.status'
                    class='w-20rem'
                    :is-show-clear='false'
                    name='status'
                    option-label='label'
                    option-value='value'
                    :options='statuses'
                    @change='chooseStatuses($event)'/>
                  <div v-else>
                    {{
                      t(`common.statuses.${formValue.status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`)
                    }}
                  </div>
                </div>
              </div>

              <div
                v-if='!isDetail'
                class='field'>
                <label
                  class='font-bold'>{{ t(`meeting.meetingRoom.norder`) }}</label>
                <div>
                  <InputNumber
                    v-model='formValue.norder'
                    input-id='integeronly'/>
                  <ValidateErrorMessage :errors='v$.norder.$errors'/>
                  <input
                    v-model='formValue.norder'
                    hidden
                    name='norder'>
                </div>
              </div>
            </div>

            <div
              class='bottom-0 fixed flex gap-2 justify-content-center p-2 pb-3 surface-overlay'
              style='width: 95%'>
              <Button
                class='p-button-plain'
                icon='pi pi-times'
                :label="t('common.close')"
                severity='danger'
                @click="emits('hide-dialog')"/>
              <Button
                v-if='!isDetail'
                :disabled='isDisable'
                icon='pi pi-save'
                :label="t('common.save')"
                type='submit'/>
            </div>
          </div>
        </div>
      </form>
    </div>
  </component>
</template>

<script setup lang="ts">

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskGroupById, maxNOrderTaskGroup, mutationTaskGroup } from '@/apps/work/api/graphql/task-group';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import { ACTIVITY_STATUSES, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps(
  {
    isDetail: {
      type: Boolean,
      default: false
    },
    isSidebar: {
      type: Boolean,
      default: true
    },
    visibleDialog: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: null
    },
  }
);

const emits = defineEmits(['hide-dialog']);
const { mutate, onDone } = mutationTaskGroup();

interface IFormValue {
  id: string;
  name: string;
  norder: number;
  status: string;
}

const { t } = useI18n();
const isDisable = ref(false);
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const formValue = ref<IFormValue>({} as IFormValue);

const validateRules = {
  name: {
    required: helpers.withMessage(t('common.name') + ' '
        + t('work.task.taskGroup') + ' '
        + t('work.project.required')
    , required)
  },
  norder: { required: helpers.withMessage(t('work.project.norderRequired') + ' ', required) }
};

const v$ = useVuelidate(validateRules, formValue);

if (!props.id) {
  formValue.value.status = ACTIVITY_STATUSES.ACTIVE;
  const { onResult } = maxNOrderTaskGroup();
  onResult((res) => {
    formValue.value.norder = res.data.maxOrderActiveTaskGroup;
  });
}

if (props.id) {
  const { onResult } = getTaskGroupById(props.id);
  onResult((res) => {
    formValue.value = { ...res.data.getTaskGroupById };
  });
}

const submitForm = () => {
  isDisable.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid && form.value) {
      mutate({
        payload:
            { ...formValue.value }
      }).then(() => {
        toastSuccess({ message: t('done') });
        emits('hide-dialog');
      });
    }
  }).then(() => isDisable.value = false);
};

const statuses = ref([
  {
    value: ACTIVITY_STATUSES.ACTIVE,
    label: t('common.statuses.active'),
  },
  {
    value: ACTIVITY_STATUSES.DEACTIVATE,
    label: t('common.statuses.deactivate'),
  }
]);

// eslint-disable-next-line @typescript-eslint/no-empty-function
function chooseStatuses(data: DropdownChangeEvent) {

}
</script>

<style scoped>

</style>