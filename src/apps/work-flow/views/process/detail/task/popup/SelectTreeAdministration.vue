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
      <div v-if='nodeData?.data?.__typename=="UserMoreInfo"'>
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

<script lang='ts' setup>
import { get } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import type { BasicNodeData, NodeInputInterface, UserOption } from '@/apps/work-flow/model/flow';
import type { Work } from '@/apps/work-flow/model/process/work';
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
  groupedBy: {
    type: String as PropType<'department' | 'position' | undefined>,
    default: 'department'
  },
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined
  }
});
const { t } = useI18n();
const work: Ref<Work> = inject('work', ref<Work>({} as Work));
const noDepId = Date.now().toString();

// Compute user to organization map
const orgUserMap = computed<{ [orgCode: string]: TreeNode[] }>(() => {
  const result: { [orgCode: string]: TreeNode[] } = {};
  const data = props.node?.data as BasicNodeData;

  function satisfyOption(option: UserOption, user: UserMoreInfo) {
    const {
      toCreator = false,
      userIds = [],
      orgIds = [],
      roleIds = [],
      orgRoles = []
    } = data?.options || {};
    if (toCreator && work.value?.createdBy === user.id) {
      return true;
    }
    if (userIds?.includes(user.id)) {
      return true;
    }
    if (user.departments.some(dep => orgIds?.includes(dep.code))) {
      return true;
    }
    if (user.roles?.some((r: string) => roleIds?.includes(r))) {
      return true;
    }

    if (orgRoles?.length > 0) {
      return orgRoles?.some(o => (o.orgId ? user.departments.some(dep => dep.code === o.orgId) : true)
        && (o.roles?.length ? o.roles?.some(role => user.roles.includes(role)) : true));
    }
    return false;
  }

  props.users.forEach(user => {
    if (!data?.options || satisfyOption(data?.options, user)) {
      const userNode: TreeNode = {
        key: user.id,
        label: user.fullName,
        data: user
      };
      if (user.departments.length === 0) {
        result[noDepId] = [...result[noDepId] || [], userNode];
      } else {
        user.departments.forEach(dep => {
          result[dep.code] = [...result[dep.code] || [], userNode];
        });
      }
    }
  });

  return result;
});
const organizationOptions = computed(() => {
  // const rootNode: TreeNode = {
  //   key: 'org_',
  //   label: t('work-flow.task.orgTree'),
  // };

  const treeNodes = allOrg.value.map(org => ({
    key: 'org_' + org.code,
    label: org.name,
    data: org.code,
    parentId: 'org_' + org.parentCode,
    children: orgUserMap.value[org.code]
  }));

  let tree: TreeNode[] = listToTree(treeNodes, {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });

  tree = filterTreeNodes(tree, node => (node?.children?.length || -1) < 0 && node.data?.__typename === 'UserMoreInfo');

  // rootNode.children = [...tree, ...orgUserMap.value[noDepId] || []];
  return [...tree, ...orgUserMap.value[noDepId] || []];
});
const allOrg = computed(() => get(result.value, 'allOrganizationPublic', []) as OrganizationInterface[]);

const selectedKeys = ref();
const { result } = getAllOrganizationGraphql();
watch(() => selectedKeys.value, (selected) => {
  selectUserIds.value = new Set(Object.keys(selected).filter(key => !key.startsWith('org_')));
});
const selectUserIds: Ref<Set<string>> = inject('selectUserIds', {} as Ref<Set<string>>);
const searchTerm = ref<string>('');
const filteredTreeNodes = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return filterTreeNodes((organizationOptions.value || []) as TreeNode[], (node) => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(node.label || '');
    return normalizedLabel.includes(normalizedSearchTerm);
  }
  );
});

</script>

<style scoped>

</style>