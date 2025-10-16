<template>
  <div class='h-full'>
    <div
      class='grid h-full p-1'>
      <div class='border-right-1 col-3 h-full'>
        <Tree
          v-model:expanded-keys='expandedKeys'
          v-model:selection-keys='selectionKeys'
          filter
          filter-by='name'
          highlight-on-select
          :pt="{
            root:{
              class:'h-full',
              style:{
                border:'none'
              }
            },
            wrapper:{
              style:{
                height:'calc(100% - 1.2rem)'
              }
            }
          }"
          selection-mode='single'
          :value='orgTree'
          @node-select='nodeSelect'>
          <template #default='{node}'>
            <span
              :class="[{'font-semibold':!node?.parentCode},]">
              {{ node?.name }}
            </span>
          </template>
        </Tree>
      </div>
      <div class='col'>
        <WorkManager
          ref='workManagerRef'
          v-model:search-date='searchDate'
          v-model:view-type='viewType'>
          <template #header>
            <div></div>
          </template>
          <template
            v-if='!selectedDeptId || !allowDept[selectedDeptId]'
            #body>
            <span class='flex font-semibold justify-content-center text-xl w-full'>
              Không có quyền xem công việc của phòng ban này
            </span>
          </template>
        </WorkManager>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { findFirstPermissionByUserId } from '@/apps/work/api/graphql/permission-api';
import WorkManager from '@/apps/work/views/task/manager/TaskManager.vue';
import type { ViewType } from '@/apps/work/views/task/manager/type';
import { associateWith } from '@/common/helpers/extension/array.extension';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  selectedDept: {
    type: Array as PropType<string[]>,
    default: () => []
  }
});
const viewType = defineModel<ViewType>('viewType', { default: 'list' });
const searchDate = defineModel<Date>('searchDate', { default: new Date() });

const { user } = storeToRefs(useUserStore());

const selectionKeys = ref<TreeSelectionKeys>();
watch(() => props.selectedDept, deptIds => {
  selectionKeys.value = associateWith(deptIds, item => true);
}, { immediate: true });
const { result: orgResult } = getAllOrganizationPublicGraphql();

const expandedKeys = ref<TreeExpandedKeys>({});
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

const { result: permissionResult, load: permissionLoad, refetch: permissionRefetch } = findFirstPermissionByUserId('');
if (user.value.id) {
  permissionLoad(null, { userId: user.value.id });
}
const allowDept = computed(() => {
  return associateWith(permissionResult.value?.findFirstByUserId?.deptIds || [], () => true);
});
const workManagerRef = ref<InstanceType<typeof WorkManager> | null>(null);

//Change searchInput inplace
const selectedDeptCode = ref<string>();
const selectedDeptId = ref<string>();

function nodeSelect(node: TreeNode) {
  selectedDeptCode.value = node?.code;
  selectedDeptId.value = node?.key;
  if (selectedDeptCode.value && node?.key && allowDept.value[node?.key]) {
    workManagerRef.value?.updateSearchInput(oldValue => {
      oldValue.deptCode = node?.code;
    });
  }
}
</script>

<style scoped>

</style>