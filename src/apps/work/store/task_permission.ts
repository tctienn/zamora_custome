import { defineStore } from 'pinia';
import { ref } from 'vue';

import { permissionsByTask } from '@/apps/work/api/rest/permission';
import { TaskAction } from '@/apps/work/model/permission';

export const useTaskPermissionStore = defineStore('task-permission', () => {
  const mapPermission = ref<{ [key: string]: string[] }>({});

  function hasPermission(taskId: string, action: TaskAction): boolean {
    const actions = mapPermission.value[taskId];
    return actions?.includes(TaskAction[action]) === true;
  }

  async function getPermissionsForTask(taskId: string): Promise<string[]> {
    let permissions = mapPermission.value[taskId];
    if (!(permissions && permissions.length)) {
      permissions = await permissionsByTask(taskId).then(a => {
        mapPermission.value[taskId] = a || [];
        return mapPermission.value[taskId];
      });
    }
    return permissions;
  }

  async function updatePermissionForTask(taskId: string) {
    mapPermission.value[taskId] = await permissionsByTask(taskId).then(a => a || []);
  }

  function clear() {
    mapPermission.value = {};
  }

  return {
    getPermissionsForTask,
    updatePermissionForTask,
    hasPermission,
    clear
  };
});