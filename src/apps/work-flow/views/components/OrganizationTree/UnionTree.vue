<template>
  <PartyTree
    v-bind='$attrs'
    v-model='orgIds'
    :org-type='orgType'
    :selection-mode='selectionMode'>
  </PartyTree>
</template>

<script lang="ts" setup>

import type { PropType } from 'vue';

import type { OrganizationType } from '@/apps/document/model/organization';
import PartyTree from '@/apps/work-flow/views/components/OrganizationTree/PartyTree.vue';

const props = defineProps({
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox'>,
    default: 'single'
  }
});
const orgIds = defineModel<string[]>({ default: [] });
</script>

<style scoped>

</style>