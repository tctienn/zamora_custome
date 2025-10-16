<template>
  <div
    v-if='isTreeMode'
    v-bind='$attrs'>
    <UserSelectMoreDetailTree
      v-model:user-ids='userIds'
      v-model:value-search='valueSearch'
      :is-hide-search='props.isHideSearch'
      :org-type='orgType'
      :remove-empty-dep='removeEmptyDep'
      :selection-mode='selectionModeComputed'
      :should-show-checkbox='shouldShowCheckbox'
      :user-id-only='userIdOnly'
      :users='users'
      @node-select='handleNodeSelect'
      @node-unselect='handleNodeUnselect'>
    </UserSelectMoreDetailTree>
  </div>
  <div
    v-else
    v-bind='$attrs'>
    <UserSelectFromNodeList
      v-model='selectedUserIds'
      :is-multiple='selectionModeComputed!="single"'
      :users='users'>
    </UserSelectFromNodeList>
  </div>
</template>

<script lang="ts" setup>
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import UserSelectFromNodeList from '@/apps/work-flow/views/components/UserSelectFromNode/UserSelectFromNodeList.vue';
import { extractTreeNode } from '@/apps/work-flow/views/components/UserSelectMoreDetail/index';
import UserSelectMoreDetailTree
  from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetailTree.vue';
import { type CheckStatus } from '@/common/helpers/tree-node-utils';

const props = defineProps({
  displayMode: {
    type: String as PropType<'list' | 'tree'>,
    default: 'list',
  },
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  // node: {
  //   type: Object as PropType<BasicNode>,
  //   default: undefined,
  // },
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => [],
  },
  userIdOnly: {
    type: Boolean,
    default: false
  },
  removeEmptyDep: {
    type: Boolean,
    default: false
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
  isHideSearch: {
    type: Boolean,
    default: false
  }
});
const isTreeMode = computed(() => props.displayMode === 'tree');
const selectionModeComputed = computed(() => {
  if (props.selectionMode) {
    return props.selectionMode;
  } else {
    return 'single';
    // if (props.node?.data.selectionOption === SelectionOption.MULTIPLE) {
    //   return 'multiple';
    // } else {
    //   return 'single';
    // }
  }
});
const valueSearch = defineModel<string>('valueSearch', { default: '' });
const userIds = defineModel<Array<UserDeptRoleInput & { id: string }>>({ default: [] });
const selectedUserIds = ref([]);
const selectedKeys = defineModel<Record<string, true> | CheckStatus>('selectedKeys', { default: {} });
selectedKeys.value = initSelectedUserIdsTree(userIds.value);
// const selectedUserIdsTree = ref(initSelectedUserIdsTree(userIds.value));
// watch(selectedUserIds, (value) => {
//   if (!isTreeMode.value) {
//     userIds.value = Array.isArray(value) ? value.map((e: UserMoreInfo) => e?.id) : [value?.id];
//   }
// });
//

function handleNodeSelect(node: TreeNode) {
  if (props.userIdOnly) {
    if (!node?.key?.startsWith('org_')) {
      userIds.value = [...userIds.value || [], extractTreeNode(node)];
    }
  } else {
    userIds.value = [...userIds.value || [], extractTreeNode(node)];
  }

}

function handleNodeUnselect(node: TreeNode) {
  userIds.value = userIds.value.filter(e => e.id != extractTreeNode(node).id);
}

const mapIdToUser: Record<string, UserMoreInfo> = Object.fromEntries(
  props.users.map(user => [user.id, user])
);

function initSelectedUserIds(userIds: string[]) {
  if (!isTreeMode.value) {
    if (selectionModeComputed.value !== 'single') {
      return userIds.map(e => mapIdToUser[e]);
    } else {
      return mapIdToUser[userIds[0]];
    }
  } else {
    return [];
  }
}

function initSelectedUserIdsTree(userIds: Array<UserDeptRoleInput & { id?: string }>) {
  if (selectionModeComputed.value != 'checkbox') {
    const rs: Record<string, true> = {};
    userIds.forEach(e => {
      rs[e.id || ''] = true;
    });
    return rs;
  } else {
    const rs: CheckStatus = {};
    //
    // return rebuildOrgTree(userIds,)
    // userIds.forEach(e => {
    //   rs[e] = {
    //     checked: false,
    //     partialChecked: true
    //   };
    // });
    return rs;
  }

}

// watch(userIds, (value) => {
//   selectedUserIds.value = initSelectedUserIds(value);
//   selectedUserIdsTree.value = initSelectedUserIdsTree(value);
// }, { immediate: true });

const { t } = useI18n();

</script>

<style scoped>
</style>
