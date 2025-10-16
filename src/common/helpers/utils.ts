import * as linkify from 'linkifyjs';
import { assign, isDate, isEmpty, map, random, toLower, trim, words } from 'lodash';
import moment from 'moment';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableExpandedKeys, TreeTableSelectionKeys } from 'primevue/treetable';
import { capitalize } from 'vue';

import {
  ACTIVITY_STATUSES,
  AVATAR_COLOURS,
  CONFIG_WORK_STATUSES, DateTimeFormat,
  GROUP_TYPE,
  TYPE_PRIVACY,
  WORK_SHIFT,
  WORKING_TIME
} from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import i18n from '@/common/i18n';
import { InformationDialogProperties, type SplitLinkContent } from '@/common/model';

const { t } = i18n.global;

export function getDomain() {
  let host = window.location.host;
  host = host.slice(0, host.indexOf('.'));
  if (host.indexOf(':') > 0) {
    host = host.slice(0, host.indexOf(':'));
  }
  return host;
}

export function hideInformationDialog(informationDialogProperties: InformationDialogProperties) {
  assign(informationDialogProperties, {
    type: '',
    title: '',
    message: '',
    show: false
  });
}

export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// export const dynamicDialogConfig = ({
//   props = {},
//   templates = {},
//   emits = {},
//   footerButtons = [],
//   data = {}
// }) => {
//   const defaultProps = {
//     header: '',
//     style: { 'min-width': '50vw' },
//     breakpoints: {
//       '960px': '75vw',
//       '640px': '90vw'
//     },
//     modal: true,
//     dismissableMask: true,
//     maximizable: true
//   };
//
//   const defaultTemplates = { footer: markRaw(DynamicDialogFooter) };
//
//   const defaultFooterButtons = {
//     closeButton: {
//       icon: 'close',
//       label: t('common.close'),
//       text: true,
//       severity: 'danger',
//       type: 'button'
//     },
//     actionButton: {
//       icon: 'check',
//       type: 'button',
//       text: true,
//     },
//     otherButtons: []
//   };
//
//   return {
//     props: merge(defaultProps, props),
//     templates: merge(defaultTemplates, templates),
//     data: {
//       footerButtons: merge(defaultFooterButtons, footerButtons),
//       ...data
//     },
//     emits
//   };
// };

export const generateHeaderDialog = (action: string, objectName: string, itemName: string) => {
  const object = toLower(isEmpty(objectName) ? '' : ' ' + t(objectName));
  const item = isEmpty(itemName) ? '' : ': ' + itemName;
  return `${action}${object}${item}`;
};

export const getStatuses = () => {
  return Object.keys(ACTIVITY_STATUSES).map((key) => {
    const status = ACTIVITY_STATUSES[key as keyof typeof ACTIVITY_STATUSES];
    return {
      label: t(`common.statuses.${toLower(status)}`),
      value: status
    };
  });
};

export const getWorkingTime = () => {
  return Object.keys(WORKING_TIME).map((key) => {
    const status = WORKING_TIME[key as keyof typeof WORKING_TIME];
    return {
      label: t(`common.workingTime.${toLower(status)}`),
      value: status
    };
  });
};

export const getWorkShift = () => {
  return Object.keys(WORK_SHIFT).map((key) => {
    const status = WORK_SHIFT[key as keyof typeof WORK_SHIFT];
    return {
      label: t(`common.workShift.${toLower(status)}`),
      value: status
    };
  });
};

export const getConfigWorkStatuses = () => {
  return Object.keys(CONFIG_WORK_STATUSES).map((key) => {
    const status = CONFIG_WORK_STATUSES[key as keyof typeof CONFIG_WORK_STATUSES];
    return {
      label: t(`common.statuses.${toLower(status)}`),
      value: status
    };
  });
};

export const getGroupType = () => {
  return Object.keys(GROUP_TYPE).map((key) => {
    const type = GROUP_TYPE[key as keyof typeof GROUP_TYPE];
    return {
      label: t(`common.groupType.${toLower(type)}`),
      value: type
    };
  });
};

export const getTypeOfPrivacy = () => {
  return Object.keys(TYPE_PRIVACY).map((key) => {
    const type = TYPE_PRIVACY[key as keyof typeof TYPE_PRIVACY];
    return {
      label: t(`common.typePrivacy.${toLower(type)}`),
      value: type
    };
  });
};

export const convertAlias = (str: string, toUpperCase = false) => {
  str = str ? str.trim().toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[\u0300\u0301\u0303\u0309\u0323]/g, '') // Huyền sắc hỏi ngã nặng
  // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u02C6\u0306\u031B]/g, '') : ''; // Â, Ê, Ă, Ơ, Ư

  return toUpperCase ? str.toUpperCase() : str;
};

