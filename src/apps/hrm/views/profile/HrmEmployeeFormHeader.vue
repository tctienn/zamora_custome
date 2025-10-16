<template>
  <TabMenu :model='items'>
    <template #item='{item}'>
      <a
        v-ripple
        class='flex flex-column gap-1 p-2 p-menuitem-link p-ripple'>
        <AppIcon
          :name='item.icon'
          size='1.5'/>
        <span>{{ item.label }}</span>
      </a>
    </template>
  </TabMenu>
</template>

<script lang='ts' setup>
import type { MenuItem } from 'primevue/menuitem';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';

const emits = defineEmits(['changeTab']);
const { t } = useI18n();
const items: MenuItem[] = [
  {
    label: t('hrm.profile.type.summary'),
    icon: 'description',
    command: () => emits('changeTab', 'summary')
  },
  {
    label: t('hrm.profile.type.familyRelationship'),
    icon: 'diversity_1',
    command: () => emits('changeTab', 'familyRelationship')
  },
  {
    label: t('hrm.profile.type.trainingProcess'),
    icon: 'menu_book',
    command: () => emits('changeTab', 'trainingProcess')
  },
  {
    label: t('hrm.profile.type.workProcess'),
    icon: 'work_history',
    command: () => emits('changeTab', 'workProcess')
  },
  {
    label: t('hrm.profile.type.skills'),
    icon: 'hotel_class',
    command: () => emits('changeTab', 'skill')
  },
  {
    label: t('hrm.profile.type.health'),
    icon: 'ecg_heart',
    command: () => emits('changeTab', 'health')
  },
  {
    label: t('hrm.profile.type.receptionDocuments'),
    icon: 'demography',
    command: () => emits('changeTab', 'receptionDocuments')
  },
];

</script>

<style scoped>

</style>