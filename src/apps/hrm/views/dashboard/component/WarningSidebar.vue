<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:65vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.dashboard.warning') }}
        </div>
      </div>
    </template>

    <div class='w-full'>
      <TabView v-model:active-index='activeIndex'>
        <TabPanel
          v-for='tab in tabs'
          :key='tab.title'
          :header='tab.title'>
        </TabPanel>
      </TabView>
      <ProfileNotCompleteTable
        v-if='activeIndex === 0'
        :organization-id='organizationId'/>
      <ContractExpire
        v-if='activeIndex === 1'
        :organization-id='organizationId'/>
      <CertificatesExpire
        v-if='activeIndex === 2'
        :organization-id='organizationId'/>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CertificatesExpire from '@/apps/hrm/views/dashboard/component/CertificatesExpire.vue';
import ContractExpire from '@/apps/hrm/views/dashboard/component/ContractExpire.vue';
import ProfileNotCompleteTable from '@/apps/hrm/views/dashboard/component/ProfileNotCompleteTable.vue';

defineProps<{
  organizationId?: string | null;
}>();
const emits = defineEmits(['hide-dialog']);
const activeIndex = ref(0);

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};

const tabs = [
  { title: t('hrm.dashboard.profileNotComplete') },
  { title: t('hrm.dashboard.contractExpire') },
  { title: t('hrm.dashboard.dueReappointment') },
  { title: t('hrm.dashboard.degreesCertificates') },
  { title: t('hrm.dashboard.maternityLeave') },
];

</script>

<style scoped>

:deep(.p-tabview-panels) {
  padding: unset;
}
</style>