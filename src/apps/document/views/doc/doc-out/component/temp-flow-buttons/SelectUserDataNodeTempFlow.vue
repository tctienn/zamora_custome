<template>
  <div class='flex flex-column gap-2'>
    <div class='font-semibold text-lg'>Chuyển tới: {{ dataNode?.node?.data?.label }}</div>
    <div class='flex flex-row gap-3'>
      <div class='border-1 border-round surface-border w-6'>
        <CommonTree
          v-model:chosen-user-dept-role='chosenUserDeptRole'
          selection-mode='multiple'
          :should-show-checkbox='shouldShowCheckbox'
          :tree-options='orgUserOptions'></CommonTree>
      </div>
      <ReceiveListUserDept
        v-model:chosen-user-dept-role='chosenUserDeptRole'
        class='w-6'
        hide-receive-to-know/>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, toRef, watch } from 'vue';

import { useOrganizationByType } from '@/apps/document/helpers/composable/handle-organization-type';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import {
  type DataNode,
  transformChosenUserDeptRole
} from '@/apps/document/views/doc/component/user-select-next/process-data';
import ReceiveListUserDept from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUserDept.vue';
import CommonTree from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/CommonTree.vue';
import { filterTreeNodes } from '@/common/helpers/tree-node-utils';

const props = defineProps({
  options: {
    type: Array as PropType<UserDeptRoleInput[]>,
    default: () => []
  }
});
const chosenUserDeptRole = ref<(UserDeptRoleInput & {
  id: string;
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined;
})[]>([]);
const dataNode = defineModel<DataNode>({
  default: {
    node: {},
    edge: {}
  }
});
watch(() => props.options, value => {
  if (value.length == 1) {
    const user = value[0];
    chosenUserDeptRole.value = [{
      userId: user.userId,
      userName: user.userName,
      deptId: user.deptId,
      deptName: user.deptName,
      roleId: user.roleId,
      roleName: user.roleName,
      action: 'main',
      type: user.type,
      id: `${user.userId}_${user.roleId}`
    }];
  }
}, {
  immediate: true,
  once: true
});

watch(chosenUserDeptRole, value => {
  dataNode.value = {
    ...dataNode.value,
    processes: transformChosenUserDeptRole(value)
  };
}, {
  deep: true,
  immediate: true
});

function shouldShowCheckbox(node: TreeNode): boolean {
  return !(node.data?.__typename === 'Organization');
}

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const { treeNode } = useOrganizationByType(userDeptRole.value.type, toRef(props.options));
const orgFilteredIds = computed(() => {
  const rs: string[] = [];
  props.options.forEach(e => {
    if (!e.userId) {
      rs.push(e.deptId);
    }
  });
  return rs;
});
const orgUserOptions = computed<TreeNode[]>(() => {
  return filterTreeNodes(treeNode.value, (node) => {
    return (
      node.data?.__typename !== 'Organization'
        || node.data?.__typename === 'Organization'
        && (orgFilteredIds.value.includes(node.data?.id)
            || node.children?.some((child) =>
              orgFilteredIds.value.includes(child.data?.id),
            ))
        || false
    );
  });
});
</script>

<style scoped>

</style>