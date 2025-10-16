<template>
  <div class='column-gap-2 flex flex-row h-full p-2'>
    <div class='flex flex-column row-gap-3 w-18rem'>
      <span class='font-bold text-lg'>{{ t('widget.note.title') }}</span>
      <div
        class='flex flex-row flex-wrap'>
        <template
          v-for='(subHeader, index) in subHeaders'
          :key='index'>
          <span
            class='cursor-pointer'
            :class='{"font-bold text-primary": activeSubHeader === index}'
            @click='subHeader.action'>
            {{ t(subHeader.label, { count: subHeader.count }) }}
          </span>

          <Divider
            v-if='index < subHeaders.length - 1'
            class='mx-3 p-0 surface-border'
            layout='vertical'/>
        </template>
      </div>

      <div
        v-if='activeSubHeader === 1'
        class='flex flex-column'>
        <Dropdown
          v-model='selectedGroup'
          option-label='name'
          :options='groups'
          :placeholder='t("common.group")'/>
      </div>

      <div class='flex flex-column mt-5 row-gap-1'>
        <span
          class='align-items-center border-round column-gap-2 cursor-pointer flex flex-row hover:surface-200 p-2 w-full'
          :class='{"font-bold text-orange-500 surface-100": !isDeleted}'
          @click='isDeleted = false'>
          <AppIcon
            :color='isDeleted ? "" : "var(--orange-500)"'
            name='sticky_note'
            size='1.5'/>
          {{ t('widget.note.title') }}
        </span>
        <span
          class='align-items-center border-round column-gap-2 cursor-pointer flex flex-row hover:surface-200 p-2 w-full'
          :class='{"font-bold text-red-700 surface-100": isDeleted}'
          @click='isDeleted = true'>
          <AppIcon
            :color='isDeleted ? "var(--red-700)" : ""'
            name='delete'
            size='1.5'/>
          {{ t('common.trash') }}
        </span>
      </div>
    </div>

    <Divider
      class='mx-0'
      layout='vertical'/>

    <div class='w-full'>
      <div
        class='flex flex-column h-full overflow-hidedn row-gap-3'>
        <div
          v-if='!isDeleted && (activeSubHeader === 0 || (activeSubHeader === 1 && selectedGroup))'
          class='border-1 border-left-3'
          :class='v$.$error ? "border-red-500" : "border-primary"'>
          <NoteEdit
            v-model='newNote'
            class='bg-yellow-200'
            editable
            is-new
            @save-note='saveNote'/>
        </div>

        <div class='flex flex-row'>
          <div
            class='flex flex-column h-full overflow-y-auto row-gap-3'
            :class='selectedNote? "w-3" : "w-12"'>
            <template v-if='displayNotes.length'>
              <EcmGroupNoteItem
                v-for='note in displayNotes'
                :key='note.id'
                :class='selectedNote?.id === note.id ? "surface-300" : ""'
                :note='note'
                :style='selectedNote?.id === note.id ? {backgroundColor: "var(--primary-light-40)"} : {}'
                @click='selectedNote = note'/>
            </template>

            <div
              v-else
              class='flex flex-row justify-content-center'>
              <span>{{ t('ecm.group.noteWidget.noNotes') }}</span>
            </div>
          </div>
          <Divider
            v-if='selectedNote'
            class='mx-2'
            layout='vertical'/>

          <div
            v-if='selectedNote'
            class='w-9'>
            <NoteEdit
              v-model='selectedNote'
              class='bg-blue-200 border-1'
              :class='invalidEditNote ? "border-red-500" : "border-primary"'
              :editable='!selectedNote.isDeleted&&selectedNote.creatorId===user.id'
              :is-new='false'
              @close-edit='closeEdit'
              @focusout='updateNote'
              @save-note='updateNote'/>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { cloneDeep, filter, findIndex, get, omit, orderBy, trim } from 'lodash';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupNoteItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteItem.vue';
