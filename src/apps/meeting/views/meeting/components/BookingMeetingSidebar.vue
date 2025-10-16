<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header='t("meeting.meeting.bookingMeeting")'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            class='border-round-sm px-0'
            icon='pi pi-arrow-left'
            severity='danger'
            style='width: 30px; height: 30px;'
            @click="emits('hide-dialog')"/>
          {{ t('meeting.meeting.bookingMeeting') }}
        </div>
      </div>
    </template>
    <MeetingForm @hide-dialog="emits('hide-dialog')"/>
  </Sidebar>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MeetingForm from '@/apps/meeting/views/meeting/components/MeetingForm.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleForm: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n() || {};
const visibleForm = ref(props.visibleForm);

</script>

<style scoped>

</style>