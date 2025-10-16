<template>
  <SystemDashboardWidget :widget='widget'>
    <!--    <template #header-action>-->
    <!--      <ButtonIcon-->
    <!--        icon='add_circle'-->
    <!--        rounded-->
    <!--        text/>-->
    <!--    </template>-->

    <template #body>
      <div class='flex flex-row flex-wrap'>
        <template
          v-for='(subHeader, index) in subHeaders'
          :key='index'>
          <span
            class='cursor-pointer'
            :class='{"font-bold": activeSubHeader === index}'
            @click='subHeader.action'>
            {{ t(subHeader.label) }} ({{ subHeader.count }})
          </span>

          <Divider
            v-if='index < subHeaders.length - 1'
            class='border-400 border-left-1 mx-3 p-0'
            layout='vertical'/>
        </template>
      </div>
      <div class='flex flex-column row-gap-2'>
        <div
          v-for='note in notes'
          :key='note.id'
          class='bg-yellow-200 flex flex-column p-2 text-black-alpha-90'>
          <div class='flex flex-row'>
            <span class='font-bold word-break-break-word'>{{ `+ ${note.title}` }}</span>
            <AppIcon
              v-if='note.pinned'
              color='var(--red-400)'
              name='push_pin'
              size='1.5'/>
          </div>
          <span class='note-content'>{{ `${note.content}` }}</span>
          <router-link
            v-if='note.type.toString() === NoteType[NoteType.GROUP]'
            class='align-self-end font-bold text-sm underline'
            :to='{name: "EcmGroupMainPage", params: {id: note.subjectId}}'>{{ note.subjectName }}
          </router-link>
        </div>
      </div>
    </template>

    <template #footer>
      <router-link
        class='align-self-end font-italic mx-3 my-1 text-color underline'
        :to='{name: "WidgetNote"}'>
        <small>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </router-link>
    </template>
  </SystemDashboardWidget>
</template>

<script setup lang='ts'>
import { assign, findIndex, get, keyBy, merge, sumBy, toLower } from 'lodash';
import { computed, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { countNotesGraphql, getNotesGraphql } from '@/common/api/graphql/note-graphql';
import { mapEnum } from '@/common/helpers/utils';
import type { DashboardWidgetSubHeader, WidgetInstance } from '@/common/model';
import { type Note, NoteType } from '@/common/model/widget/note';
import SystemDashboardWidget from '@/common/views/dashboard/component/SystemDashboardWidget.vue';

const props = defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const activeSubHeader = ref(0);
const notes = ref<Note[]>([]);

const { t } = useI18n();

let subHeaders = reactive<DashboardWidgetSubHeader[]>([
  {
    key: NoteType[NoteType.PERSONAL],
    label: 'common.personal',
    count: 0,
    action: loadPersonalNotes
  },
  {
    key: NoteType[NoteType.GROUP],
    label: 'common.group',
    count: 0,
    action: loadGroupNotes
  },
  {
    key: 'ALL',
    label: 'common.all',
    count: 0,
    action: loadAllNotes
  }
]);

const types = ref<string[]>([NoteType[NoteType.PERSONAL]]);
const searchParam = computed(() => ({
  isDeleted: false,
  types: types.value,
  limit: props.widget?.recordNumber ?? 3
}));

const { onResult: countNotesResult } = countNotesGraphql({
  ...searchParam.value,
  ...{ types: mapEnum(NoteType) }
});
countNotesResult((response) => {
  const countNotes = get(response, 'data.countNotes', [{
    type: '',
    count: 0
  }]);
  const totalNotes = sumBy(countNotes, 'count');
  assign(subHeaders, merge(keyBy(subHeaders, 'key'), keyBy(countNotes, 'type')));

  const subHeaderAllIndex = findIndex(subHeaders, ['key', 'ALL']);
  if (subHeaderAllIndex >= 0) {
    subHeaders[subHeaderAllIndex].count = totalNotes;
  }

  subHeaders[0].action();
});

const { onResult: getNotesResult, refetch: getNotesRefetch } = getNotesGraphql(searchParam.value);

getNotesResult((response) => {
  notes.value = get(response, 'data.notes', []);
});

function loadPersonalNotes() {
  activeSubHeader.value = 0;
  types.value = [NoteType[NoteType.PERSONAL]];
  getNotesRefetch(searchParam.value);

}

function loadGroupNotes() {
  activeSubHeader.value = 1;
  types.value = [NoteType[NoteType.GROUP]];
  getNotesRefetch(searchParam.value);
}

function loadAllNotes() {
  activeSubHeader.value = 2;
  types.value = [NoteType[NoteType.PERSONAL], NoteType[NoteType.GROUP]];
  getNotesRefetch(searchParam.value);
}

</script>

<script lang='ts'>
export default { name: 'DashboardNoteWidget' };
</script>

<style scoped lang='scss'>
.note-content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>