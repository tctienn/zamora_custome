<template>
  <div class='mb-3 p-3 p-tree-filter-container pb-0 relative'>
    <IconField icon-position='right'>
      <InputText
        v-model='searchTerm'
        class='p-component p-inputtext p-tree-filter pr-5'/>
      <InputIcon class='pi pi-search'></InputIcon>
    </IconField>
  </div>
  <DataTable
    v-model:expandedRows='expandedRows'
    data-key='id'
    :pt="{
      rowExpansionCell:{
        class:'p-0'
      }
    }"
    row-hover
    :scroll-height="'flex'"
    scrollable
    :value='listSelectFiltered'>
    <Column
      expander
      style='width: 2rem'>
    </Column>

    <Column
      field='name'
      :header="'Người/phòng ban nhận'">
      <template #body='{data}'>
        <div class='align-items-center flex font-semibold gap-2 w-full'>
          <Checkbox
            binary
            :model-value='selectedUserDeptRole?.[data?.id || ""]'
            @update:model-value='toggleRowOrg($event,data)'>
          </Checkbox>
          {{ data?.name }}
        </div>
      </template>
    </Column>
    <Column
      :header="'Vai trò'"
      header-class='white-space-nowrap'>
    </Column>
    <template #expansion='{data}'>
      <div
        v-if='orgUserMap?.[data?.id]'>
        <DataTable
          :pt='{
            thead:{
              style:{
                display:"none"
              }
            }
          }'
          scroll-height='flex'
          scrollable
          :value='orgUserMapFiltered?.[data?.id]||[]'>
          <Column>
            <template #body='{data:dataCol}'>
              <div class='align-items-center flex gap-2 w-full'>
                <Checkbox
                  :binary='true'
                  :model-value="selectedUserDeptRole?.[dataCol?.key || '']"
                  @update:model-value='toggleRowUser($event, dataCol)'>
                </Checkbox>
                <div
                  v-if=' dataCol?.data?.userId '>
                  <AppUser
                    avatar-size='3'
                    info-visible
                    :infos="['positionName', 'username']"
                    name-visible
                    :user-id='dataCol?.data?.userId'/>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :header='t("common.role")'>
            <template #body='{ data: dataCol }'>
              {{ dataCol?.data?.roleName }}
            </template>
          </Column>
        </DataTable>
      </div>
    </template>

  </DataTable>
</template>

<script lang="ts" setup>
import type { DataTableExpandedRows } from 'primevue/datatable';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getTagsByDocInId } from '@/apps/document/api/graphql/doc-in';
import type { DocIn, UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { UserSelectNext } from '@/apps/document/model/userNextAction';
import { sortOrgByTags } from '@/apps/document/views/doc/component/user-select-next/process-data';
import { extractTreeNode } from '@/apps/work-flow/views/components/UserSelectMoreDetail';
import { normalizeString } from '@/common/helpers/utils';

const props = defineProps({
  orgMap: {
    type: Object as PropType<Record<string, OrganizationInterface>>,
    default: () => ({})
  },
  orgUserMap: {
    type: Object as PropType<Record<string, TreeNode[]>>,
    default: () => ({})
  },
  userSelectNext: {
    type: Array as PropType<UserSelectNext[]>,
    default: () => []
  }
});

const chosenUserDeptRole = defineModel<(UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})[]>
  ('chosenUserDeptRole', { default: [] });

const { t } = useI18n();

const listSelect = ref<OrganizationInterface[]>([]);
const expandedRows = ref<DataTableExpandedRows>();

watch(() => props.orgMap, (value) => {
  listSelect.value = sortOrgByTags(Object.values(value), ['BĐI']);
}, { immediate: true });

const doc = inject('doc', {} as Ref<DocIn>);
const { load: loadTags, result: docTags, refetch: refetchTags } = getTagsByDocInId(doc?.value?.id || '');
watch(() => doc.value?.id, docId => {
  if (docId) {
    loadTags(null, { id: docId }) || refetchTags({ id: docId });
  }
}, { immediate: true });
const selectedUserDeptRole = ref<Record<string, boolean>>({});
const defaultAction = inject('defaultAction', undefined);
const listSelectFiltered = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return listSelect.value.filter(e => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(e.name || '');
    const userInDept = orgUserMapFiltered.value?.[e.id] || [];
    return normalizedLabel.includes(normalizedSearchTerm) || userInDept.length > 0;
  });
});

const orgUserMapFiltered = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return Object.fromEntries(
    Object.entries(props.orgUserMap).map(([orgId, users]) => [
      orgId,
      users.filter(e => {
        //Neu phong ban duoc tim thay thi khong phai loc theo user
        if (listSelect.value.findIndex(e => normalizeString(e.name || '').includes(normalizedSearchTerm)) > -1) {
          return true;
        }
        const normalizedLabel = normalizeString(e?.label || '');
        return e?.data?.userId && normalizedLabel.includes(normalizedSearchTerm);
      })
    ])
  );
});

function toggleRowOrg(value: boolean, data: OrganizationInterface) {
  selectedUserDeptRole.value[data.id] = value;
  if (value) {
    const node = {
      key: data.id,
      data: data
    };
    chosenUserDeptRole.value = [...chosenUserDeptRole.value, {
      ...extractTreeNode(node),
      action: defaultAction
    }];
  } else {
    chosenUserDeptRole.value = chosenUserDeptRole.value.filter(e => e.id != data.id);
  }
}

function toggleRowUser(value: boolean, data: TreeNode) {
  selectedUserDeptRole.value[data?.key || ''] = value;
  if (value) {
    chosenUserDeptRole.value = [...chosenUserDeptRole.value, {
      ...extractTreeNode(data),
      action: defaultAction
    }];
  } else {
    chosenUserDeptRole.value = chosenUserDeptRole.value.filter(e => e.id != data.key);
  }
}

watch(chosenUserDeptRole, value => {
  const rs: Record<string, boolean> = {};
  value.forEach(e => {
    rs[e.id] = true;
  });
  selectedUserDeptRole.value = rs;
}, {
  deep: true,
  immediate: true
});

const searchTerm = ref<string>('');
</script>

<style scoped>

</style>