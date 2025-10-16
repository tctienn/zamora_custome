<template>
  <div>
    <div class='mb-3 p-3 p-tree-filter-container pb-0 relative'>
      <IconField icon-position='right'>
        <InputText
          v-model='searchTerm'
          class='p-component p-inputtext p-tree-filter pr-5'/>
        <InputIcon class='pi pi-search'></InputIcon>
      </IconField>
    </div>
    <TreeTable
      v-model:expanded-keys='expandedKeys'
      row-hover
      :scroll-height="'flex'"
      scrollable
      :selection-mode='selectionMode'
      :show-gridlines='false'
      :value='filteredTreeNodes'
      v-bind='$attrs'>
      <Column
        body-class='w-full flex align-items-center'
        expander
        field='fullName'
        :header='t("document.flowAction.userOrDeptReceive")'
        header-class='flex justify-content-center'
        style='min-width:70%'>
        <template #body='{ node: nodeDataTem }'>
          <div
            class='align-items-center flex gap-2 w-full'>
            <Checkbox
              v-if="
                selectionMode != 'checkbox' && nodeDataTem.data.id!=userDeptRole.deptId && shouldShowCheckbox(nodeDataTem)
              "
              :binary='true'
              :model-value="selectedUserIds?.[nodeDataTem?.key || '']"
              @update:model-value='toggleRow($event, nodeDataTem)'></Checkbox>
            <div
              v-if=' nodeDataTem?.data?.userId '>
              <AppUser
                avatar-size='3'
                info-visible
                :infos="['positionName', 'username']"
                name-visible
                :user-id='nodeDataTem?.data?.userId'/>
            </div>
            <div
              v-else
              class='font-semibold'>
              {{ nodeDataTem.label }}
            </div>
          </div>
        </template>
      </Column>
      <Column
        :header='t("common.role")'>
        <template #body='{ node: nodeDataTem }'>
          {{ nodeDataTem.data.roleName }}
        </template>
      </Column>
    </TreeTable>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableExpandedKeys, TreeTableSelectionKeys, } from 'primevue/treetable';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { extractTreeNode } from '@/apps/work-flow/views/components/UserSelectMoreDetail';
import { associate } from '@/common/helpers/extension/array.extension';
import { filterTreeNodes, mapTreeNodeToFlatList } from '@/common/helpers/tree-node-utils';
import { normalizeString } from '@/common/helpers/utils';

const props = defineProps({
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  treeOptions: {
    type: Array as PropType<TreeNode[]>,
    required: true,
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
});
const expandedKeys = ref<TreeTableExpandedKeys>();
watch(() => props.treeOptions, value => {
  expandedKeys.value = associate(mapTreeNodeToFlatList(value, node => node?.key), node => [node || '', true]);

  // expandedKeys.value = listToObject(
  //   mapTreeNodeToFlatList(value, node => node?.key), item => item || '', () => true
  // );
}, { immediate: true });
const chosenUserDeptRole = defineModel<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>
  ('chosenUserDeptRole', { default: [] });
const selectedUserIds = defineModel<TreeTableSelectionKeys>({ default: {} });

watch(chosenUserDeptRole, value => {
  const rs: TreeTableSelectionKeys = {};
  value.forEach(e => {
    rs[e.id] = true;
  });
  selectedUserIds.value = rs;
}, {
  deep: true,
  immediate: true
});
const { t } = useI18n();
const filteredTreeNodes = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return filterTreeNodes((props.treeOptions || []) as TreeNode[], (node) => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(node.label || '');
    return normalizedLabel.includes(normalizedSearchTerm);
  });
});
const searchTerm = ref<string>('');
const defaultAction = inject('defaultAction', undefined);

function toggleRow(value: boolean, data: any) {
  const selectedIds = { ...selectedUserIds.value };
  if (value) {
    chosenUserDeptRole.value = [...chosenUserDeptRole.value, {
      ...extractTreeNode(data),
      action: defaultAction
    }];
    selectedIds[data?.key] = true;
  } else {
    delete selectedIds[data?.key];
    chosenUserDeptRole.value = chosenUserDeptRole.value.filter(e => e.id != data.key);
  }
  selectedUserIds.value = selectedIds;
}

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
</script>

<style scoped></style>
