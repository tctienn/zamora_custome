<template>
  <div
    v-if='isTreeMode'
    v-bind='$attrs'>
    <UserSelectFromNodeTree
      v-model='selectedUserIdsTree'
      :org-type='orgType'
      :placeholder='placeholder'
      :selection-mode='selectionMode'
      :users='users'>
    </UserSelectFromNodeTree>
  </div>
  <div
    v-else
    v-bind='$attrs'>
    <UserSelectFromNodeList
      v-model='selectedUserIds'
      :is-multiple="selectionMode != 'checkbox'"
      :users='users'>
    </UserSelectFromNodeList>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { OrganizationType } from '@/apps/document/model/organization';
import UserSelectFromNodeList from '@/apps/work-flow/views/components/UserSelectFromNode/UserSelectFromNodeList.vue';
import UserSelectFromNodeTree from '@/apps/work-flow/views/components/UserSelectFromNode/UserSelectFromNodeTree.vue';

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
  placeholder: {
    type: String,
    default: ''
  }
});
const isTreeMode = computed(() => props.displayMode === 'tree');

const userIds = defineModel<string[]>({ default: [] });
const selectedUserIds = ref(initSelectedUserIds());
const selectedUserIdsTree = ref(initSelectedUserIdsTree());
const userFiltered = computed(() => {
  return props.users;
});

watch(selectedUserIds, (value) => {
  if (!isTreeMode.value) {
    userIds.value = Array.isArray(value) ? value.map((e: UserMoreInfo) => e?.id) : [value?.id];
  }
});
watch(selectedUserIdsTree, (value) => {
  // userIds.value = Array.from(new Set(Object.keys(value).filter(key => !key.startsWith('org_'))));
  userIds.value = Array.from(new Set(Object.keys(value)));
});

function initSelectedUserIds() {
  const mapIdToUser: Record<string, UserMoreInfo> = Object.fromEntries(
    props.users.map(user => [user.id, user])
  );
  if (!isTreeMode.value) {
    if (props.selectionMode != 'checkbox') {
      return userIds.value.map(e => mapIdToUser[e]);
    } else {
      return mapIdToUser[userIds.value[0]];
    }
  } else {
    return [];
  }
}

function initSelectedUserIdsTree() {
  const rs: Record<string, true> = {};
  userIds.value.forEach(e => {
    rs[e] = true;
  });
  return rs;

}

const { t } = useI18n();

</script>

<style scoped>
/* Add your styles here */
</style>
