<template>
  <span class='font-bold text-primary text-xl'>{{
    t("document.menu.documentAdminDefaultFlowSetting")
  }}</span>
  <Splitter
    class='mt-2'
    style='border: none; height: 86vh'>
    <SplitterPanel
      class='p-0'
      :size='10'>
      <TabMenu
        v-model:active-index='activeOrgType'
        class='w-full'
        :model='orgTypes'
        :pt="{
          action: 'p-3',
        }">
      </TabMenu>
      <Tree
        v-model:selectionKeys='selectedOrganization'
        class='overflow-auto w-full'
        :empty-message="t('common.selectEmpty')"
        input-id='organizationParent'
        selection-mode='single'
        style='height: 80vh'
        :value='organizations'>
        <template #default='slotProp'>
          <div
            :class="[
              {
                'text-blue-500': existDeptId?.includes(slotProp.node.key),
              },
              'align-items-center',
              'flex',
              'justify-content-between',
              'edge',
            ]">
            {{ slotProp.node.label }}
          </div>
        </template>
      </Tree>
    </SplitterPanel>

    <SplitterPanel>
      <TabMenu
        v-model:active-index='activeDocType'
        :model='docTypes'
        :pt="{
          action: 'p-3',
        }">
      </TabMenu>
      <div class='font-bold m-2'>
        {{ t("document.defaultFlowSetting.defaultFlowSetting") }}
      </div>
      <div class='flex gap-2 m-2'>
        <NamedDropdown
          v-model='flowId'
          class='w-6'
          filter
          name='flowId'
          option-label='name'
          option-value='id'
          :options='flows'/>
        <Button
          v-if='flowId && oldFlowId !== flowId'
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='saveDefaultFlow'/>
      </div>
      <div class='h-full w-full'>
        <WorkFlowView
          v-if='flowId'
          :flow-id='flowId'></WorkFlowView>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  getAllDeptIds,
  getIncomingFlowIdByDeptId,
  getOutgoingFlowIdByDeptId,
  saveDefaultFlowConfig,
} from '@/apps/document/api/graphql/default-flow-setting';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { DOC_IN_FLOW_TYPE, DOC_OUT_FLOW_TYPE } from '@/apps/document/model/flow';
import { OrganizationType } from '@/apps/document/model/organization';
import { findByOrgTypeAndOrgIdsContainingAndType } from '@/apps/work-flow/api/graphql/flow-api';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

const activeOrgType = ref(0);
const activeDocType = ref(0);
const { t } = useI18n();
const organizations = ref();
const flowId = ref();
const oldFlowId = ref();
const selectedOrganization = ref();
const flows = ref();
const existDeptId = ref();
const orgTypes: MenuItem[] = [
  {
    label: t('document.book.ADMINISTRATIVE'),
    command: () => fetchOrganizations(OrganizationType.ADMINISTRATIVE),
  },
  {
    label: t('document.book.PARTY'),
    command: () => fetchOrganizations(OrganizationType.PARTY),
  },
  {
    label: t('document.book.UNION'),
    command: () => fetchOrganizations(OrganizationType.UNION),
  },
];

const docTypes: MenuItem[] = [
  { label: t('document.menu.documentDocIn') },
  { label: t('document.menu.documentDocOut') },
];

const {
  onResult: getFlowResult,
  refetch: getFlowRefetch,
  load: getFlowLoad,
} = findByOrgTypeAndOrgIdsContainingAndType(
  OrganizationType.ADMINISTRATIVE,
  '',
  '',
);
getFlowLoad();

const { onResult: getAllDeptIdsResult, refetch: getAllDeptIdsRefetch } =
  getAllDeptIds();

getAllDeptIdsResult((res) => {
  existDeptId.value = res.data.getAllDeptIds;
});

function reload() {
  getAllDeptIdsRefetch();
}

const {
  mutate: saveDefaultFlowConfigMutate,
  onDone: saveDefaultFlowConfigOnDone,
} = saveDefaultFlowConfig();

function saveDefaultFlow() {
  saveDefaultFlowConfigMutate({
    incomingFlowId: activeDocType.value === 0 ? flowId.value : null,
    outgoingFlowId: activeDocType.value === 1 ? flowId.value : null,
    deptId: Object.keys(selectedOrganization.value)[0],
  });
}

saveDefaultFlowConfigOnDone(() => {
  toastSuccess({ message: t('document.defaultFlowSetting.saveDefaultFlowConfigOnDone'), });
  oldFlowId.value = flowId.value;
  reload();
});

getFlowResult((res) => {
  flows.value = res.data.findByOrgTypeAndOrgIdsContainingAndType;
});

watch(selectedOrganization, (newValue) => {
  fetchFlow();
});

watch(activeDocType, (newValue) => {
  fetchFlow();
});

function fetchFlow() {
  flowId.value = null;
  oldFlowId.value = null;

  const type =
    activeOrgType.value === 0
      ? OrganizationType.ADMINISTRATIVE
      : activeOrgType.value === 1
        ? OrganizationType.PARTY
        : OrganizationType.UNION;

  const orgId = Object.keys(selectedOrganization.value)[0];

  getFlowRefetch({
    orgType: type,
    orgIds: orgId,
    type:
      activeDocType.value === 0
        ? DOC_IN_FLOW_TYPE
        : DOC_OUT_FLOW_TYPE,
  });

  const { onResult } =
    activeDocType.value === 0
      ? getIncomingFlowIdByDeptId(orgId)
      : getOutgoingFlowIdByDeptId(orgId);
  onResult((res) => {
    flowId.value =
      activeDocType.value === 0
        ? res.data.getIncomingFlowIdByDeptId
        : res.data.getOutgoingFlowIdByDeptId;
    oldFlowId.value = flowId.value;
  });
}

onMounted(() => {
  fetchOrganizations(OrganizationType.ADMINISTRATIVE);
});
const fetchOrganizations = (type: string) => {
  if (type === OrganizationType.ADMINISTRATIVE) {
    const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
    getAllOrganizationResult((response) => {
      const data = get(response, 'data.allOrganizationPublic', []);
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.code,
          parentId: organization.parentCode,
          children: [],
        })),
        {
          id: 'data',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  } else {
    const { onResult: getOrganizationResult } = getByTypeGraphql(type);
    getOrganizationResult((res) => {
      const data = res.data.getByType;
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.id,
          parentId: organization.parentId,
          children: [],
        })),
        {
          id: 'key',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  }
};
</script>

<style scoped>
:deep(.p-tree) {
  border: unset;
}
</style>
