<template>
  <div
    class='border-1 border-primary-100 border-round-xl cursor-pointer flex flex-column kanban-item p-2 row-gap-2 transition-duration-200'
    :draggable='true'>
    <div class='align-items-center flex flex-row justify-content-between'>
      <span
        class='font-bold'
        @click='showTaskDetail(task)'>{{ task.name }}</span>
      <ButtonIcon
        class='align-self-start flex-shrink-0 p-1'
        icon='more_vert'
        rounded
        text/>
    </div>
    <div v-if='selectedTask'>
      <span
        v-for='(label, index) in task.labels'
        :key='index'
        v-tooltip.top='t(label.labelTitle)'
        class='label-kanban-color'
        :style='{
          backgroundColor: label.labelColor
        }'
        @click='showChip()'></span>
    </div>
    <div v-if='!selectedTask'>
      <Chip
        v-for='(label, index) in task.labels'
        :key='index'
        class='mr-2 mt-1'
        :label='label.labelTitle'
        :outlined='true'
        :style="{
          backgroundColor: 'white',
          border: '1px solid ' + label.labelColor,
          color: label.labelColor,
          height: '20px',
          fontSize: '12px',
        }"
        @click='showChip()'/>
    </div>

    <div class='flex flex-column row-gap-1'>
      <div
        v-if='task.assignerId'
        class='align-items-center column-gap-2 flex flex-row'>
        <span>{{ t('work.assigner') }}</span>
        <AppGroupAvatar :users='[{id: task.assignerId, fullName: task.assignerName}]'/>
      </div>

      <div class='align-items-center column-gap-2 flex flex-row'>
        <span>{{ t('work.implementer') }}</span>
        <AppGroupAvatar
          :users='mapParticipantUser(task.participants?.filter(participant => participant?.type === ParticipantType[ParticipantType.IMPLEMENTER]))'/>
      </div>

      <div class='align-items-center column-gap-2 flex flex-row'>
        <span>{{ t('common.time') }}</span>
        <span>
          {{ moment(task.startTime).format('DD/MM/YYYY') }}
          <template v-if='task.dueTime'>
            - {{ moment(task.dueTime).format('DD/MM/YYYY') }}
          </template>
        </span>
      </div>
    </div>

    <div
      v-if='task.hasAttachment || task.checkListCount || task.hasLocation || task.isImportant || task.commentCount'
      class='border-bottom-1 border-primary-200'/>

    <div class='align-items-center column-gap-2 flex flex-row flex-wrap justify-content-end'>
      <AppIcon
        v-if='task.hasAttachment'
        class='p-1'
        name='attachment'
        rounded
        size='1.5'
        text/>

      <div
        v-if='task.checkListCount'
        class='column-gap-1 flex flex-row'>
        <AppIcon
          v-if='task.checkListCount.finished === task.checkListCount.total'
          name='check_box'
          size='1.5'/>
        <AppIcon
          v-else
          name='check_box_outline_blank'
          size='1.5'/>
        <label>({{ task.checkListCount.finished }}/{{ task.checkListCount.total }})</label>
      </div>

      <AppIcon
        v-if='task.hasLocation'
        class='p-1'
        name='location_on'
        rounded
        size='1.5'
        text/>
      <AppIcon
        v-if='task.isImportant'
        class='p-1'
        name='error'
        rounded
        size='1.5'
        text/>
      <AppIcon
        v-if='task.commentCount'
        class='p-1'
        name='chat_bubble'
        rounded
        size='1.5'
        text/>
    </div>
  </div>

  <WorkDetailComponent
    v-if='workDetailDialogVisible'
    :dialog-visible='workDetailDialogVisible'
    :task='currentTask'
    @hide-dialog='workDetailDialogVisible = false'/>
</template>

<script lang='ts' setup>
import { cloneDeep, map } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskGraphql } from '@/apps/work/api/graphql/task-api';
import type { Work } from '@/apps/work/model/task';
import { type Participant, ParticipantType } from '@/apps/work/model/task';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import WorkDetailComponent from '@/apps/work/views/actions/WorkDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  task: {
    type: Object as PropType<Work>,
    default: {} as Work
  },
  selectedTask: {
    type: Boolean,
    default: true
  }
});

const emits = defineEmits(['show-chip']);

const { t } = useI18n();
const { moment } = useMoment();
const workDetailDialogVisible = ref(false);

const currentTask = ref<Work>();

function showTaskDetail(task: Work) {
  getTaskGraphql(task.id || '')
    .onResult(a => {
      useTaskDetailStore().task = cloneDeep<Work>(a.data.task);
      workDetailDialogVisible.value = true;
    });
}

function mapParticipantUser(participants?: Participant[]) {
  return map(participants, (participant) => ({
    id: participant.participantId,
    fullName: participant.participantName,
    avatar: participant.participantAvatar,
    email: participant.participantEmail,
    type: participant.type
  }));
}

function dragWorkStart(event: DragEvent) {
  event.dataTransfer?.clearData();
  event.dataTransfer?.setData('text/plain', JSON.stringify(props.task));
}

function dragWork(event: DragEvent) {
  event.preventDefault();
  const kanban = document.getElementsByClassName('kanban');
  if (kanban?.length) {
    if (event.pageX > kanban[0].clientWidth - 100) {
      kanban[0].scroll({ left: kanban[0].scrollLeft + 10 });
    }
    if (event.pageX < kanban[0].clientWidth + 100) {
      kanban[0].scroll({ left: kanban[0].scrollLeft - 10 });
    }
  }
}

function toggleMenu(e: Event, task: Work) {
  EventBus.emit('toggleTaskMenu', {
    event: e,
    task: task
  });
}

function showChip() {
  emits('show-chip');
}

</script>

<script lang='ts'>
export default { name: 'KanbanItem' };
</script>

<style lang='scss' scoped>
.kanban-item {
  background-color: var(--surface-d);
  touch-action: pan-x;

  &:hover {
    background-color: var(--surface-300);
  }
}

.label-kanban-color {
  display: inline-block;
  width: 40px;
  height: 10px;
  cursor: pointer;
  position: relative;
  text-align: center;
  font-size: 2px;
  line-height: 2px;
  background: #ccc;
  border-radius: 10px;
  white-space: nowrap; /* Ngăn các thẻ <span> xuống dòng */
  overflow: hidden; /* Ẩn phần dư thừa nếu có */
  text-overflow: ellipsis; /* Hiển thị dấu ba chấm (...) nếu nội dung quá dài */
}
</style>