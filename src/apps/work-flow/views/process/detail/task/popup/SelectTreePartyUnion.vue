<template>
  <div class='p-3 p-tree-filter-container pb-0 relative'>
    <InputText
      v-model='searchTerm'
      class='p-component p-inputtext p-tree-filter pr-5'/>
    <span
      class='absolute pi pi-search'
      style='right:1.5rem;top:2rem'></span>
  </div>
  <Tree
    v-model:selection-keys='selectedKeys'
    class='border-none'
    :selection-mode='multiple?`checkbox`:`single`'
    :value='filteredTreeNodes'
    v-bind='$attrs'>
    <template #default='{node:nodeData}'>
      <div v-if='nodeData?.data?.__typename=="UserOrganizationData"'>
        <AppUser
          avatar-size='3'
          info-visible
          :infos='["email", "positionName"]'
          name-visible
          :user-id='nodeData?.key'/>
      </div>
      <div
        v-else
        class='font-semibold'>
        {{ nodeData.label }}
      </div>
    </template>
  </Tree>
</template>

<script lang="ts" setup>
import { get, groupBy } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import type { OrganizationType } from '@/apps/document/model/organization';
import type { BasicNodeData, NodeInputInterface, OrgRole } from '@/apps/work-flow/model/flow';
import { filterTreeNodes } from '@/common/helpers/tree-node-utils';
import { listToTree, normalizeString } from '@/common/helpers/utils';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
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
    type: String as PropType<OrganizationType>,
    required: true
  }
});
const { t } = useI18n();
const organizationOptions = computed(() => {
  return filterTreeNodes(partyRootNode.value || [], node => (node?.children?.length || -1) < 0 && node.data?.__typename === 'UserOrganizationData');
});
const selectedKeys = ref();
const { onResult: orgOnResult, refetch: orgRefetch, result: result } = getAllOrg();
watch(() => selectedKeys.value, (selected) => {
  selectUserIds.value = new Set(Object.keys(selected).filter(key => !key.startsWith('org_')));
});
const selectUserIds: Ref<Set<string>> = inject('selectUserIds', {} as Ref<Set<string>>);
const searchTerm = ref<string>('');
const filteredTreeNodes = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return filterTreeNodes(organizationOptions.value || [], (node) => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(node.label || '');
    return normalizedLabel.includes(normalizedSearchTerm);
  }
  );
});
const partyRootNode = ref<TreeNode[]>();

orgOnResult(allOrgResult => {
  const allOrg = get(allOrgResult, 'data.getAll', []);
  const groupByTypeAllOrg: Record<string, any[]> = groupBy(allOrg, (value) => value.type);
  const data = props.node?.data as BasicNodeData;
  const orgRoles: OrgRole[] = data?.options?.orgRoles || [];
  const result: { [orgCode: string]: TreeNode[] } = {};
  getAllUserOrganization().onResult((param1) => {
    const listUser = get(param1, 'data.getAllUserOrganization', []);
    listUser.forEach((user: any) => {
      if (isExistOrgId(user.organizationId, orgRoles) && getRolesByOrgId(user.organizationId, orgRoles).includes(user.role)) {
        const userNode: TreeNode = {
          key: user.userId,
          label: usersMoreInfo?.[user.userId]?.fullName,
          data: user
        };
        result[user.organizationId] = [...result[user.organizationId] || [], userNode];
      }
    });

    partyRootNode.value = listToTree(groupByTypeAllOrg?.[props.orgType]?.map((organization) => ({
      key: 'org_' + organization.id,
      label: organization.name,
      data: organization,
      parentId: 'org_' + organization.parentId,
      children: result[organization.id]
    })) || [], {
      id: 'key',
      parentId: 'parentId',
      children: 'children'
    });
  });
});

function getRolesByOrgId(orgId: string, orgRoles: OrgRole[]): string[] {
  return orgRoles.find(e => e.orgId == orgId)?.roles || [];
}

function isExistOrgId(orgId: string, orgRoles: OrgRole[]): boolean {
  return orgRoles.findIndex(e => e.orgId == orgId) >= 0;
}

const { usersMoreInfo } = useUserMoreInfoStore();

</script>

<style scoped>

</style>