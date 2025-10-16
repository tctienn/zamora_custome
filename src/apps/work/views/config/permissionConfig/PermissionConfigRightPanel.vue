<template>
  <div class='h-full'>
    <div class='flex flex-column gap-2 h-full'>
      <Toolbar class='align-content-center border-round-sm h-3rem mb-2 px-2 py-0 surface-0'>
        <template #start>
          <div class='align-items-center flex gap-2'>
            <div class='font-bold'>
              {{ header || 'Phòng ban' }}
            </div>
          </div>
        </template>
        <template #end>
          <div class='align-items-center btn-group-toolbar flex gap-1 h-3rem mr-1 my-1'>
            <Button
              class='btn-create focus:shadow-none font-medium p-2'
              icon='pi pi-check'
              :label="t('common.save')"
              @click='savePermission'></Button>

          </div>
        </template>
      </Toolbar>
      <div
        class='border-round-sm h-full overflow-auto'>
        <Tree
          v-model:expanded-keys='expandedKeys'
          v-model:selection-keys='selectionKeys'
          :pt="{
            root:{
              class:'h-full border-round-sm'
            },
            wrapper:{
              class:'h-full'
            }
          }"
          selection-mode='multiple'
          :value='orgTree'>
          <template #default='{node}'>
            {{ node?.name }}
          </template>
        </Tree>
      </div>

    </div>
  </div>

</template>

<script lang="ts" setup>
import type { TreeExpandedKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { associateWith } from '@/common/helpers/extension/array.extension';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  header: {
    type: String,
    default: undefined
  },
  selectedDept: {
    type: Array as PropType<string[]>,
    default: ()=>[]
  }
});
const emits = defineEmits<{
  (e: 'save', deptIds: string[]): void
}>();

const { t } = useI18n();
const { result: orgResult } = getAllOrganizationPublicGraphql();

const orgTree = computed<TreeNode[]>(() => {
  return listToTree(
    orgResult.value?.allOrganizationPublic?.map((e: OrganizationInterface) => ({
      ...e,
      key: e.id,
      children: []
    })) || [], {
      id: 'code',
      parentId: 'parentCode',
      children: 'children'
    }
  );
});

watch(orgTree, () => {
  orgTree.value.forEach(node => {
    if (node.key) {
      expandedKeys.value[node.key] = true;
    }
    node?.children?.forEach(child => {
      if (child.key) {
        expandedKeys.value[child.key] = true;
      }
    });
  });
}, { once: true });
const selectionKeys = ref();
watch(()=>props.selectedDept, deptIds=>{
  selectionKeys.value = associateWith(deptIds, item => true);
}, { immediate: true });

const expandedKeys = ref<TreeExpandedKeys>({});

function savePermission() {
  emits('save', Object.keys(selectionKeys.value));
}
</script>

<style scoped>

</style>