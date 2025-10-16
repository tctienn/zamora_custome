<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex font-semibold pl-2'>
          {{ t('e-form.form.eFormManagement') }}
        </div>
      </template>
      <template #end>
        <SplitButton
          :label='t("common.create")'
          :model='items'
          @click='listRef?.createEForm()'></SplitButton>
      </template>
    </Toolbar>
    <div class='flex gap-2'>
      <EFormGroupTree ref='groupRef'/>
      <EFormList ref='listRef'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import type { MenuItem } from 'primevue/menuitem';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EFormGroupTree from '@/apps/e-form/views/config/EFormGroupTree.vue';
import EFormList from '@/apps/e-form/views/config/EFormList.vue';

const { t } = useI18n();
const selectedGroupId = ref<string>();
const groupRef = ref<InstanceType<typeof EFormGroupTree>>();
const listRef = ref<InstanceType<typeof EFormList>>();
const items: MenuItem[] = [
  {
    label: t('e-form.form.create.group'),
    icon: 'pi pi-list',
    command: () => {
      groupRef.value?.addGroup();
    }
  },
  {
    label: t('e-form.form.create.eForm'),
    icon: 'pi pi-table',
    command: () => {
      listRef.value?.createEForm();
    }
  },
];
provide('selectedGroupId', selectedGroupId);
</script>

<style scoped>

</style>