<template>
  <div class='flex flex-row gap-3'>
    <template
      v-if='isTreeMode'>
      <UserSelectFromTreeTableTree
        v-model='selectedKeys'
        v-model:chosen-user-dept-role='chosenUserDeptRole'
        class='border-1 border-round surface-border'
        :node='node'
        :org-type='orgType'
        :placeholder="'Choose user'"
        :remove-empty-dep='removeEmptyDep'
        :selection-mode='selectionModeComputed'
        :should-show-checkbox='shouldShowCheckbox'
        :show-users-from-different-dept='showUsersFromDifferentDept'
        style='width:90%'
        :user-ids='userIds'
        :users='users'>
      </UserSelectFromTreeTableTree>
    </template>
    <template
      v-else>
      <UserSelectFromNodeList
        v-model='selectedUserIds'
        :is-multiple='selectionModeComputed!="single"'
        :users='users'>
      </UserSelectFromNodeList>
    </template>
    <ReceiveListUserDept
      v-model:chosen-user-dept-role='chosenUserDeptRole'
      class='w-full'
      :hide-receive-to-know='hideReceiveToKnow'/>
  </div>
</template>

<script lang="ts" setup>
import { isEqual } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableSelectionKeys } from 'primevue/treetable';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import ReceiveListUserDept from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUserDept.vue';
import UserSelectFromNodeList from '@/apps/work-flow/views/components/UserSelectFromNode/UserSelectFromNodeList.vue';
import UserSelectFromTreeTableTree
  from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/UserSelectFromTreeTableTree.vue';
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
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined,
  },
  orgType: {
    type: String as PropType<OrganizationType | undefined>,
    default: undefined,
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
  showUsersFromDifferentDept: {
    type: Boolean,
    default: false
  },
  hideReceiveToKnow: {
    type: Boolean,
    default: false
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
});
const emits = defineEmits(['select-option']);
defineModel<Record<string, {
  action: 'main' | 'cooperative' | 'receiveToKnow'
} & UserDeptRoleInput>>('userAction', { default: {} });
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

const userIds = defineModel<string[]>({ default: [] });
const mapIdName = defineModel<Record<string, string>>('mapIdName', { default: {} });
const selectedUserIds = ref(initSelectedUserIds(userIds.value));
const selectedKeys = defineModel<TreeTableSelectionKeys>('selectedKeys', { default: {} });
selectedKeys.value = initSelectedUserIdsTree(userIds.value);
// const selectedUserIdsTree = ref(initSelectedUserIdsTree(userIds.value));
watch(selectedUserIds, (value) => {
  if (!isTreeMode.value) {
    userIds.value = Array.isArray(value) ? value.map((e: UserMoreInfo) => e?.id) : [value?.id];
  }
});

watch(selectedKeys, (value, oldValue) => {
  if (!isEqual(value, oldValue)) {
    if (props.userIdOnly) {
      userIds.value = Array.from(new Set(Object.keys(value).filter(key => !key.startsWith('org_'))));
    } else {
      userIds.value = Array.from(new Set(Object.keys(value)));
    }
  }
});

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

function initSelectedUserIdsTree(userIds: string[]) {
  if (selectionModeComputed.value != 'checkbox') {
    const rs: Record<string, true> = {};
    userIds.forEach(e => {
      rs[e] = true;
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

watch(mapIdName, (value) => {
  emits('select-option', value);
});

const { t } = useI18n();

const chosenUserDeptRole = defineModel<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>('chosenUserDeptRole', { default: [] });
</script>

<style scoped>
/* Add your styles here */
</style>