import NoteEdit from '@/apps/widget/views/note/NoteEdit.vue';
import { getGroupUserInGraphql } from '@/common/api/graphql/group-graphql';
import {
  deleteNoteGraphql,
  getNotesLazyGraphql,
  pinNoteGraphql,
  removeNoteGraphql,
  restoreNoteGraphql,
  saveNoteGraphql,
  unpinNoteGraphql
} from '@/common/api/graphql/note-graphql';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import type { DashboardWidgetSubHeader } from '@/common/model';
import type { Group } from '@/common/model/group';
import { EventType } from '@/common/model/widget/event';
import { type Note, NoteType } from '@/common/model/widget/note';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const { user } = useUserStore();

const activeSubHeader = ref(0);

const notes = ref<Note[]>([]);
let allGroupNote: Note[] = [];
const groups = ref<Group[]>([]);
const selectedGroup = ref<Group | null>(null);
const selectedNote = ref<Note | null>(null);

const currentNotesInGroup = computed(() => selectedGroup.value ? allGroupNote.filter(n => n.subjectId === selectedGroup.value?.id) : []);
const displayNotes = computed(() => activeSubHeader.value === 1 ? currentNotesInGroup.value : notes.value);

const defaultNote = {
  title: t('widget.note.defaultTitle'),
  content: '',
};
const newNote = ref<Note>(defaultNote as Note);

let subHeaders = reactive<DashboardWidgetSubHeader[]>([
  {
    key: 'personal',
    label: 'widget.note.personal',
    count: 0,
    action: loadPersonalNotes
  },
  {
    key: 'group',
    label: 'widget.note.group',
    count: 0,
    action: loadGroupNotes
  },
  {
    key: 'all',
    label: 'common.all',
    count: 0,
    action: loadAllNotes
  }
]);

const types = ref<string[]>([EventType[EventType.PERSONAL]]);
const isDeleted = ref(false);

const searchParams = computed(() => ({
  isDeleted: isDeleted.value,
  types: types.value
}));

const {
  onResult: getNotesResult,
  load: getNotesLoad,
  refetch: getNotesRefetch
} = getNotesLazyGraphql(searchParams.value);
getNotesLoad();

getNotesResult((response) => {
  notes.value = get(response, 'data.notes', []);
  if (activeSubHeader.value === 1) {
    allGroupNote = notes.value;
  }
});

function loadPersonalNotes() {
  activeSubHeader.value = 0;
  types.value = [EventType[EventType.PERSONAL]];
}

function loadGroupNotes() {
  activeSubHeader.value = 1;

  types.value = [EventType[EventType.GROUP]];

  const { onResult: getGroupUserInResult } = getGroupUserInGraphql();
  getGroupUserInResult((response) => {
    groups.value = get(response, 'data.groupUserIn', []);
  });
}

function loadAllNotes() {
  activeSubHeader.value = 2;
  types.value = [EventType[EventType.PERSONAL], EventType[EventType.GROUP]];
}

watch(() => isDeleted.value, () => {
  selectedNote.value = null;
  getNotesRefetch(searchParams.value);
});

watch(() => types.value, () => {
  selectedGroup.value = null;
  selectedNote.value = null;
  getNotesRefetch(searchParams.value);
});

watch(() => selectedGroup.value, () => {
  if (activeSubHeader.value === 1) {
    notes.value = filter(allGroupNote, ['subjectId', selectedGroup.value?.id || '']);
  }
});

const validateRules = {
  title: { required },
  content: { required }
};
const v$ = useVuelidate(validateRules, newNote);
const invalidEditNote = ref(false);

const {
  mutate: saveNoteMutate,
  onDone: saveNoteDone
} = saveNoteGraphql();

function saveNote() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveNoteMutate({
        note: {
          title: trim(newNote.value.title),
          content: trim(newNote.value.content),
          type: NoteType[activeSubHeader.value === 0 ? NoteType.PERSONAL : NoteType.GROUP],
          subjectId: activeSubHeader.value === 0 ? user.id : selectedGroup.value?.id
        }
      });
    }
  });
}

function updateNote() {
  if (selectedNote.value) {
    if (selectedNote.value.content && selectedNote.value.title) {
      const oldNote = notes.value.find(n => n.id === selectedNote.value?.id);
      if (JSON.stringify(oldNote) !== JSON.stringify(selectedNote.value)) {
        saveNoteMutate({ note: omit(selectedNote.value) })
          .then(() => toastSuccess({}))
          .finally(() => invalidEditNote.value = false);
      }
    } else {
      invalidEditNote.value = true;
    }
  }
}

