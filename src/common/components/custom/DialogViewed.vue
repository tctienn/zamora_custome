<template>
  <Dialog
    v-model:visible='localVisible'
    :dismissable-mask='true'
    :header="t('media.common.table.seen')"
    modal
    style='width: 600px; max-height: 600px; overflow: auto;'>
    <div
      v-for='(item, idx) in listViewed'
      :key='idx'
      class='flex flex-row justify-content-between mb-2'>
      <AppUser
        avatar-size='3'
        info-visible
        :infos='["positionName", "departments"]'
        name-visible
        :user-id='item.userId'/>
      <small>{{formatDate(item.createdAt)}}</small>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Viewed } from '@/apps/media/model/media';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps<{ listViewed: Viewed[], visible: boolean }>();

const emit = defineEmits(['update:visible']);

const localVisible = ref(props.visible);

watch(() => props.visible, (newVal) => {
  localVisible.value = newVal;
});

watch(localVisible, (newVal) => {
  emit('update:visible', newVal);
});

const { t } = useI18n();
</script>

<style scoped>

</style>