<template>
  <div class='-mr-2 flex flex-column h-full overflow-y-auto pr-2 row-gap-3'>
    <div class='flex flex-column row-gap-2'>
      <span class='align-items-center column-gap-1 flex flex-row font-bold text-lg'>
        <AppIcon
          name='sticky_note'
          size='1.5'/>
        {{ t("ecm.group.widgets.note") }} ({{ totalNote }})
      </span>
      <div class='flex flex-column row-gap-2'>
        <EcmGroupNoteItem
          v-for='note in notes'
          :key='note.id'
          :note='note'
          :view-only='true'/>
      </div>
      <div class='align-self-end font-italic mx-3 my-1'>
        <small
          class='cursor-pointer text-color underline'
          @click='emits("select-widget", getWidget("note"))'>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </div>
    </div>

    <div class='flex flex-column row-gap-2'>
      <span class='align-items-center column-gap-1 flex flex-row font-bold text-lg'>
        <AppIcon
          name='forum'
          size='1.5'/>
        {{ t("ecm.group.widgets.topic") }} ({{ totalTopic }})
      </span>
      <div class='flex flex-column row-gap-2'>
        <div
          class='column-gap-1 flex flex-row flex-shrink-0 flex-wrap max-h-7rem overflow-y-auto pr-2 row-gap-2'>
          <template v-if='topics'>
            <Chip
              v-for='topic in topics'
              :key='topic.id'
              class='align-items-center align-self-start cursor-pointer flex flex-row vertical-align-middle'
              :class='{"bg-primary": selectedTopic.id === topic.id}'
              rounded>
              <span
                class='py-1 word-break-break-word'
                @click='toggleTopic(topic)'>{{ `# ${topic.name}` }}</span>
            </Chip>
          </template>

          <div
            v-else
            class='flex flex-row justify-content-center w-full'>
            <span>{{ t("ecm.group.topicWidget.noTopics") }}</span>
          </div>
        </div>

        <template v-if='Object.keys(selectedTopic).length'>
          <Divider class='my-0'/>

          <EcmGroupTopicComment
            ref='ecmGroupTopicComment'
            :topic='selectedTopic'
            :view-only='false'/>
        </template>
      </div>
      <div class='align-self-end font-italic mx-3 my-1'>
        <small
          class='cursor-pointer text-color underline'
          @click='emits("select-widget", getWidget("topic"))'>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </div>
    </div>

    <div class='flex flex-column row-gap-2'>
      <span class='align-items-center column-gap-1 flex flex-row font-bold text-lg'>
        <AppIcon
          name='calendar_month'
          size='1.5'/>
        {{ t("ecm.group.widgets.event") }} ({{ totalEvent }})
      </span>
      <EcmGroupEventItem
        v-for='day in Object.keys(groupedEvents)'
        :key='day'
        :day='day'
        :events='groupedEvents[day]'
        :view-only='true'/>
      <div class='align-self-end font-italic mx-3 my-1'>
        <small
          class='cursor-pointer text-color underline'
          @click='emits("select-widget", getWidget("event"))'>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { find, forEach, get, groupBy, map, toLower } from 'lodash';
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ECM_GROUP_MENU_WIDGETS } from '@/apps/ecm/constants';
import EcmGroupEventItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventItem.vue';
import EcmGroupNoteItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteItem.vue';
import EcmGroupTopicComment
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/comment/EcmGroupTopicComment.vue';
import { getSubjectEventsGraphql } from '@/common/api/graphql/event-graphql';
import { getSubjectNotesPageGraphql } from '@/common/api/graphql/note-graphql';
import { getSubjectTopicsPageGraphql } from '@/common/api/graphql/topic-graphql';
import type { Group, GroupTopic } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';
import { type Event, EventType } from '@/common/model/widget/event';
import { type Note, NoteType } from '@/common/model/widget/note';
import { type Topic, TopicType } from '@/common/model/widget/topic';

const emits = defineEmits(['select-widget']);

const { t } = useI18n();

const group = inject('group', ref<Group>({} as Group));

const totalNote = ref(0);
const notes = ref<Note[]>([]);
const totalTopic = ref(0);
const topics = ref<Topic[]>([]);
const totalEvent = ref(0);
const events = ref<Event[]>([]);
const groupedEvents = computed(() => groupBy(events.value, 'date'));

const selectedTopic = ref<GroupTopic>({} as GroupTopic);

function getWidget(key: string) {
  return find(ECM_GROUP_MENU_WIDGETS, ['key', key]);
}

function getWidgetData() {
  forEach(ECM_GROUP_MENU_WIDGETS, (widget) => {
    switch (widget.key) {
    case 'note':
      getNotes(widget.recordNumber);
      break;
    case 'topic':
      getTopics(widget.recordNumber);
      break;
    case 'event':
      getEvents(widget.recordNumber);
      break;
    default:
      break;
    }
  });
}

function getNotes(size: number) {
  const { onResult: getNotesResult } = getSubjectNotesPageGraphql({
    subjectId: group.value.id,
    isDeleted: false,
    types: [NoteType[NoteType.GROUP]],
    limit: size
  });

  getNotesResult(response => {
    const { content, totalElements } = get(response, 'data.subjectNotesPage', {
      content: [],
      totalElements: 0
    });
    notes.value = content;
    totalNote.value = totalElements;
  });
}

function getTopics(size: number) {

  const { onResult: getTopicsResult } = getSubjectTopicsPageGraphql({
    subjectId: group.value.id,
    isDeleted: false,
    types: [TopicType[TopicType.GROUP]],
    limit: size
  });

  getTopicsResult(response => {
    const { content, totalElements } = get(response, 'data.subjectTopicsPage', {
      content: [],
      totalElements: 0
    });
    topics.value = content;
    totalTopic.value = totalElements;
  });
}

function toggleTopic(topic: GroupTopic) {
  if (JSON.stringify(selectedTopic.value) === JSON.stringify(topic)) {
    selectedTopic.value = {} as GroupTopic;
  } else {
    selectedTopic.value = topic;
  }
}

function getEvents(size: number) {
  const eventPageable = reactive<Pageable>({
    page: 0,
    size,
    sort: [{
      property: 'date',
      direction: Direction.DESC
    },
    {
      property: 'fromAt',
      direction: Direction.ASC
    }]
  });

  const { onResult: getEventsResult } = getSubjectEventsGraphql({
    subjectId: group.value.id,
    isDeleted: false,
    types: [EventType[EventType.GROUP]],
    fromDate: null,
    toDate: null,
    pageable: eventPageable
  });

  getEventsResult(response => {
    const { edges, totalCount } = get(response, 'data.subjectEvents', {
      edges: [],
      totalCount: 0
    });
    totalEvent.value = totalCount;
    events.value = map(edges, 'node');
  });
}

onMounted(() => {
  getWidgetData();
});
</script>

<script lang='ts'>
export default { name: 'EcmGroupWidgetSummary' };
</script>