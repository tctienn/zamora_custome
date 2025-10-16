import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { NodeError } from '@/apps/work-flow/views/config/sidebar/component/ValidatorNode';

export const useNodeProblemsStore = defineStore('nodeProblems', () => {
  const problems = ref<Record<string, NodeError[]>>({});
  const totalErrorCount = computed(() => {
    return Object.values(problems.value).reduce((acc, errors) => acc + errors.length, 0);
  });
  const addProblem = (nodeId: string, problem: NodeError) => {
    if (!problems.value[nodeId]) {
      problems.value[nodeId] = [];
    }
    problems.value[nodeId].push(problem);
  };

  const removeProblem = (nodeId: string, problemIndex: number) => {
    if (problems.value[nodeId]) {
      problems.value[nodeId].splice(problemIndex, 1);
      if (problems.value[nodeId].length === 0) {
        delete problems.value[nodeId];
      }
    }
  };

  const clearProblems = (nodeId: string) => {
    delete problems.value[nodeId];
  };

  const clearAllProblems = () => {
    problems.value = {};
  };

  const getProblemsForNode = (nodeId: string) => {
    return problems.value[nodeId] || [];
  };

  return {
    totalErrorCount,
    problems,
    addProblem,
    removeProblem,
    clearProblems,
    clearAllProblems,
    getProblemsForNode,
  };
});
