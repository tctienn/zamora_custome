<template>
  <Sidebar
    v-model:visible='visibleDetail'
    :header='header'
    v-bind='DEFAULT_DIALOG_CONFIG'
    position='right'
    @hide='emits("hide-dialog")'>
    <TabView
      :pt='{
        navcontainer: { class: "fixed w-full z-5" },
        nav: { class: "surface-card" },
      }'>
      <TabPanel
        :header='t("meeting.meeting.generalInfo")'
        style='position: sticky'>
        <GeneralMeetingDetail
          :id='id'
          @submit-done='closeSidebar'/>
      </TabPanel>
      <TabPanel
        :header='t("meeting.meeting.meetingResult")'
        style='position: sticky'>
        <MeetingResultDetail
          :id='id'
          class='pt-6'/>
      </TabPanel>
    </TabView>
  </Sidebar>
</template>

<script setup lang='ts'>
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import GeneralMeetingDetail from '@/apps/meeting/views/meeting/components/GeneralMeetingDetail.vue';
import MeetingResultDetail from '@/apps/meeting/views/meeting/components/MeetingResultDetail.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDetail: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n() || {};
const visibleDetail = ref(props.visibleDetail);
const injectedRefreshMeeting = inject('refreshMeeting', ref(false));

const closeSidebar = () => {
  emits('hide-dialog');
  injectedRefreshMeeting.value = true;
};

</script>

<script lang='ts'>
export default { name: 'MeetingDetail' };
</script>

<style scoped>
</style>