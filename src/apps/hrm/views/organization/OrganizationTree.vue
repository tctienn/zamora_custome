<template>
  <Toolbar
    class='mb-2 p-0'
    style='min-height: 3rem'>
    <template #start>
      <div class='align-items-center flex font-bold gap-2 ml-3'>
        {{ t('hrm.menu.organizationTree') }}
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-1'>
        <ButtonIcon
          class='focus:shadow-none font-normal'
          icon='link'
          :label="t('hrm.organization.merge')"
          outlined/>
        <ButtonIcon
          class='focus:shadow-none font-normal'
          icon='stop_circle'
          :label="t('hrm.organization.dissolve')"
          outlined/>
        <SelectButton
          v-model='display'
          :allow-empty='false'
          class='align-content-center view-button'
          :option-value='(option) => option.value'
          :options='showRowOption'>
          <template #option='slotProps'>
            <i
              :class="{
                'pi pi-bars': slotProps.option.label === 'List',
                'pi pi-th-large': slotProps.option.label === 'Grid',
              }"
              style='font-size: 1.2rem'></i>
          </template>
        </SelectButton>
      </div>
    </template>
  </Toolbar>
  <vue3TreeOrg
    collapsable
    :data='organizations?.[0] || {}'
    :default-expand-level='1'
    :define-menus='[]'
    horizontal
    :props="{ id: 'code', pid: 'parentCode', label: 'name', children: 'children' }"
    :tool-bar='false'>
    <template #default='{node}'>
      <div
        class='border-1 border-dashed border-round-sm px-3 py-2'
        :class='node.$$data.status === "ACTIVE" ? "hover:bg-blue-50 hover:text-blue-400 surface-ground" : "bg-red-50 border-red-400 hover:text-red-400"'>
        {{ node.label }}
      </div>
    </template>

    <template #expand='{node}'>
      <div>{{ node.children.length }}</div>
    </template>
  </vue3TreeOrg>
</template>

<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Vue3TreeOrg } from 'vue3-tree-org';

import { getListOrganizationIsDeleteFalseGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';

const eleRef = ref<HTMLDivElement>();
const { result } = getListOrganizationIsDeleteFalseGraphql();
const organizations = computed((): any[] => toTree(result.value?.getListOrganizationIsDeleteFalse || []));
const { t } = useI18n() || {};
const display = ref(true);

function toTree(data: OrganizationInterface[]) {
  const map = new Map();
  data.forEach(item => map.set(item.code, {
    ...item,
    children: []
  }));
  const tree: OrganizationInterface[] = [];
  data.forEach(item => {
    const node = map.get(item.code);
    if (item.parentCode) {
      const parent = map.get(item.parentCode);
      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    } else {
      tree.push(node);
    }
  });
  return tree;
}

const showRowOption = ref([
  {
    label: 'Grid',
    value: false
  }, {
    label: 'List',
    value: true
  }
]);

onMounted(() => {
  const dragZone = document.querySelector('.zm-draggable') as HTMLElement;
  if (dragZone) {
    // move the dragZone to the center of the screen
    setTimeout(() => {
      const parent = dragZone.parentElement as HTMLElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const dragRect = dragZone.getBoundingClientRect();
        const top = (parentRect.height - dragRect.height) / 2;
        const left = (parentRect.width - dragRect.width) / 2;
        dragZone.style.transform = `translate(${left}px, ${top}px)`;
      }
    }, 500);
  }
});
</script>

<style scoped>
:deep(.tree-org-node__expand) {
  padding: .3rem;
  height: 2rem;
  width: 2rem;
}

:deep(.tree-org-node__content) {
  padding: unset;
}

:deep(.tree-org-node__inner) {
  box-shadow: unset;
}
</style>