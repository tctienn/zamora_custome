<template>
  <div
    class='border-left-3 cursor-pointer hover:surface-200 p-2 relative surface-100'
    :class='note.pinned ? " border-1 border-yellow-500" : "border-primary"'>
    <div class='font-bold'>
      {{ note.title }}
    </div>
    <div class='pr-4'>
      <span class='line-number-2 white-space-pre-wrap word-break-break-word'>
        {{ note.content }}
      </span>
    </div>

    <div class='align-items-center align-self-end column-gap-3 flex flex-row flex-wrap justify-content-end mt-2'>
      <small class='opacity-60 word-break-break-word'>
        {{ note.creator ? t('ecm.group.noteWidget.createdBy', { creator: note.creator }) + ',' : '' }}
        {{ convertReadableDate(note.createdAt) }}
      </small>

      <div
        v-if='!viewOnly'
        class='column-gap-1 flex flex-row'>
        <ButtonIcon
          v-if='note.isDeleted'
          v-tooltip='t("ecm.group.noteWidget.restore")'
          icon='replay'
          text
          @click.prevent='EventBus.emit("ecm-group-restore-note", note)'/>
        <ButtonIcon
          v-tooltip='t(`ecm.group.noteWidget.${note.isDeleted ? "remove" : "delete"}`)'
          icon='close'
          text
          @click.prevent='EventBus.emit(note.isDeleted ? "ecm-group-remove-note" : "ecm-group-delete-note", note)'/>
      </div>
    </div>

    <div class='absolute m-2 right-0 top-0'>
      <ButtonIcon
        v-if='!note.isDeleted && !viewOnly'
        v-tooltip='t(`ecm.group.noteWidget.${note.pinned ? "unpin" : "pin"}`)'
        :icon='note.pinned ? "location_off" : "location_on"'
        text
        @click.prevent='EventBus.emit(note.pinned ? "ecm-group-unpin-note" : "ecm-group-pin-note", note)'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import EventBus from '@/common/helpers/event-bus';
import { convertReadableDate } from '@/common/helpers/utils';
import type { Note } from '@/common/model/widget/note';

defineProps({
  note: {
    type: Object as PropType<Note>,
    default: {} as Note
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'EcmGroupNoteItem' };
</script>