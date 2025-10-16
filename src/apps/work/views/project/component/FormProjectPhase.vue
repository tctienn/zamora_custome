<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    :header="t('work.phase.addPhase')"
    position='right'
    style='width: 40%;height: 100%'>
    <div class='flex flex-column gap-2'>
      <label v-required>{{ t('work.phase.name') }}</label>
      <input
        v-model='phase.id'
        hidden/>

      <input
        v-model='phase.createdTime'
        hidden/>
      <input
        v-model='phase.createdBy'
        hidden/>
      <InputText
        v-model='phase.name'
        class='overflow-auto w-full'/>
      <div v-if='validatePhaseName'>
        <p style='font-size: 10px; color: red'>{{ t('work.phase.validate.nameRequired') }}</p>
      </div>
      <div class='flex gap-2 justify-content-between'>
        <div class='flex flex-column gap-2 w-full'>
          <label v-required>{{ t('work.phase.startDate') }}</label>

          <NamedInputCalendar
            v-model='phase.fromDate'
            format='DD/MM/YYYY'
            input-format='DD/MM/YYYY'
            name='startDate'
            :select-other-months='true'
            show-icon/>

          <div v-if='validateFromDate'>
            <p style='font-size: 10px; color: red'>{{ t('work.phase.validate.startDateRequired') }}</p>
          </div>
        </div>

        <div class='flex flex-column gap-2 w-full'>
          <label v-required>{{ t('work.phase.endDate') }}</label>
          <NamedInputCalendar
            v-model='phase.toDate'
            format='DD/MM/YYYY'
            input-format='YYYY-MM-DD'
            name='startDate'
            :select-other-months='true'
            show-icon/>

          <div v-if='validateToDate'>
            <p style='font-size: 10px; color: red'>{{ t('work.phase.validate.endDateRequired') }}</p>
          </div>
        </div>
      </div>

      <label>{{ t('work.phase.description') }}</label>
      <AppEditor
        v-model='phase.description'
        class='w-full'
        editor-style='height: 15rem;'/>
    </div>

    <div
      class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click='visible = false'/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        type='submit'
        @click='save'/>
    </div>
  </Sidebar>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findPhaseById, savePhase } from '@/apps/work/api/graphql/phase';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  },
  phaseId: {
    type: String,
    default: undefined
  }
});
const visible = defineModel<boolean>('visible', { default: false });
const { t } = useI18n();
const phase = ref({} as any);
const { moment } = useMoment();
const validatePhaseName = ref(false);
const validateFromDate = ref(false);
const validateToDate = ref(false);
const isSubmit = ref(false);
const {
  onDone: saveDone,
  onError: saveError,
  mutate: saveMutate
} = savePhase();

function save() {
  isSubmit.value = true;
  if (validateFrom()) {
    saveMutate({
      phaseInput: {
        id: phase.value.id,
        projectId: props.projectId,
        name: phase.value.name,
        fromDate: moment(phase.value.fromDate).format('YYYY-MM-DD'),
        toDate: moment(phase.value.toDate).format('YYYY-MM-DD'),
        description: phase.value.description,
        createdBy: phase.value.createdBy,
        createdTime: phase.value.createdTime
      }
    });
  }
  isSubmit.value = false;
}

saveDone(() => {
  toastSuccess({ message: t('work.phase.saveSuccess') });
  visible.value = false;
  phase.value = {};
  EventBus.emit('refetchPhases');
});

saveError((err) => {
  toastError({ message: t('work.phase.validate.' + err.graphQLErrors[0].extensions.errorCode) });
});

function validateFrom() {
  if (!phase.value.name) {
    validatePhaseName.value = true;
  } else {
    validatePhaseName.value = false;
  }

  if (!phase.value.fromDate) {
    validateFromDate.value = true;
  } else {
    validateFromDate.value = false;
  }

  if (!phase.value.toDate) {
    validateToDate.value = true;
  } else {
    validateToDate.value = false;
  }

  if (!validatePhaseName.value && !validateFromDate.value && !validateToDate.value) {
    return true;
  }
  return false;
}

watch(() => props.phaseId, (value) => {
  if (value) {
    findPhaseById(value).onResult((res) => {
      phase.value = cloneDeep(res.data.findPhaseById);
      phase.value = {
        ...phase.value,
        fromDate: new Date(phase.value.fromDate),
        toDate: new Date(phase.value.toDate)
      };
    });
  }
});
</script>

<style scoped>

</style>

<script lang='ts'>
export default { name: 'FormProjectPhase' };
</script>