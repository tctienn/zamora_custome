import { filter, get, groupBy, isEmpty, map, sortBy } from 'lodash';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import { findAllStatusGraphql } from '@/apps/work/api/graphql/config-work-status-api';
import { TASK_FILTER_HEADER } from '@/apps/work/constants';
import { BoardType } from '@/apps/work/model/board';
import { StatusType, type TaskStatus, type TaskStatusCount } from '@/apps/work/model/configWorkStatus';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import { associateBy, associateTo } from '@/common/helpers/extension/array.extension';
import { convertAlias } from '@/common/helpers/utils';
import { Direction, type Order } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

export const useTaskStore = defineStore('task', () => {
  const boardType = ref<BoardType>(BoardType.PERSON);
  const tasks = ref<Task[]>([]);
  const filterStatusId = ref<string>('ALL');
  const filterStatusIds = ref<string[]>([]);
  const sort = ref<Order[]>([]);

  const filterCondition = ref<string>('');
  const searchKeyword = ref<string>();
  const statuses = ref<TaskStatus[]>([]);
  const mapStatuses = computed(() => {
    return associateBy(statuses.value, item => item.id);
  });
  watch(filterStatusId, value => {
    if (value == 'ALL') {
      filterStatusIds.value = statuses.value.map(e => e.id);
    } else {
      filterStatusIds.value = [value];
    }
  }, { immediate: true });

  const completedStatusIds = computed(() => map(filter(statuses.value, ['type', StatusType[StatusType.COMPLETED]]), 'id'));

  const { user } = useUserStore();

  const { onResult: findAllStatusOnResult } = findAllStatusGraphql();
  findAllStatusOnResult(response => {
    statuses.value = sortBy(get(response, 'data.allStatus', []), 'orderNo');
    filterStatusIds.value = statuses.value.map(e => e.id);
  });

  const statusesCount = computed((): TaskStatusCount[] => {
    const groupedTasks = groupBy(filterWithoutStatusTasks.value, 'statusId');
    return statuses.value.map(s => {
      return {
        ...s,
        count: groupedTasks[s.id]?.length ?? 0
      };
    });
  });
  const mapStatusesCount = computed<Record<string, number>>(() => {
    const rs = { 'ALL': 0 };
    return associateTo(statusesCount.value, item => {
      rs.ALL += item.count;
      return [item.id, item.count];
    }, rs);
  });

  const filterWithoutStatusTasks = computed(() => {
    const now = new Date().getTime();
    const oneDayLater = now + 24 * 60 * 60 * 1000;
    const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;
    const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000;

    const filteredTask = tasks.value
      .filter(task => {
        if (isEmpty(filterCondition.value)) {
          return true;
        }
        const { dueTime, participants, assignerId, statusId } = task;
        const taskDueTime = dueTime ? new Date(dueTime).getTime() : Number.MAX_VALUE;

        switch (filterCondition.value) {
        case TASK_FILTER_HEADER.expiresIn1Days:
          return taskDueTime > now && taskDueTime <= oneDayLater;
        case TASK_FILTER_HEADER.expiresIn3Days:
          return taskDueTime > now && taskDueTime <= threeDaysLater;
        case TASK_FILTER_HEADER.expiresIn7Days:
          return taskDueTime > now && taskDueTime <= sevenDaysLater;
        case TASK_FILTER_HEADER.expire:
          return statusId && taskDueTime < now && !completedStatusIds.value.includes(statusId);
        case TASK_FILTER_HEADER.done:
          return statusId && completedStatusIds.value.includes(statusId);
        case TASK_FILTER_HEADER.assign:
          return assignerId == user.id;
        case TASK_FILTER_HEADER.implement:
          return participants.find(participant => participant.type == ParticipantType[ParticipantType.IMPLEMENTER] && participant.participantId == user.id);
        case TASK_FILTER_HEADER.takePartIn:
          return participants.find(participant => participant.participantId === user.id);
        default:
          return false;
        }
      }).filter(t => !searchKeyword.value || (convertAlias(t.name).includes(convertAlias(searchKeyword.value))
        || convertAlias(t.code ?? '').includes(convertAlias(searchKeyword.value))
        || convertAlias(t.assignerName ?? '').includes(convertAlias(searchKeyword.value))
        || convertAlias(t.assessorName ?? '').includes(convertAlias(searchKeyword.value))
      ));
    sortList(filteredTask, sort.value);
    return filteredTask;
  });

  const filterTasks = computed(() => {
    if (statuses.value.length == filterStatusIds.value.length) {
      return filterWithoutStatusTasks.value;
    } else {
      return filterWithoutStatusTasks.value
        .filter(t =>
          t.statusId && filterStatusIds.value.includes(t.statusId || '')
        );
    }
  }
  );

  const filterParentTasksOnly = computed(() => filterTasks.value.filter(t => !t.parentId));

  function updateTask(task: Task) {
    tasks.value = tasks.value.map(t => t.id === task.id ? task : t);
  }

  function addTask(task: Task) {
    tasks.value = [...tasks.value, task];
  }

  function addTasks(lstTask: Task[]) {
    tasks.value = [...tasks.value, ...lstTask];
  }

  function resetFilterStatus() {
    filterStatusId.value = 'ALL';
  }

  function refetchStatus() {
    findAllStatusGraphql().onResult(response => {
      statuses.value = sortBy(get(response, 'data.allStatus', []), 'orderNo');
    });
  }

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

  function canModifyTask(task: Task) {
    if (!task.statusId) {
      return false;
    }
    const taskStatusType = mapStatuses.value[task.statusId].type;
    if (!taskStatusType) {
      return false;
    }
    return [StatusType.CANCELED, StatusType.COMPLETED, StatusType.STOPPED].includes(taskStatusType);
  }

  return {
    boardType,
    tasks,
    filterTasks,
    filterParentTasksOnly,
    filterStatusId,
    filterStatusIds,
    filterCondition,
    searchKeyword,
    addTask,
    addTasks,
    updateTask,
    resetFilterStatus,
    statuses,
    statusesCount,
    filterWithoutStatusTasks,
    mapStatuses,
    mapStatusesCount,
    refetchStatus,
    sort,
    canModifyTask
  };
});