<template>
  <OverlayPanel ref='op'>
    <div class='flex flex-column gap-2'>
      <div class='font-bold text-lg'>{{ t('document.docHelper.groupColor') }}</div>
      <div class='flex flex-column gap-1 pl-2'>
        <div class='flex gap-2'>
          <div class='bg-blue-500 h-1rem w-1rem'></div>
          {{ t('document.docHelper.docSubmitUnread') }}
        </div>
      </div>
      <div class='font-bold text-lg'>{{ t('document.docHelper.groupIcon') }}</div>
      <div class='flex flex-column gap-1 pl-2'>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='rotate_left'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.docSubmitRevoked') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='reply'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.docSubmitRejected') }}
        </div>
        <div class='flex gap-2'>
          <div class='w-1rem'>
            <AppIcon
              name='group'
              size='1.2'/>
          </div>
          {{ t('document.docHelper.docSubmitCoProcess') }}
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
