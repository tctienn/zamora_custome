<template>
  <div class='flex flex-column h-full'>
    <EcmGroupWidgetHeader
      :left-button='headerButton'
      :title='t("ecm.group.noteWidget.deletedNotes")'/>

    <div class='h-full mt-3 overflow-y-auto'>
      <div class='flex flex-column row-gap-3'>
        <template v-if='notes.length'>
          <EcmGroupNoteItem
            v-for='note in notes'
            :key='note.id'
            :note='note'/>
        </template>

        <div
          v-else
          class='flex flex-row justify-content-center'>
          <span>{{ t("ecm.group.noteWidget.noNotes") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import EcmGroupNoteItem from '@/apps/ecm/views/group-documents/components/sidebar/widgets/note/EcmGroupNoteItem.vue';
import type { Note } from '@/common/model/widget/note';

defineProps({
  notes: {
    type: Array as PropType<Note[]>,
    default: () => []
  }
});

const emits = defineEmits(['change-viewer-type']);

const { t } = useI18n();

const headerButton = {
  icon: 'arrow_back',
  label: t('common.back'),
  command: () => {
    emits('change-viewer-type', 'EcmGroupNoteWidget');
  }
};
</script>

<script lang='ts'>
export default { name: 'EcmGroupNoteWidgetTrash' };
</script>