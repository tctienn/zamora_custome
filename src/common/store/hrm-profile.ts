import { defineStore } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { ref } from 'vue';

import type { EmployeeSummary } from '@/apps/hrm/model/employee';

export const useHrmProfileStore = defineStore('hrm-profile', () => {
  const changedProperties = ref<string[]>([]);
  const treeUnitData = ref<TreeNode[]>([]);
  const setChangedProperties = (newValue: string[]) => {
    changedProperties.value = newValue;
  };
  const employeeData = ref<EmployeeSummary[]>([]);
  
  const refetchFnCountTree = ref<() => void>();
  const refetchFnCountTable = ref<() => void>();

  function setRefetchCountTree(fn: () => void) {
    refetchFnCountTree.value = fn;
  }

  function callRefetchCountTree() {
    console.log('callRefetchCountTree');
    refetchFnCountTree.value?.();
  }

  function setRefetchCountTable(fn: () => void) {
    refetchFnCountTable.value = fn;
  }

  function callRefetchCountTable() {
    console.log('callRefetchCountTable');
    refetchFnCountTable.value?.();
  }

  const resetChangedProperties = () => {
    changedProperties.value = [];
  };

  const setTreeUnitData = (newValue: TreeNode[]) => {
    treeUnitData.value = newValue;
  };

  const setEmployeeData = (newValue: EmployeeSummary[]) => {
    employeeData.value = newValue;
  };
  return {
    resetChangedProperties,
    setChangedProperties,
    setTreeUnitData,
    treeUnitData,
    changedProperties,
    setEmployeeData,
    employeeData,
    refetchFnCountTree,
    setRefetchCountTree,
    callRefetchCountTree,
    refetchFnCountTable,
    setRefetchCountTable,
    callRefetchCountTable
  };
}, { persist: true });