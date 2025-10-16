<template>
  <div class='grid grid-nogutter pb-3 px-0 surface-0'>
    <DecisionGridItem
      v-for='(item, idx) in decisions'
      :key='idx'
      :decision='item'
      :get-decision-types='getDecisionTypes'
      @view-detail='onViewDetail'
      @view-detail-file='onViewDetailFile'/>
  </div>
</template>

<script setup lang="ts">
import type { DecisionInterface } from '@/apps/hrm/model/decision';

import DecisionGridItem from './DecisionGridItem.vue';
defineProps<{ decisions: DecisionInterface[], getDecisionTypes: (type: string) => string | undefined }>();
const emit = defineEmits(['view-detail', 'view-detail-file']);
const onViewDetail = (data: DecisionInterface) => emit('view-detail', data);
const onViewDetailFile = (file: any) => emit('view-detail-file', file);

</script>
