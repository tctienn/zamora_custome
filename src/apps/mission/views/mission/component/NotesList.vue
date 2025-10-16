
<template>
  <DataTable
    class='h-full pt-2 surface-overlay'
    :loading='loading'
    :row-hover='true'
    scroll-height='calc(100vh - 14rem)'
    scrollable
    show-gridlines
    table-style='min-width: 50rem'
    :value='props.noteData'>
    <ColumnGroup type='header'>
      <Row>
        <Column
          class='px-0'
          :header='t("mission.note.No")'
          :rowspan='2'
          style='width: 4rem;'/>
        <Column
          class='text-left'
          :colspan='1'
          field='handlerName'
          :header='t("mission.note.fullName")'
          header-class='float-left'
          :rowspan='2'
          :sortable='true'
          style='width: 10%;' />
        <Column
          class='text-left'
          :colspan='1'
          field='handlerOrganizationName'
          :header='t("mission.note.hostUnit")'
          header-class='float-left'
          :rowspan='2'
          :sortable='true'
          style='width: 10%;' />
        <Column
          :colspan='1'
          field='grade'
          :header='t("mission.note.rating")'
          :rowspan='2'
          :sortable='true'
          style='width: 6%;' />
        <Column
          :colspan='1'
          :header='t("mission.note.classificationFlag")'
          :rowspan='2'
          style='width: 10%;' />
        <Column
   
          :colspan='7'
          :header='t("mission.note.jobOnMissionCount.title")'
          :rowspan='1' />
        <Column
   
          :colspan='7'
          :header='t("mission.note.jobOtherCount.title")'
          :rowspan='1' />
      </Row>
      <Row>
        <Column
          :header='t("mission.note.jobOnMissionCount.totalJobByMission")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionCompletedAheadOfSchedule")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionCompletedOnTime")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionCompletedLateOnTime")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionInProgress")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionUnprocessed")'/>
        <Column
   
          :header='t("mission.note.jobOnMissionCount.totalJobOnMissionNew")'/>
    
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOnOther")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherCompletedAheadOfSchedule")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherCompletedOnTime")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherCompletedLateOnTime")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherInProgress")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherUnprocessed")'/>
        <Column
   
          :header='t("mission.note.jobOtherCount.totalJobOtherNew")'/>
      </Row>
    </ColumnGroup>

    <Column>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      class='text-left'
      field='handlerName'/>
    <Column
      class='text-left'
      field='handlerOrganizationName'/>
    <Column
      field='grade'>
      <template #body='{ data }'>
        <span
          :style="{
            color: getGradeColor(data.grade),
            fontWeight: 'bold'
          }">
          {{ data.grade }}
        </span>
      </template>
    </Column>
    <Column
      class='px-0 py-3'
      field='classificationFlag'>
      <template #body='{ data: { flagSummary } }'>
        <div class='align-items-center flex gap-2 justify-content-around pr-2'>
          <AppIcon
            v-badge.success='flagSummary.totalGreenFlag'
            fill
            name='flag'
            size='1.8'
            style='font-size: 1.2rem;background-color: #F1F5F9; border-radius: 5px; color: #22C55E; padding: 3px;'/>
          <AppIcon
            v-badge.warning='flagSummary.totalYellowFlag'
            fill
            name='flag'
            size='1.8'
            style='font-size: 1.2rem;background-color: #F1F5F9; border-radius: 5px; color: #F59E0B;; padding: 3px;'/>
          <AppIcon
            v-badge.danger='flagSummary.totalRedFlag'
            fill
            name='flag'
            size='1.8'
            style='font-size: 1.2rem;background-color: #F1F5F9; border-radius: 5px; color: #EF4444; padding: 3px;'/>
        </div>
      </template>
    </Column>
    <Column
      field='jobOnMissionCount.totalJobByMission'/>
    <Column
      field='jobOnMissionCount.totalJobOnMissionCompletedAheadOfSchedule'/>
    <Column
      field='jobOnMissionCount.totalJobOnMissionCompletedOnTime'/>

    <Column
      field='jobOnMissionCount.totalJobOnMissionCompletedLateOnTime'/>
    <Column
      field='jobOnMissionCount.totalJobOnMissionInProgress'/>
    <Column
      field='jobOnMissionCount.totalJobOnMissionUnprocessed'/>
    <Column
      field='jobOnMissionCount.totalJobOnMissionNew'/>
    <Column
      field='jobOtherCount.totalJobOnOther'/>
    <Column
      field='jobOtherCount.totalJobOtherCompletedAheadOfSchedule'/>
    <Column
      field='jobOtherCount.totalJobOtherCompletedOnTime'/>
    <Column
      field='jobOtherCount.totalJobOtherCompletedLateOnTime'/>
    <Column
      field='jobOtherCount.totalJobOtherInProgress'/>
    <Column
      field='jobOtherCount.totalJobOtherUnprocessed'/>
    <Column
      field='jobOtherCount.totalJobOtherNew'/>
    <template #empty>
      <div class='text-center text-color-secondary text-sm'>
        <span>Không có dữ liệu</span>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { NoteInterface } from '@/apps/mission/model/mission/mission';

const props = defineProps({
  noteData: {
    type: Array as PropType<NoteInterface[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

function getGradeColor(grade: string) {
  switch (grade?.toUpperCase()) {
  case 'B':
    return '#22C55E'; 
  case 'C':
    return '#3B82F6';
  case 'D':
    return '#f97316';  
  default:
    return '#000000'; 
  }
}
</script>

<style scoped>
:deep(th){
  text-align: center;
  padding-inline: 0.8rem;
}
:deep(td){
  text-align: center;
  padding-inline: 0.8rem;
}
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

:deep(.p-badge){
  min-width: 1.3rem;
  height: 1.3rem;
  line-height: 1.3rem;
  font-size: 0.85rem;
}
</style>