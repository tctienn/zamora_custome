<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='t("meeting.meeting.conflictMeetings")'
    @hide="emits('hide-dialog')">

    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      class='mb-5'
      :value='meetings'>
      <Column
        class='text-center'
        header='#'>
        <template #body='slotProps'>
          <div class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        field='content'
        :header='t(`meeting.meeting.content`)'
        style='width: 50%'>
      </Column>
      <Column
        :header='t(`meeting.meeting.conflictContent`)'>
      </Column>
      <Column
        :header='t(`meeting.meeting.conflictScope`)'>
      </Column>
    </DataTable>
    <div
      class='bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
      style='width: 96%'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        class='p-button-plain'
        icon='pi pi-save'
        :label="t('common.continueSaving')"
        @click="emits('continue-saving')"/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getConflictMeetingsById } from '@/apps/meeting/graphql/meeting';
import type { MeetingInterface } from '@/apps/meeting/model/meeting';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  id: {
    type: String,
    default: null
  },
  visibleDialog: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array as PropType<any>,
    default: () => []
  }
});
const emits = defineEmits(['hide-dialog', 'continue-saving']);
const { t } = useI18n();
const visibleForm = ref(props.visibleDialog);
const meetings = ref<MeetingInterface[]>([]);

if (props.id) {
  const { onResult: getConflictMeetingsResult } = getConflictMeetingsById(props.id);

  getConflictMeetingsResult((res) => {
    const { conflictMeetings } = get(res, 'data.getMeetingById', { conflictMeetings: [] });
    meetings.value = conflictMeetings;
  });
} else {
  meetings.value = props.data;
}

</script>

<style scoped>

</style>