saveNoteDone((response) => {
  const note = get(response, 'data.saveNote', {});
  saveNoteItem(note);
  v$.value.$reset();
  newNote.value = defaultNote as Note;
});

function saveNoteItem(note: Note) {
  const clonedNotes = cloneDeep(notes.value);
  const noteIndex = findIndex(clonedNotes, ['id', note.id]);
  if (noteIndex >= 0) {
    clonedNotes[noteIndex] = note;
  } else {
    clonedNotes.push(note);
  }
  notes.value = orderBy(clonedNotes, ['pinned', 'createdAt'], ['desc', 'desc']);
}

function removeNoteItem(noteId: string) {
  const noteIndex = findIndex(notes.value, ['id', noteId]);
  if (noteIndex >= 0) {
    const clonedNotes = cloneDeep(notes.value);
    clonedNotes.splice(noteIndex, 1);
    notes.value = clonedNotes;
  }
}

function pinNote(note: Note) {
  const {
    mutate: pinNoteMutate,
    onDone: pinNoteDone
  } = pinNoteGraphql();
  pinNoteMutate({ noteId: note.id });

  pinNoteDone((response) => {
    const note = get(response, 'data.pinNote', {});
    saveNoteItem(note);
    toastSuccess({});
  });
}

function unpinNote(note: Note) {
  const {
    mutate: unpinNoteMutate,
    onDone: unpinNoteDone
  } = unpinNoteGraphql();
  unpinNoteMutate({ noteId: note.id });

  unpinNoteDone((response) => {
    const note = get(response, 'data.unpinNote', {});
    saveNoteItem(note);
    toastSuccess({});
  });
}

function deleteNote(note: Note) {
  const {
    mutate: deleteNoteMutate,
    onDone: deleteNoteDone
  } = deleteNoteGraphql();
  deleteNoteMutate({ noteId: note.id });

  deleteNoteDone((response) => {
    const noteId = get(response, 'data.deleteNote.id', '');
    removeNoteItem(noteId);
    toastSuccess({});
    if (selectedNote.value) {
      if (note.id === selectedNote.value.id) {
        selectedNote.value = null;
      }
    }
  });
}

function restoreNote(note: Note) {
  const {
    mutate: restoreNoteMutate,
    onDone: restoreNoteDone
  } = restoreNoteGraphql();
  restoreNoteMutate({ noteId: note.id });

  restoreNoteDone((response) => {
    const noteId = get(response, 'data.restoreNote.id', '');
    removeNoteItem(noteId);
    toastSuccess({});
  });
}

function closeEdit() {
  selectedNote.value = null;
  invalidEditNote.value = false;
}

function removeNote(note: Note) {
  const {
    mutate: removeNoteMutate,
    onDone: removeNoteDone
  } = removeNoteGraphql();
  removeNoteMutate({ noteId: note.id });

  removeNoteDone((response) => {
    const noteId = get(response, 'data.removeNote', '');
    removeNoteItem(noteId);
    toastSuccess({});
    if (selectedNote.value) {
      if (note.id === selectedNote.value.id) {
        selectedNote.value = null;
      }
    }
  });
}

onMounted(() => {
  EventBus.on('ecm-group-pin-note', pinNote);
  EventBus.on('ecm-group-unpin-note', unpinNote);
  EventBus.on('ecm-group-delete-note', deleteNote);
  EventBus.on('ecm-group-restore-note', restoreNote);
  EventBus.on('ecm-group-remove-note', removeNote);
});

onUnmounted(() => {
  EventBus.off('ecm-group-pin-note', pinNote);
  EventBus.off('ecm-group-unpin-note', unpinNote);
  EventBus.off('ecm-group-delete-note', deleteNote);
  EventBus.off('ecm-group-restore-note', restoreNote);
  EventBus.off('ecm-group-remove-note', removeNote);

});
</script>

<script lang='ts'>
export default { name: 'NoteWidget' };
</script>