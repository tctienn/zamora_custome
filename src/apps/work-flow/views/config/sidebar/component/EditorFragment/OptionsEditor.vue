<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.selectionOptions') }}
    </label>
    <div>
      <Dropdown
        v-model='selectionOption'
        class='w-full'
        option-label='name'
        option-value='value'
        :options='selectionOptionOptions'
        @update:model-value='updateSelectionOption'>
      </Dropdown>
    </div>
  </div>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.selectionFrom') }}
    </label>
    <div class='flex flex-column gap-2'>
      <div class='flex flex-column gap-1'>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='toCreator'
            binary
            :false-value='false'
            input-id='toCreator'
            :true-value='true'
            @update:model-value='updateToCreator($event)'/>
          <label
            class='ml-2'
            for='toCreator'>{{ t('work-flow.flow.toCreator') }} </label>
        </div>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='optionsCheck'
            input-id='listUser'
            value='LIST'/>
          <label
            class='ml-2'
            for='listUser'> {{ t('work-flow.flow.listUser') }} </label>
        </div>
        <NamedMultiSelectUser
          v-if='optionsCheck.includes("LIST")'
          v-model:list-user='userIds'
          class='w-full'
          name='attendeeIds'
          :show-button-add='false'
          @update:list-user='updateListUser'/>
      </div>

      <div class='flex flex-column gap-1'>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='optionsCheck'
            input-id='orgRole'
            value='ORG_ROLE'/>
          <label
            class='ml-2'
            for='orgRole'> {{ t('work-flow.flow.listOrgRoles') }} </label>
        </div>
        <OrganizationOptionsEditor
          v-if='optionsCheck.includes("ORG_ROLE")'
          :node-id='nodeId'
          :org-type='orgType'
          :store-id='storeId'/>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { camelCase } from 'lodash';
import { inject, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OrganizationType } from '@/apps/document/model/organization';
import { SelectionOption } from '@/apps/work-flow/model/flow';
import OrganizationOptionsEditor
  from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/OrganizationOptionsEditor.vue';
import { updateNodeDataByField } from '@/apps/work-flow/views/config/sidebar/UpdateNodeData';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    default: 'main'
  }
});

const {
  findNode,
  updateNodeData
} = useVueFlow(props.storeId);
let node: GraphNode | undefined = findNode(props.nodeId);

const { t } = useI18n();

const toCreator = ref(node?.data?.['options']?.['toCreator'] || false);
const userIds = ref(node?.data?.['options']?.['userIds'] || []);
const roleIds = ref(node?.data?.['options']?.['roleIds'] || []);
const orgIds = ref(node?.data?.['options']?.['orgIds'] || []);
const orgRoles = ref(node?.data?.['options']?.['orgRoles'] || []);
const optionsCheck = ref<string[]>(initializeOptionsCheck());

watch(() => props.nodeId, (nodeId) => {
  node = findNode(nodeId);
  updateNodeDataRefs();
  optionsCheck.value = initializeOptionsCheck();

});

watch(optionsCheck, value => {
  if (node) {
    const options = { ...node.data.options };

    if (!value.includes('LIST')) {
      delete options.userIds;
    }
    if (!value.includes('ROLE')) {
      delete options.roleIds;
    }
    if (!value.includes('ORG')) {
      delete options.orgIds;
    }
    if (!value.includes('ORG_ROLE')) {
      delete options.orgRoles;
    }
    updateNodeDataByField(node, 'options', options);
    updateNodeDataRefs();
  }
});

const selectionOption = inject<Ref<SelectionOption>>('selectionOption', ref(node?.data['selectionOption'] || SelectionOption.ONE));
selectionOption.value = node?.data['selectionOption'] || SelectionOption.ONE;

const selectionOptionOptions = Object.keys(SelectionOption).map(e => ({
  value: e,
  name: t(`work-flow.flow.config.selectionOption.${camelCase(e)}`)
}));

function initializeOptionsCheck(): string[] {
  const rs: string[] = [];
  if (userIds.value.length > 0) {
    rs.push('LIST');
  }
  if (roleIds.value.length > 0) {
    rs.push('ROLE');
  }
  if (orgIds.value.length > 0) {
    rs.push('ORG');
  }
  if (orgRoles.value.length > 0) {
    rs.push('ORG_ROLE');
  }
  return rs;
}

function updateNodeDataRefs() {
  toCreator.value = node?.data?.['options']?.['toCreator'] || false;
  userIds.value = node?.data?.['options']?.['userIds'] || [];
  roleIds.value = node?.data?.['options']?.['roleIds'] || [];
  orgIds.value = node?.data?.['options']?.['orgIds'] || [];
  orgRoles.value = node?.data?.['options']?.['orgRoles'] || [];
  selectionOption.value = node?.data['selectionOption'] || SelectionOption.ONE;
}

function updateListOrg(value: never) {
  updateNodeData(props.nodeId, (node: GraphNode) => ({
    options: {
      ...node.data.options,
      orgIds: orgIds
    }
  }), { replace: false });
}

function updateListUser(value: string[]) {
  updateNodeData(props.nodeId, (node: GraphNode) => ({
    options: {
      ...node.data.options,
      userIds: value
    }
  }), { replace: false });
}

function updateToCreator(value: boolean) {
  updateNodeData(props.nodeId, (node: GraphNode) => ({
    options: {
      ...node.data.options,
      toCreator: value
    }
  }), { replace: false });
}

function updateSelectionOption(value: string) {
  updateNodeDataByField(node, 'selectionOption', value);
}

const orgType: Ref<OrganizationType> = inject('orgType', {} as Ref<OrganizationType>);
if (node) {
  node.data = {
    ...node.data,
    orgType: orgType.value
  };
}
</script>

<style scoped>
:deep(.named-multiselect-user-panel) {
  width: 100%;
  left: -0.2rem !important;
}

:deep(.avatar-container) {
  overflow: hidden !important;
}
</style>