export const mapEnum = (enumData: object) => {
  return (
        Object.keys(enumData).filter((v) =>
          !isNaN(Number(v)),
        ) as (keyof typeof enumData)[]
  ).map((key) => {
    return enumData[key];
  });
};

export const mapEnumString = (enumData: { [key: string]: string }): string[] => {
  return Object.keys(enumData).map((key) => {
    return enumData[key];
  });
};

export type ReType<T, K extends string> = T & { [P in K]?: ReType<T, K>[] }

interface TreeOption<T extends object> {
    id: keyof T;
    parentId: keyof T;
    children: keyof T;
}

interface TreeOption<T> {
    id: keyof T;
    parentId: keyof T;
    children: keyof T;
}

interface TreeOption<T> {
    id: keyof T;
    parentId: keyof T;
    children: keyof T;
}

export function listToTree<T extends Record<string, any>>(
  list: T[],
  options: TreeOption<T>
): any {
  const res: T[] = [];
  const nodeMap = new Map<T[typeof options.id], T>();

  // Xây dựng map chứa các node
  list.forEach((node: any) => {
    const nodeId = node[options.id];

    // Nếu node là UserSelectNext, cập nhật key với parentId
    if (node.data?.__typename === 'UserSelectNext') {
      node.key = `${node.parentId}_${node.key}`;
    }

    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, {
        ...node,
        [options.children]: []
      } as T);
    }

    const existingNode = nodeMap.get(nodeId)!;

    // Nếu node có children thì merge lại
    if (node[options.children]) {
      (existingNode[options.children] as T[]) = [
        ...(existingNode[options.children] as T[]),
        ...(node[options.children] as T[]),
      ];
    }
  });

  // Gán cha-con
  list.forEach((node: any) => {
    const nodeId = node[options.id];
    const parentId = node[options.parentId];

    // Nếu node là UserSelectNext, cập nhật key với parentId
    if (node.data?.__typename === 'UserSelectNext') {
      node.key = `${parentId}_${node.key}`;
    }

    if (parentId && nodeMap.has(parentId)) {
      (nodeMap.get(parentId)![options.children] as T[]).push(nodeMap.get(nodeId)!);
    } else {
      res.push(nodeMap.get(nodeId)!);
    }
  });

  return res;
}

export const expandTreeNodes = (trees: any, key: string) => {
  const expandedNodes: TreeTableExpandedKeys = {};

  function expandNode(node: TreeNode) {
    if (node.children?.length && node[key]) {
      if (!node.parentId) {
        expandedNodes[node[key]] = true;
      }
      for (const child of node.children) {
        expandNode(child);
      }
    }
  }

  for (const node of trees) {
    expandNode(node);
  }
  return { ...expandedNodes };
};

export const checkTreeNodes = (nodes: TreeNode[], selectedNodes: TreeSelectionKeys | TreeTableSelectionKeys, referenceData: string[]) => {
  function checkNode(node: TreeNode) {
    if (node.key) {
      if (node.children?.length) {
        const countCheck = (children: TreeNode[]) => {
          let count = 0;
          children.forEach((child) => {
            if (child.key && referenceData.includes(child.key)) {
              count++;
            }
          });
          return count;
        };

        const count = countCheck(node.children);
        if (count > 0) {
          (selectedNodes as TreeTableSelectionKeys)[node.key] = count === node.children.length
            ? {
              checked: true,
              partialChecked: false
            }
            : {
              checked: false,
              partialChecked: true
            };
        }

        for (const child of node.children) {
          checkNode(child);
        }
      } else {
        if (referenceData.includes(node.key)) {
          (selectedNodes as TreeTableSelectionKeys)[node.key] = {
            checked: true,
            partialChecked: false
          };
        }
      }
    }
  }

  for (const node of nodes) {
    checkNode(node);
  }
  return { ...selectedNodes };
};

export const convertReadableDate = (date: Date) => {
  return capitalize(useMoment().moment(date).format('DD/MM/YYYY HH:mm:ss'));
};

export const objectDataToQueryString: (obj: object) => string = (obj: object) => {
  const str = [];
  const keys = Object.keys(obj);
  for (const p in obj) {
    if (keys.indexOf(p) >= 0) {
      const c = obj[p as keyof typeof obj];
      if (typeof c === 'object' && !isDate(c)) {
        str.push(objectDataToQueryString(c));
      } else {
        str.push(encodeURIComponent(p) + '=' + (c != null ? encodeURIComponent(c) : ''));
      }
    }
  }
  return str.join('&');
};

export const extractAvatarLabel = (name: string | undefined, labelLength = 2) => {
  if (isEmpty(trim(name))) {
    return '';
  }
  const nameWords = words(name);
  if (nameWords.length === 1) {
    return nameWords[0].substring(0, labelLength);
  } else {
    return map(nameWords, (word: string) => word.substring(0, 1)).join('').substring(0, labelLength);
  }
};

