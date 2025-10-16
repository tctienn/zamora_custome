import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import type { ProjectInterface } from '@/apps/work/views/project/model';
import { Direction, type Order } from '@/common/model/query';

export const useProjectStore = defineStore('project', () => {
  const sort = ref<Order[]>([]);
  const projects = ref<ProjectInterface[]>([]);

  watch(sort, (value) => {
    sortList(projects.value, value);
  });

  function sortList<T extends Record<string, any>>(list: T[], orders: Order[]): T[] {
    const criteria = orders.map(({ property, direction }) => ({
      property,
      multiplier: direction === Direction.ASC ? 1 : -1,
    }));
    list.sort((a, b) => {
      for (const { property, multiplier } of criteria) {
        const valueA = a[property];
        const valueB = b[property];

        if (valueA < valueB) {
          return -multiplier;
        }
        if (valueA > valueB) {
          return multiplier;
        }
      }
      return 0;
    });
    return list;
  }

  return {
    sort,
    projects
  };
});