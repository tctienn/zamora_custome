<template>
  <component
    :is='viewerType'
    v-if='viewerType.length'
    :notes='notes'
    @change-viewer-type='changeViewerType'
    @save-note-item='saveNoteItem'/>
</template>

<script setup lang='ts'>
import { cloneDeep, findIndex, get, orderBy } from 'lodash';
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';

import {
  deleteNoteGraphql,
  getSubjectNotesGraphql,
  pinNoteGraphql,
  removeNoteGraphql,
  restoreNoteGraphql,
  unpinNoteGraphql
} from '@/common/api/graphql/note-graphql';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import type { Group } from '@/common/model/group';
import { EventType } from '@/common/model/widget/event';
import type { Note } from '@/common/model/widget/note';

const notes = ref<Note[]>([]);
const viewerType = ref('EcmGroupNoteWidget');

const group = inject('group', ref<Group>({} as Group));

const {
  onResult: getNotesResult,
  onError: getNotesError,
  refetch: getNotesRefetch
} = getSubjectNotesGraphql({
  subjectId: group.value.id,
  isDeleted: false,
  types: [EventType[EventType.GROUP]],
  limit: null
});

getNotesResult((response) => {
  notes.value = get(response, 'data.subjectNotes', []);
});

getNotesError((error) => {
});

function changeViewerType(type: string) {
  viewerType.value = type;
}

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

watch(() => viewerType.value, () => {
  if (['EcmGroupNoteWidget', 'EcmGroupNoteWidgetTrash'].includes(viewerType.value)) {
    notes.value = [];
    getNotesRefetch({
      subjectId: group.value.id,
      isDeleted: viewerType.value !== 'EcmGroupNoteWidget',
      types: [EventType[EventType.GROUP]],
      limit: null
    });
  }
});

function pinNote(note: Note) {
  const { mutate: pinNoteMutate, onDone: pinNoteDone } = pinNoteGraphql();
  pinNoteMutate({ noteId: note.id });

  pinNoteDone((response) => {
    const note = get(response, 'data.pinNote', {});
    saveNoteItem(note);
    toastSuccess({});
  });
}

function unpinNote(note: Note) {
  const { mutate: unpinNoteMutate, onDone: unpinNoteDone } = unpinNoteGraphql();
  unpinNoteMutate({ noteId: note.id });

  unpinNoteDone((response) => {
    const note = get(response, 'data.unpinNote', {});
    saveNoteItem(note);
    toastSuccess({});
  });
}

function deleteNote(note: Note) {
  const { mutate: deleteNoteMutate, onDone: deleteNoteDone } = deleteNoteGraphql();
  deleteNoteMutate({ noteId: note.id });

  deleteNoteDone((response) => {
    const noteId = get(response, 'data.deleteNote.id', '');
    removeNoteItem(noteId);
    toastSuccess({});
  });
}

function restoreNote(note: Note) {
  const { mutate: restoreNoteMutate, onDone: restoreNoteDone } = restoreNoteGraphql();
  restoreNoteMutate({ noteId: note.id });

  restoreNoteDone((response) => {
    const noteId = get(response, 'data.restoreNote.id', '');
    removeNoteItem(noteId);
    toastSuccess({});
  });
}

function removeNote(note: Note) {
  const { mutate: removeNoteMutate, onDone: removeNoteDone } = removeNoteGraphql();
  removeNoteMutate({ noteId: note.id });

  removeNoteDone((response) => {
    const noteId = get(response, 'data.removeNote', '');
    removeNoteItem(noteId);
    toastSuccess({});
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
import EcmGroupNoteWidget
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteWidget.vue';
import EcmGroupNoteWidgetTrash
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteWidgetTrash.vue';

export default {
  name: 'EcmGroupNote',

  components: {
    EcmGroupNoteWidget,
    EcmGroupNoteWidgetTrash
  }
};
</script>