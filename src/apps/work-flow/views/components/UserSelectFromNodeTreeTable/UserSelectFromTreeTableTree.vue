<template>
  <div
    v-if='orgType==OrganizationType.ADMINISTRATIVE'>
    <AdministrativeTree
      v-model:chosen-user-dept-role='chosenUserDeptRole'
      :node='node'
      :org-type='orgType'
      :remove-empty-dep='removeEmptyDep'
      :should-show-checkbox='shouldShowCheckbox'
      :show-users-from-different-dept='showUsersFromDifferentDept'
      :users='users'>
    </AdministrativeTree>
  </div>
  <div v-else>
    <PartyUnionTree
      v-model:chosen-user-dept-role='chosenUserDeptRole'
      :node='node'
      :org-type='orgType'
      :remove-empty-dep='removeEmptyDep'
      :should-show-checkbox='shouldShowCheckbox'
      :show-users-from-different-dept='showUsersFromDifferentDept'
      :users='users'>
    </PartyUnionTree>
  </div>

</template>

<script lang="ts" setup>
import type { TreeNode } from 'primevue/treenode';
import { type PropType } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import AdministrativeTree
  from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/AdministrativeTree.vue';
import PartyUnionTree from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/PartyUnionTree.vue';

const props = defineProps({
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => []
  },
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined
  },
  orgType: {
    type: String as PropType<OrganizationType | undefined>,
    default: undefined
  },
  removeEmptyDep: {
    type: Boolean,
    default: false
  },
  showUsersFromDifferentDept: {
    type: Boolean,
    default: false
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
});

const chosenUserDeptRole = defineModel<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>('chosenUserDeptRole', { default: [] });

</script>

<style scoped>

</style>