<template>
  <div class='grid-widget m-0'>
    <div class='flex flex-column'>
      <div
        v-if="hasPermission('/MEDIA')"
        class='border-round overflow-hidden'
        style='margin-bottom: 15px'>
        <MediaNewsWidget/>
      </div>
      <MediaAnnouncementWidget
        v-if="hasPermission('/MEDIA')"
        style='margin-bottom: 15px'/>
      <MediaBirthdayWidget v-if="hasPermission('/MEDIA')"/>
      <MediaHonorWidget v-if="hasPermission('/MEDIA')"/>
    </div>

    <div class='flex flex-column'>
      <div
        v-if="hasPermission('/HRM')"
        class='border-round overflow-hidden'
        style='margin-bottom: 15px'>
        <HrmCheckInWidget/>
      </div>
      <MeetingScheduleWidget
        v-if="hasPermission('/MEETING')"
        style='margin-bottom: 15px'/>
      <IntroNewStaffWidget v-if="hasPermission('/HRM')"/>
      <!--      <DocumentSharedWidget v-if="hasPermission('/DOCUMENT')"/>-->
    </div>

    <div class='flex flex-column'>
      <div
        v-if="hasPermission('/WORK')"
        class='border-round overflow-hidden'
        style='margin-bottom: 15px'>
        <ProjectJoinWidget/>
      </div>
      <TaskJoinWidget v-if="hasPermission('/WORK')"/>
      <DocumentWidget v-if="hasPermission('/DOCUMENT')"/>
    </div>

  </div>
</template>

<script lang='ts' setup>

import { hasPermission } from '@/apps/admin/services/permission';
import {
  MediaAnnouncementWidget,
  MediaBirthdayWidget,
  MediaHonorWidget,
  MediaNewsWidget
} from '@/apps/media/views/widgets';
import DocumentSharedWidget from '@/apps/media/views/widgets/DocumentSharedWidget.vue';
import DocumentWidget from '@/apps/media/views/widgets/DocumentWidget.vue';
import HrmCheckInWidget from '@/apps/media/views/widgets/HrmCheckInWidget.vue';
import IntroNewStaffWidget from '@/apps/media/views/widgets/IntroNewStaffWidget.vue';
import MeetingScheduleWidget from '@/apps/media/views/widgets/MeetingScheduleWidget.vue';
import ProjectJoinWidget from '@/apps/media/views/widgets/ProjectJoinWidget.vue';
import TaskJoinWidget from '@/apps/media/views/widgets/TaskJoinWidget.vue';
</script>

<style scoped>
.grid-widget {
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 1rem;
}
</style>