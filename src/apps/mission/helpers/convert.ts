import moment from 'moment';
import type { TreeNode } from 'primevue/treenode';

import type { OrganizationInterface } from '@/apps/admin/model/organization';

import { getJobCode } from '../api/graphql/parameter-config';
import { type JobInput, type JobInterface, JobType } from '../model/job/job';
import { type IFileAttachment, missionTypeMap, type TreeOption } from '../model/mission/mission';

export function appendFilesToFormData(formData: FormData, files: IFileAttachment[]) {
  let localIndex = 0;
  let cloudIndex = 0;

  files.forEach((file) => {
    if (file.type === 'CLOUD') {
      const prefix = `ecmFiles[${cloudIndex}]`;
      cloudIndex++;

      formData.append(`${prefix}.fullName`, file.quote || '');
      if (file.downloadPath) {
        formData.append(`${prefix}.filePath`, file.downloadPath);
      }
      if (file.id) {
        formData.append(`${prefix}.id`, file.id);
      }
    } else {
      const prefix = `files[${localIndex}]`;
      localIndex++;

      formData.append(`${prefix}.quote`, file.quote || '');
      if (file.attachment instanceof File) {
        formData.append(`${prefix}.attachment`, file.attachment);
      }
      if (file.id) {
        formData.append(`${prefix}.id`, file.id);
      }
    }
  });
}

export function convertToTreeOptions<T>(
  data: T[] = [],
  getKey: (item: T) => string,
  getLabel: (item: T) => string,
  getChildren: (item: T) => T[] | undefined,
  currentId?: string
): TreeOption[] {
  return data.map((item) => {
    const key = getKey(item);
    const isSelf = currentId && key === currentId;
    return {
      key,
      value: key,
      label: getLabel(item),
      style: isSelf
        ? {
          color: '#495057',
          opacity: '0.6',
          pointerEvents: 'none',
        }
        : {},
      children: convertToTreeOptions(
        getChildren(item) ?? [],
        getKey,
        getLabel,
        getChildren,
        currentId
      ),
    };
  });
}

export function convertToOrganizationTreeNodesDepartmentUser(
  organizations: OrganizationInterface[],
  allowedIds: string[] = []
): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  organizations.forEach(org => {
    const isSelf = allowedIds.length > 0 && !allowedIds.includes(org.id);

    map.set(org.code, {
      key: org.id,
      label: org.name,
      children: [],
      level: 0,
      selectable: !isSelf,
      style: isSelf
        ? {
          color: '#495057',
          opacity: '0.6',
        }
        : {},
    });
  });

  organizations.forEach(org => {
    const node = map.get(org.code);
    if (node && org.parentCode) {
      const parent = map.get(org.parentCode);
      if (parent) {
        node.level = parent.level + 1;
        parent.children?.push(node);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      roots.push(node!);
    }
  });

  return roots;
}

export function formatMissionType(type: string): string {
  return missionTypeMap[type as keyof typeof missionTypeMap] ?? type;
}

export function findLabelById(tree: TreeNode[], id: string): string | undefined {
  for (const node of tree) {
    if (node.key === id) {
      return node.label;
    }
    if (node.children) {
      const found = findLabelById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export function getDeadlineColor(date: string | Date): string {
  if (!date) {
    return '';
  }

  const today = moment().startOf('day');
  const deadline = moment(date).startOf('day');

  if (deadline.isBefore(today)) {
    return '#FF3B30';
  } else if (deadline.isSame(today)) {
    return '#45A7DC';
  }

  return 'var(--sunface-overlay)';
}

export function cloneJob(job: JobInterface, jobType: JobType = JobType.ON_MISSION, jobCode: string) {
  const formData = new FormData();
  formData.append('jobName', `${job.jobName} (Copy)`);
  formData.append('jobCode', jobCode ?? '');
  formData.append('processingDeadline', job.processingDeadline ?? '');
  formData.append('description', job.description ?? '');
  formData.append('jobType', job.jobType ?? '');
  if(jobType === JobType.ON_MISSION){
    formData.append('activityId', job.activityId ?? '');
    formData.append('missionId', job.missionId ?? '');
    formData.append('budget', job.budget ?? '');
  }
  return formData;
}

export const getStatusSeverity = (status: string) => {
  switch (status) {
  case 'NEW':
    return {
      color: 'info',
      text: 'Tạo mới' 
    };
  case 'UNPROCESSED':
    return {
      color: 'warning',
      text: 'Chưa xử lý'
    };
  case 'IN_PROGRESS':
    return {
      color: 'primary',
      text: 'Đang triển khai'
    };
  case 'WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST':
    return {
      color: 'warning',
      text: 'Chờ gia hạn'
    };
  case 'COMPLETED':
    return {
      color: 'success',
      text: 'Hoàn thành'
    };
  case 'WAITING_FOR_ACCEPT':
    return {
      color: 'secondary',
      text: 'Chờ tiếp nhận'
    };
  }
};