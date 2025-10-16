import { useI18n } from 'vue-i18n';

import { type ILog, type ObjectLogType, ProjectLogType } from '@/apps/work/model/projectLog';
import { TaskLogType } from '@/apps/work/model/workLog';
import {
  DiscussionMessageFactory,
  type MessageFactory,
  type MessageLog,
  ProjectAttachmentMessageFactory,
  ProjectMessageFactory
} from '@/apps/work/views/project/component/detail/log/MessageFactory';
import {
  TaskAttachmentMessageFactory,
  TaskDiscussionFactory,
  TaskMessageFactory
} from '@/apps/work/views/task/component/detail/activity/TaskMessageFactory';

export function genMessageLog(detail: ILog): MessageLog {
  const {
    action,
    objectType,
    oldValue,
    newValue
  } = detail;
  const factory = factoryMap[objectType];
  return factory?.getLog(action, oldValue, newValue || '', detail) ?? { fullMessage: '' };
}

export function getTranslation(key: string): string {
  const { t } = useI18n();
  return t(key);
}

export function extractJsonFields(jsonString: string): Record<string, never> {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return {};
  }
}

export interface Difference {
  message: string;
  field?: string;
  oldValue?: never;
  newValue?: never;
}

export function compareJsonFields(
  oldValue: string | Record<string, never>,
  newValue: string | Record<string, never>,
  getValueFields: string[] = [],
  translation?: (key: string) => string,
): { [key: string]: Difference } {
  let oldFields: Record<string, never> = {};
  let newFields: Record<string, never> = {};
  if (typeof oldValue == 'string') {
    oldFields = extractJsonFields(oldValue);
  } else {
    oldFields = oldValue;
  }
  if (typeof newValue == 'string') {
    newFields = extractJsonFields(newValue);
  } else {
    newFields = newValue;
  }

  const rs: { [key: string]: Difference } = {};

  Object.keys(newFields).forEach((key) => {
    if (!deepEqual(oldFields[key], newFields[key])) {
      const diff: Difference = {
        message: '',
        field: key,
        oldValue: oldFields[key],
        newValue: newFields[key]
      };
      const keyTranslation = getTranslation(translation ? translation(key) : `work.project.${key}`);
      if (!getValueFields.includes(key)) {
        diff.message = '';
      } else {
        const oldFieldValue = oldFields[key] ?? 'null';
        const newFieldValue = newFields[key];
        diff.message = `${keyTranslation}: <span class='font-semibold'>${oldFieldValue} -> ${newFieldValue}</span>`;
      }
      rs[key] = diff;
    }
  });

  return rs;
}

export function deepEqual(obj1: never, obj2: never): boolean {
  function isObject(obj: never): boolean {
    return obj !== null && typeof obj === 'object';
  }

  function arraysEqual(arr1: never[], arr2: never[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (!deepEqual(arr1[i], arr2[i])) {
        return false;
      }
    }
    return true;
  }

  if (obj1 === obj2) {
    return true;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return arraysEqual(obj1, obj2);
  }
  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

const factoryMap: Record<ObjectLogType, MessageFactory> = {
  [ProjectLogType.PROJECT]: new ProjectMessageFactory(),
  [ProjectLogType.DISCUSSION]: new DiscussionMessageFactory(),
  [ProjectLogType.WORK_ATTACHMENT]: new ProjectAttachmentMessageFactory(),
  [TaskLogType.TASK]: new TaskMessageFactory(),
  [TaskLogType.TASK_DISCUSSION]: new TaskDiscussionFactory(),
  [TaskLogType.TASK_ATTACHMENT]: new TaskAttachmentMessageFactory(),

};
