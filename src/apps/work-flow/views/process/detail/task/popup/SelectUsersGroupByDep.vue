<template>
  <SelectTreeAdministration
    v-if='orgType==OrganizationType.ADMINISTRATIVE'
    :multiple='multiple'
    :node='node'
    :users='users'
    v-bind='$attrs'>
  </SelectTreeAdministration>
  <SelectTreePartyUnion
    v-else
    :multiple='multiple'
    :node='node'
    :org-type='orgType'
    :users='users'
    v-bind='$attrs'>
  </SelectTreePartyUnion>
  <!--  <UserSelectFromNode-->
  <!--    :multiple='true'-->
  <!--    :node='node as BasicNode'-->
  <!--    :selection-mode="'tree'"-->
  <!--    :users='users'-->
  <!--    v-bind='$attrs'>-->
  <!--  </UserSelectFromNode>-->
  <div class='flex'>
    <!--    <UserSelectMoreDetail-->
    <!--      v-model='ids'-->
    <!--      :display-mode='"tree"'-->
    <!--      v-bind='$attrs'-->
    <!--      :org-type='OrganizationType.PARTY'-->
    <!--      remove-empty-dep-->
    <!--      :selection-mode="'multiple'"-->
    <!--      :users='users'>-->
    <!--    </UserSelectMoreDetail>-->
    <!--    <UserSelectFromTreeTable-->
    <!--      v-model='ids'-->
    <!--      :display-mode='"tree"'-->
    <!--      :org-type='OrganizationType.ADMINISTRATIVE'-->
    <!--      :selection-mode="'multiple'"-->
    <!--      user-id-only-->
    <!--      :users='users'-->
    <!--      v-bind='$attrs'>-->
    <!--    </UserSelectFromTreeTable>-->
    <!--    <ReceiveListUser-->
    <!--      v-model='ids'>-->
    <!--    </ReceiveListUser>-->
  </div>
</template>

<script lang="ts" setup>

import { type PropType, ref } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { OrganizationType } from '@/apps/document/model/organization';
import { type BasicNodeData, type NodeInputInterface } from '@/apps/work-flow/model/flow';
import SelectTreeAdministration from '@/apps/work-flow/views/process/detail/task/popup/SelectTreeAdministration.vue';
import SelectTreePartyUnion from '@/apps/work-flow/views/process/detail/task/popup/SelectTreePartyUnion.vue';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => []
  },
  groupedBy: {
    type: String as PropType<'department' | 'position' | undefined>,
    default: 'department'
  },
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined
  }
});
// const ids = ref<UserDepRole[]>( [ {
//   'userId': '6551fead88191b52ae2a4837',
//   'roleId': [],
//   'userName': 'Nguyễn Tú Em',
//   'id': '6551fead88191b52ae2a4837'
// }, {
//   'userId': '668648af98c2ca7d26604175',
//   'roleId': [ 'ADMIN' ],
//   'userName': 'Bùi Xuân Hiền1',
//   'id': '668648af98c2ca7d26604175'
// }, {
//   'userName': 'Cấp 1',
//   'id': 'org_CAP1'
// }, {
//   'orgId': 'root',
//   'id': 'org_root'
// } ]);
const mapIdName = ref();
const ids = ref<string[]>([]);
const orgType = ref<OrganizationType>((props.node?.data as BasicNodeData).orgType);
</script>

<style scoped>

</style>