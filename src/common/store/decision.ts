import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHrmDecision = defineStore('hrm-decision', () => {
  const draftEmployeeIds = ref<string[]>([]);
  const pendingEmployeeIds = ref<string[]>([]);
  const setDraftEmployeeIds = (newValue: string[]) => {
    draftEmployeeIds.value = newValue;
  };
  const setPendingEmployeeIds = (newValue: string[]) => {
    pendingEmployeeIds.value = newValue;
  };
  return {
    draftEmployeeIds,
    setDraftEmployeeIds,
    pendingEmployeeIds,
    setPendingEmployeeIds
  };
}, { persist: true });