export const extractAvatarBackgroundColor = (name: string | undefined) => {
  if (isEmpty(trim(name))) {
    return AVATAR_COLOURS[random(0, AVATAR_COLOURS.length)];
  }
  let colourIndex = 0;
  words(name).join('').split('').forEach(c => colourIndex += c.charCodeAt(0));
  return AVATAR_COLOURS[colourIndex % AVATAR_COLOURS.length];
};

export const decodeBase64Utf8 = (encodedString: string) => {
  return decodeURIComponent(atob(encodedString).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
};

export function randomSkeleton(from: number, to: number, unit: string) {
  return `${random(from, to, true)}${unit}`;
}

export function convertLinkContent(content: string): SplitLinkContent[] {
  const splitMessages: SplitLinkContent[] = [];

  const links = linkify.find(content);
  let startIndex = 0;

  if (links.length) {
    for (let i = 0; i < links.length; i++) {
      const link = links[i];

      if (startIndex < link.start) {
        splitMessages.push({
          isLink: false,
          text: content.substring(startIndex, link.start)
        });
        startIndex = link.start;
      }

      splitMessages.push({
        isLink: true,
        text: content.substring(link.start, link.end),
        href: link.href
      });
      startIndex = link.end;

      if (i === links.length - 1 && startIndex < content.length) {
        splitMessages.push({
          isLink: false,
          text: content.substring(startIndex, content.length)
        });
      }
    }
  } else {
    splitMessages.push({
      isLink: false,
      text: content
    });
  }

  return splitMessages;
}

export function getAvtColor(str: string): { backgroundColor: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLOURS.length;
  return { backgroundColor: AVATAR_COLOURS[index] };
}

export function formatDate(date: Date | string | undefined | null, format = 'DD/MM/YYYY HH:mm:ss') {
  if (date) {
    const m = moment(date);
    return m.format(format);
  }
  return '';
}

export function createOptions<T extends Record<string, any>>(
  enumObj: T,
  labelFn: (key: keyof T, value: T[keyof T]) => string = (key, _) => key.toString(),
  valueFn: (key: keyof T, value: T[keyof T]) => T[keyof T] = (_, value) => value,
  keyValueFun?: Record<string, (key: keyof T, value: T[keyof T]) => any>,
): Record<string, any>[] {
  return Object.entries(enumObj)
    .map(([key, value]) => {
      let rs = {};
      if (keyValueFun) {
        Object.entries(keyValueFun).forEach(([additionalKey, additionalValue]) => {
          rs = {
            ...rs,
            [additionalKey]: additionalValue(key, value)
          };
        });
      }
      return {
        label: labelFn(key as keyof T, value as T[keyof T]),
        value: valueFn(key as keyof T, value as T[keyof T]),
        ...rs,
      };
    });
}

export function deepDiffObjects(obj1: any, obj2: any, path = ''): string[] {
  const diffs: string[] = [];

  const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  for (const key of keys) {
    if (key === 'snapshotId') {
      continue;
    } // 👉 Bỏ qua snapshotId
    const value1 = obj1?.[key];
    const value2 = obj2?.[key];
    const currentPath = path ? `${path}.${key}` : key;

    const bothAreObjects = isObject(value1) && isObject(value2);
    const bothAreArrays = Array.isArray(value1) && Array.isArray(value2);

    if (bothAreObjects) {
      diffs.push(...deepDiffObjects(value1, value2, currentPath));
    } else if (bothAreArrays) {
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        diffs.push(currentPath);
      }
    } else {
      if (value1 !== value2) {
        diffs.push(currentPath);
      }
    }
  }

  return diffs;
}

function isObject(val: any) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

export const isChanged = (arrayToCheck: string[], path: string): boolean => {
  return arrayToCheck.includes(path) || arrayToCheck.some(item => item.includes(path));
};

export const assignIfExists = <T extends object>(
  target: T,
  key: keyof T,
  value: any,
  transformFn?: (val: any) => any
): void => {
  if (value != null) {
    target[key] = transformFn ? transformFn(value) : value;
  } else {
    delete target[key]; // Optional: xóa nếu không có giá trị
  }
};

export const formatCurrencyWithDigits = (value: number | null | undefined) => {
  if (value == null) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
  }).format(value);
};

export function formatToISOLocalDateTime(dateVal: string | Date | moment.Moment): string | null {
  let m;

  if (typeof dateVal === 'string') {
    // Try ISO first, then fallback to 'DD/MM/YYYY'
    m = moment(dateVal, moment.ISO_8601, true);
    if (!m.isValid()) {
      m = moment(dateVal, 'DD/MM/YYYY', true);
    }
  } else {
    m = moment(dateVal);
  }

  return m.isValid() ? m.format(DateTimeFormat.ISO_LOCAL_DATE_TIME) : null;
}
//TODO: Trường - install clipboard-polyfill lib