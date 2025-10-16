<template>
  <div
    v-if='isTreeMode'
    v-bind='$attrs'>
    <UserSelectFromNodeTreePopup
      v-model='selectedKeys'
      v-model:map-id-name='mapIdName'
      :org-type='orgType'
      :placeholder="'Choose user'"
      :remove-empty-dep='removeEmptyDep'
      :selection-mode='selectionModeComputed'
      style='height: 64vh'
      :user-ids='userIds'
      :users='users'>
    </UserSelectFromNodeTreePopup>
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
import { isEqual } from 'lodash';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { OrganizationType } from '@/apps/document/model/organization';
import UserSelectFromNodeList from '@/apps/work-flow/views/components/UserSelectFromNode/UserSelectFromNodeList.vue';
import UserSelectFromNodeTreePopup
  from '@/apps/work-flow/views/components/UserSelectFromNodePopup/UserSelectFromNodeTreePopup.vue';
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
  }
});

const emits = defineEmits(['select-option']);
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
const selectedKeys = defineModel<Record<string, true> | CheckStatus>('selectedKeys', { default: {} });
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

</script>

<style scoped>
/* Add your styles here */
</style>
