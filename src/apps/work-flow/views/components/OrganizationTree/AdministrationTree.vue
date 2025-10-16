<template>
  <TreeSelect
    v-model='selectedOrg'
    class='w-full'
    display='chip'
    v-bind='$attrs'
    :options='organizationOptions'
    :pt="{
      labelContainer: {
        style: 'width: 0vw',
      },
    }"
    :selection-mode='selectionMode'>
    <template #value='{ value }'>
      <Chip
        v-for='node in computeLabelDepartment(value)'
        :key='node.id'
        class='mx-1'
        :label='node.label'
        removable
        @remove.stop='removeChip($event,node)'>
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
import { get, isEqual } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { OrganizationType } from '@/apps/document/model/organization';
import { computeLabelDepartment, getIdsFromChecked, initSelectedOrg, } from '@/common/helpers/tree-node-utils';
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

const { t } = useI18n();

const selectedOrg = ref();

const organizationOptions = ref<TreeNode[]>([]);
const allOrg = ref<OrganizationInterface[]>([]);
const orgIds = defineModel<string[]>({ default: [] });

getAllOrganizationGraphql().onResult((param) => {
  allOrg.value = get(param, 'data.allOrganizationPublic', []);
  organizationOptions.value = listToTree(
    allOrg.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      id: organization.code,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'id',
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

watch(selectedOrg, (value) => {
  if (props.selectionMode == 'checkbox') {
    orgIds.value = getIdsFromChecked(value);
  } else {
    orgIds.value = Object.keys(value);
  }
});

function removeChip(event: Event, data: TreeNode) {
  if (data.key) {
    delete selectedOrg.value[data.key];
  }
}
</script>

<style scoped></style>
