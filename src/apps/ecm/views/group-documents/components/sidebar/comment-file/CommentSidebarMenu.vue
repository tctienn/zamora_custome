<template>
  <div class='border-round flex flex-column h-fit row-gap-2'>
    <div class='text-center'>
      <ButtonIcon
        class='toggle-sidebar-button'
        :class='{"rotate-180": !expandedSidebar}'
        icon='double_arrow'
        icon-size='1.5'
        rounded
        text
        @click='emits("toggle-expand-sidebar")'>
      </ButtonIcon>
    </div>

  </div>
</template>

<script setup lang='ts'>
import { computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  expandedSidebar: {
    type: Boolean,
    default: false
  },
  widgetComponent: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['toggle-expand-sidebar']);

const groupViewerType = inject('group-viewer-type', ref<string>('GroupDocument'));
computed(() => groupViewerType.value === 'GroupDocument' ? {
  type: 'GroupTrash',
  label: t('ecm.group.groupTrash'),
  icon: 'delete',
  severity: 'danger'
} : {
  type: 'GroupDocument',
  label: t('ecm.group.groupDocument'),
  icon: 'folder',
  severity: 'help'
});
inject('change-group-viewer-type', (type: string) => {
  return type;
});
const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'CommentSidebarMenu' };
</script>