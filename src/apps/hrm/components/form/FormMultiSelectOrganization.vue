<template>
  <FormInputWrapper
    v-bind='$props'>
    <input
      ref='input'
      :name='$props.name'
      type='hidden'
      :value='$props.modelValue'>
    <component
      :is='getComponent'
      v-model='orgIds'
      :max-width-chip='maxWidthChip'
      :org-type='orgType'
      :selection-mode='selectionMode'
      v-bind='mergedProps'>
    </component>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import { type Component, computed, type PropType, ref, shallowRef, useAttrs, watch } from 'vue';

import { OrganizationType } from '@/apps/document/model/organization';
import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';
import AdministrationTree from '@/apps/work-flow/views/components/OrganizationTree/AdministrationTree.vue';
import PartyTree from '@/apps/work-flow/views/components/OrganizationTree/PartyTree.vue';
import UnionTree from '@/apps/work-flow/views/components/OrganizationTree/UnionTree.vue';
import NamedMultiSelectUserOrganization from '@/common/components/custom/NamedMultiSelectEmployee.vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: undefined
  },
  bgHighlight: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
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

// eslint-disable-next-line vue/require-prop-types
// const model = defineModel();
//
// if (model.value === '') {
//   model.value = null;
// }

</script>

<style scoped>

</style>
