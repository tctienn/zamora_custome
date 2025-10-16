<template>
  <div class='field'>
    <div
      v-for='(orgRole,index) in orgRoles'
      :key='index'
      class='align-items-center flex gap-2 justify-content-between mb-2'>
      <OrganizationTree
        v-model='orgRoles[index].orgId'
        class='w-6'
        :org-type='orgType'
        selection-mode='single'>
      </OrganizationTree>
      <MultiSelect
        v-model='orgRoles[index].roles'
        class='w-6'
        filter
        option-label='name'
        option-value='code'
        :options='allRoles'>
      </MultiSelect>
      <AppIcon
        class='cursor-pointer'
        name='close'
        size='1.5'
        @click='deleteOrgRoles(index)'>
      </AppIcon>
    </div>
    <Button
      :label='t("common.add")'
      @click='addOrgRole'>
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllRoles } from '@/apps/admin/api/graphql/role-graphql-api';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgRole } from '@/apps/work-flow/model/flow';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    default: 'main'
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
});

const { findNode } = useVueFlow(props.storeId);
let node: GraphNode | undefined;
type OrgRoleInternal = {
  orgId: string[],
  roles: string[],
}
const orgRoles = ref<OrgRoleInternal[]>(node?.data?.options.orgRoles || []);
watch(() => props.nodeId, (nodeId) => {
  node = findNode(nodeId);
  orgRoles.value = node?.data?.options?.orgRoles?.map((e: OrgRole) => {
    return {
      roles: e.roles,
      orgId: e.orgId === null ? [] : [e.orgId]
    };
  }) || [];
}, { immediate: true });

const { t } = useI18n();

function addOrgRole() {
  orgRoles.value = [...orgRoles.value, {
    orgId: [],
    roles: []
  }];
}

watch(orgRoles, (value) => {
  if (node?.data?.options) {
    node.data.options = {
      ...node.data.options,
      orgRoles: transformOrgRole(value)
    };
  }
}, { deep: true });

const allRoles = ref();
getAllRoles().onResult(res => {
  allRoles.value = res.data.roles;
});

function deleteOrgRoles(index: number) {
  orgRoles.value = orgRoles.value.filter((e, i) => i != index);
}

function transformOrgRole(orgRoles: OrgRoleInternal[]): OrgRole[] {
  return orgRoles.map(e => {
    return {
      orgId: e.orgId.length > 0 ? e.orgId[0] : null,
      roles: e.roles
    };
  });
}

</script>

<script lang="ts">
export default { name: 'OrganizationOptionsEditor' };

</script>

<style scoped>

</style>