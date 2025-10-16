<template>
  <component
    :is='getComponent'
    v-model='orgIds'
    :max-width-chip='maxWidthChip'
    :org-type='orgType'
    :selection-mode='selectionMode'
    v-bind='mergedProps'>
  </component>
</template>

<script lang="ts" setup>

import { type Component, computed, type PropType, ref, shallowRef, useAttrs, watch } from 'vue';

import { OrganizationType } from '@/apps/document/model/organization';
import AdministrationTree from '@/apps/work-flow/views/components/OrganizationTree/AdministrationTree.vue';
import PartyTree from '@/apps/work-flow/views/components/OrganizationTree/PartyTree.vue';
import UnionTree from '@/apps/work-flow/views/components/OrganizationTree/UnionTree.vue';

const props = defineProps({
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox'>,
    default: 'single'
  },
  maxWidthChip: {
    type: String,
    default: '200px'
  }
});
const orgIds = defineModel<string[]>({ default: [] });
const getComponent = shallowRef<Component>();
const attrs = useAttrs();
const getComponentProps = ref<object>({ 'v-model': orgIds });
const mergedProps = computed(() => ({
  ...getComponentProps.value,
  ...attrs,
}));

chooseComponent(props.orgType);
watch(() => props.orgType, (value) => {
  orgIds.value = [];
  chooseComponent(value);
});

function chooseComponent(orgType: OrganizationType) {
  switch (orgType) {
  case OrganizationType.ADMINISTRATIVE:
    getComponent.value = AdministrationTree;
    break;
  case OrganizationType.PARTY:
    getComponent.value = PartyTree;
    break;
  case OrganizationType.UNION:
    getComponent.value = UnionTree;
    break;
  }
}
</script>

<style scoped>

</style>