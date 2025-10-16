<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('meeting.meeting.confirmCancelMeeting')"
    style='width: 40rem'
    @hide="emits('hide-dialog')">
    <div>
      <form>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label
              class='font-bold'>Lý do</label>
            <Textarea
              v-model='reason'
              class='w-full'
              cols='30'
              rows='5'/>
          </div>
        </div>

        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            type='button'
            @click="emits('hide-dialog')"/>
          <Button
            icon='pi pi-save'
            :label="t('common.save')"
            @click='submitForm'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { updateAttendeeByUserId } from '@/apps/meeting/graphql/meeting-attendee';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog', 'submit-done']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
watch(() => props.visibleDialog, (newVal) => {
  visibleForm.value = newVal;
});
const reason = ref('');

const {
  mutate,
  onDone
} = updateAttendeeByUserId();

const submitForm = () => {
  mutate({
    meetingId: props.id,
    participate: false,
    reason: reason.value
  });
};

onDone(() => {
  toastSuccess({ message: 'Hủy thành công cuộc họp.' });
  emits('hide-dialog');
  emits('submit-done');
});
</script>

<style scoped>

</style>