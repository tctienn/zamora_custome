<template>
  <OverlayPanel ref='op'>
    <div class='flex flex-column gap-2'>
      <div class='font-bold text-lg'>{{ t('document.docHelper.groupColor') }}</div>
      <div class='flex flex-column gap-1 pl-2'>
        <div class='flex gap-2'>
          <div class='bg-blue-500 h-1rem w-1rem'></div>
          {{ t('document.docHelper.unread') }}
        </div>
        <div class='flex gap-2'>
          <div class='bg-red-500 h-1rem w-1rem'></div>
          {{ t('document.docHelper.expired') }}
        </div>
      </div>
      <div class='font-bold text-lg'>{{ t('document.docHelper.groupIcon') }}</div>
      <div class='flex flex-column gap-1 pl-2'>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='reply'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.returned') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='rotate_left'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.revoked') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='group'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.coProcess') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'><i class='pi pi-flag'></i></div>
          {{ t('document.docHelper.hasDeadline') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-yellow-500'
              name='label_important'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.secret') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-orange-500'
              name='label_important'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.topSecret') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-red-500'
              name='label_important'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.confidential') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-yellow-500'
              name='error'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.express') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-orange-500'
              name='error'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.urgent') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              class='text-red-500'
              name='error'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.veryUrgent') }}
        </div>
      </div>
    </div>

  </OverlayPanel>
</template>

<script lang='ts' setup>
import type OverlayPanel from 'primevue/overlaypanel';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';

const { t } = useI18n();
const op = ref<InstanceType<typeof OverlayPanel>>();

function toggle(event: Event) {
  op.value?.toggle(event);
}

defineExpose({ toggle });
</script>

<style scoped>

</style>
