<template>
  <TreeSelect
    v-model='selectedOrg'
    class='w-full'
    display='chip'
    v-bind='$attrs'
    :options='orgTree'
    :pt="{
      labelContainer: {
        style: 'width: 0vw',
      },
    }"
    :selection-mode='selectionMode'>
    <template
      v-if="selectionMode === 'checkbox'"
      #value='{ value, placeholder }'>
      <Chip
        v-for='node in computeLabelDepartment(value)'
        :key='node.key'
        class='mx-1'
        :label='node.label'>
        <span
          v-text-scroll='{maxWidth: maxWidthChip}'
          class='py-2'>
          {{ node.label }}
        </span>
      </Chip>
    </template>
  </TreeSelect>
</template>

<script lang="ts" setup>
import { get, groupBy, isEqual } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { type PropType, ref, watch } from 'vue';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import type { OrganizationType } from '@/apps/document/model/organization';
import { computeLabelDepartment, initSelectedOrg, } from '@/common/helpers/tree-node-utils';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true,
  },
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox'>,
    default: 'single',
  },
  maxWidthChip: {
    type: String,
    default: '200px'
  }
});

const selectedOrg = ref();
const orgIds = defineModel<string[]>({ default: [] });
watch(selectedOrg, (value) => {
  orgIds.value = Object.keys(value);
});
const allOrg = ref<OrganizationInterface[]>([]);
watch(orgIds, (value, oldValue) => {
  if (isEqual(value, oldValue)) {
    return;
  }
  selectedOrg.value = initSelectedOrg(
    props.selectionMode,
    orgIds.value,
    allOrg.value,
  );
});
const { onResult: orgOnResult, refetch: orgRefetch } = getAllOrg();
const orgTree = ref<TreeNode[]>([]);
orgOnResult((param) => {
  allOrg.value = get(param, 'data.getAll', []);
  const groupByTypeAllOrg: Record<string, any[]> = groupBy(
    allOrg.value,
    (value) => value.type,
  );
  orgTree.value = listToTree(
    groupByTypeAllOrg?.[props.orgType]?.map((organization) => ({
      key: organization.id,
      label: organization.name,
      data: organization,
      parentId: organization.parentId,
      children: [],
    })) || [],
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
  selectedOrg.value = initSelectedOrg(
    props.selectionMode,
    orgIds.value,
    allOrg.value,
  );
});
</script>

<style scoped></style>
