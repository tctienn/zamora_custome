<template>
  <div
    class='flex flex-column gap-2'>
    <div class='font-semibold text-lg'>{{ t("Chuyển tới:") }} {{ userSelectNextResponse?.node?.data?.label }}</div>
    <div class='align-items-center flex gap-2'>
      <div>
        <Checkbox
          v-model='isSuggest'
          binary>
        </Checkbox>
      </div>
      {{ t("Gợi ý theo nội dung văn bản") }}
    </div>

    <div
      class='flex flex-row gap-3'>
      <div
        class='border-1 border-round surface-border w-full'>
        <UserSelectNextSuggestMode
          v-if="selectionMode=='suggestions'"
          v-model:chosen-user-dept-role='chosenUserDeptRole'
          :org-map='allOrgMap'
          :org-user-map='orgUserMap'
          style='height: calc(100vh - 26rem);'
          :user-select-next='userSelectNext'>
        </UserSelectNextSuggestMode>

        <CommonTree
          v-else
          v-model:chosen-user-dept-role='chosenUserDeptRole'
          selection-mode='multiple'
          :should-show-checkbox='shouldShowCheckbox'
          style='height: calc(100vh - 26rem);'
          :tree-options='treeNodeFiltered'/>
      </div>
      <ReceiveListUserDept
        v-model:chosen-user-dept-role='chosenUserDeptRole'
        class='w-full'
        :hide-receive-to-know='hideReceiveToKnow'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import { isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useOrganizationByType } from '@/apps/document/helpers/composable/handle-organization-type';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { UserSelectNext, UserSelectNextResponse } from '@/apps/document/model/userNextAction';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import {
  type DataNode,
  type SelectionMode,
  transformChosenUserDeptRole
} from '@/apps/document/views/doc/component/user-select-next/process-data';
import UserSelectNextSuggestMode
  from '@/apps/document/views/doc/component/user-select-next/UserSelectNextSuggestMode.vue';
import ReceiveListUserDept from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUserDept.vue';
import CommonTree from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/CommonTree.vue';
import { associateBy } from '@/common/helpers/extension/array.extension';
import { filterTreeNodes } from '@/common/helpers/tree-node-utils';

const props = defineProps({
  userSelectNextResponse: {
    type: Object as PropType<UserSelectNextResponse>,
    default: () => ({})
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
  showUsersFromDifferentDept: {
    type: Boolean,
    default: true
  },
  hideReceiveToKnow: {
    type: Boolean,
    default: false
  },
});

const dataNode = defineModel<DataNode>({
  default: {
    node: {},
    edge: {}
  }
});
const selectionMode = defineModel<SelectionMode>('selectionMode', { default: 'tree' });
const isSuggest = computed({
  get: () => selectionMode.value == 'suggestions',
  set: (val) => {
    selectionMode.value = val ? 'suggestions' : 'tree';
  }
});

const { t } = useI18n();

const chosenUserDeptRole = ref<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>([]);
//Auto select when only one option
watch(() => props.userSelectNextResponse, (value) => {
  const listUserDeptRole = value?.usersSelectNext;
  if (listUserDeptRole.length == 1) {
    const first = listUserDeptRole[0];
    let id = '';
    if (!isEmpty(first.userId)) {
      id = `${first.userId}_${first.roleId}`;
    } else if (!isEmpty(first.deptId)) {
      id = `org_${first.deptId}`;
    }

    chosenUserDeptRole.value = [{
      userId: first.userId,
      userName: first.userName,
      deptId: first.deptId,
      deptName: first.deptName,
      roleId: first.roleId,
      roleName: first.roleName,
      action: 'main',
      type: first.type,
      id: id
    }];
  }
}, {
  once: true,
  immediate: true
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

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const userSelectNext = computed(() => props.userSelectNextResponse?.usersSelectNext || []);
const userSelectNextMap = computed<Record<string, UserSelectNext>>(() => {
  return associateBy(userSelectNext.value, item => {
    if (item.userId) {
      return 'user_' + item.userId;
    } else {
      return 'dept_' + item.deptId;
    }
  });
});

function skipUser(user: UserSelectNext): boolean {
  if (props.showUsersFromDifferentDept) {
    return false;
  }
  return user.isClericalCharged || user.deptId !== userDeptRole.value.deptId;
}

const {
  treeNode,
  orgUserMap,
  allOrgMap,
  allOrg
} = useOrganizationByType(userDeptRole.value.type, toRef(userSelectNext), skipUser);
const treeNodeFiltered = computed(() => {
  return filterTreeNodes(treeNode.value, node => {
    if (node.data?.type == 'user') {
      return true;
    } else {
      return !!(node.data?.type == 'dept' && userSelectNextMap.value['dept_' + node.data?.id || '']);
    }
  });
});
</script>

<style scoped>

</style>