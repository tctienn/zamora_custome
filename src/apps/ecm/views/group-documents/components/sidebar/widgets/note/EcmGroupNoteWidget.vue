<template>
  <div class='flex flex-column h-full'>
    <EcmGroupWidgetHeader
      icon='sticky_note'
      :right-button='headerButton'
      :title='t("ecm.group.widgets.note")'/>

    <div class='flex flex-column h-full mt-3 overflow-hidden row-gap-3'>
      <div class='w-full'>
        <div
          class='flex flex-column h-full overflow-hidedn row-gap-3'>
          <div
            class='border-1 border-left-3'
            :class='v$.$error ? "border-red-500" : "border-primary"'>
            <NoteEdit
              v-model='currentNote'
              :class='currentNote.id? "bg-blue-200": "bg-yellow-200"'
              :editable='!currentNote.id || currentNote.creatorId === user.id'
              :is-new='!currentNote.id'
              @close-edit='closeEdit'
              @focusout='focusOut'
              @save-note='saveNote'/>
          </div>

          <div
            class='flex flex-column h-full overflow-y-auto row-gap-3'>
            <template v-if='notes.length'>
              <EcmGroupNoteItem
                v-for='note in notes'
                :key='note.id'
                :class='currentNote.id === note.id ? "surface-300" : ""'
                :note='note'
                @click='currentNote = note'/>
            </template>

            <div
              v-else
              class='flex flex-row justify-content-center'>
              <span>{{ t('ecm.group.noteWidget.noNotes') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { cloneDeep, findIndex, get, orderBy, trim } from 'lodash';
import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import EcmGroupNoteItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteItem.vue';
import NoteEdit from '@/apps/widget/views/note/NoteEdit.vue';
import { saveNoteGraphql } from '@/common/api/graphql/note-graphql';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Group } from '@/common/model/group';
import { type Note, NoteType } from '@/common/model/widget/note';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  notes: {
    type: Array as PropType<Note[]>,
    default: () => []
  }
});
const emits = defineEmits(['change-viewer-type', 'save-note-item']);

const { t } = useI18n();

const defaultNote = {
  title: t('widget.note.defaultTitle'),
  content: '',
};
const currentNote = ref<Note>(defaultNote as Note);
const notesList = ref<Note[]>(props.notes);

const { user } = useUserStore();

const headerButton = {
  icon: 'delete',
  label: t('ecm.group.noteWidget.deletedNotes'),
  command: () => {
    emits('change-viewer-type', 'EcmGroupNoteWidgetTrash');
  }
};

const group = inject('group', ref<Group>({} as Group));

const validateRules = {
  title: { required },
  content: { required }
};
const v$ = useVuelidate(validateRules, currentNote);

const {
  mutate: saveNoteMutate,
  onDone: saveNoteDone
} = saveNoteGraphql();

function saveNote() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveNoteMutate({
        note: {
          ...currentNote.value,
          title: trim(currentNote.value.title),
          content: trim(currentNote.value.content),
          type: NoteType[NoteType.GROUP],
          subjectId: group.value.id
        }
      });
    }
  });
}

saveNoteDone((response) => {
  toastSuccess({});
  emits('save-note-item', get(response, 'data.saveNote', {}));
  const note = get(response, 'data.saveNote', {});
  saveNoteItem(note);
  v$.value.$reset();
  if (!currentNote.value.id) {
    currentNote.value = defaultNote as Note;
  }
});

function saveNoteItem(note: Note) {
  const clonedNotes = cloneDeep(notesList.value);
  const noteIndex = findIndex(clonedNotes, ['id', note.id]);
  if (noteIndex >= 0) {
    clonedNotes[noteIndex] = note;
  } else {
    clonedNotes.push(note);
  }
  notesList.value = orderBy(clonedNotes, ['pinned', 'createdAt'], ['desc', 'desc']);
}

function focusOut() {
  if(!currentNote.value.id && !currentNote.value.content) {
    return;
  }
  const oldNote = notesList.value.find(n => n.id === currentNote.value?.id);
  if (JSON.stringify(oldNote) === JSON.stringify(currentNote.value)) {
    return;
  }
  saveNote();
}
//
// function updateNote() {
//   if (currentNote.value) {
//     if (currentNote.value.content && currentNote.value.title) {
//       const oldNote = notesList.value.find(n => n.id === currentNote.value?.id);
//       if (JSON.stringify(oldNote) !== JSON.stringify(currentNote.value)) {
//         saveNoteMutate({ note: omit(currentNote.value) })
//           .then(() => toastSuccess({}))
//           .finally(() => invalidEditNote.value = false);
//       }
//     } else {
//       invalidEditNote.value = true;
//     }
//   }
// }

function closeEdit() {
  currentNote.value = defaultNote as Note;
}

watch(currentNote, (value, oldValue) => {
  if (value.id !== oldValue.id) {
    v$.value.$reset();
  }
});

</script>

<script lang='ts'>
export default { name: 'EcmGroupNoteWidget' };
</script>