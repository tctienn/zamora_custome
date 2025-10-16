<template>
  <div class='border-round flex flex-column h-fit p-2 row-gap-2 surface-100'>
    <div class='text-center'>
      <ButtonIcon
        class='toggle-sidebar-button'
        :class='{"rotate-180": !expandedSidebar}'
        icon='double_arrow'
        icon-size='1.5'
        rounded
        text
        @click='emits("toggle-expand-sidebar", "EcmGroupMainSidebar")'>
      </ButtonIcon>
    </div>

    <Divider class='border-primary my-0'/>

    <div
      v-for='widget in ecmGroupMenuWidgets'
      :key='widget.key'
      class='relative'>
      <ButtonIcon
        v-tooltip='t(widget.label)'
        class='p-2'
        :icon='widget.icon'
        icon-size='1.5'
        :severity='widgetComponent === widget.component ? "primary" :"secondary"'
        text
        @click='emits("select-widget", widget)'>
      </ButtonIcon>
      <AppIcon
        v-if='widgetComponent === widget.component'
        class='-ml-2 -translate-y-50 absolute left-0 my-auto top-50'
        color='var(--primary-color)'
        name='chevron_left'
        size='1.5'></AppIcon>
    </div>

    <Divider class='my-0'/>

    <ButtonIcon
      v-tooltip='lastButton.label'
      class='p-2'
      :icon='lastButton.icon'
      icon-size='1.5'
      rounded
      :severity='lastButton.severity'
      text
      @click='changeGroupViewerType(lastButton.type)'>
    </ButtonIcon>
  </div>
</template>

<script setup lang='ts'>
import { filter, orderBy } from 'lodash';
import { computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ECM_GROUP_MENU_WIDGETS } from '@/apps/ecm/constants';

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

const emits = defineEmits(['toggle-expand-sidebar', 'select-widget']);
const ecmGroupMenuWidgets = computed(() => filter(orderBy(ECM_GROUP_MENU_WIDGETS, ['order'], ['asc']), 'visible'));

const groupViewerType = inject('group-viewer-type', ref<string>('GroupDocument'));

const lastButton = computed(() => groupViewerType.value === 'GroupDocument' ? {
  type: 'GroupTrash',
  label: t('ecm.group.groupTrash'),
  icon: 'delete',
  severity: 'danger'
} : {
  type: 'GroupDocument',
  label: t('ecm.group.groupDocument'),
  icon: 'folder',
  severity: 'primary'
});

const changeGroupViewerType = inject('change-group-viewer-type', (type: string) => {
  return type;
});

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'EcmGroupSidebarMenu' };
</script>