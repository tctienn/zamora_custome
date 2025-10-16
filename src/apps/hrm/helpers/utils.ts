import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import type { Ref } from 'vue';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import type { HrmCategory } from '@/apps/hrm/model/category';
import useMoment from '@/common/helpers/mixins/use-moment';

export const removeFields = (
  obj: Record<string, any>,
  fields: string[],
): Record<string, any> => {
  return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
    if (!fields.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
export const fetchCategoryMappingName = (type: string, targetRef: Ref) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => c.name) || [];
  });
};

export const fetchCategoryMappingNameWithId = (
  type: string,
  targetRef: Ref,
  payload: { labelProp: string; idProp: string }
) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    const items = res.data.getAllCategory as HrmCategory[] || [];

    targetRef.value = items.map((item) => ({
      value: item[payload.labelProp as keyof HrmCategory],
      id: item[payload.idProp as keyof HrmCategory],
    }));
  });
};

export function fetchCategory(type: string, targetRef: Ref) {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = res.data.getAllCategory as HrmCategory[] || [];
  });
}

export function getFetchCategory(type: string): Promise<any[]> {
  return new Promise((resolve) => {
    getAllCategory(userDeptRole.value, type).onResult((res) => {
      const data = (res.data.getAllCategory as any[]) || [];
      resolve(data);
    });
  });
}

export function correctModel(value: { [key: string]: any }) {
  const { moment } = useMoment();
  Object.keys(value).forEach((key) => {
    const element = value[key];
    if (['day', 'Day', 'date', 'Date'].some((keyword) => key.includes(keyword)) && element) {
      Object.assign(value, { [key]: moment(element as string).toDate() });
    }
  });
  return value;
}

export function convertToOrganizationTreeNodes(organizations: OrganizationInterface[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  organizations.forEach(org => {
    map.set(org.code, {
      key: org.id,
      label: org.name,
      children: [],
      level: 0
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

// Group timesheets by year, then by month within each year and return a sorted array structure
export function groupTimesheetsByYearAndMonth<T extends { year: number, month: number }>(timesheets: T[]) {
  // First, group the timesheets by year and month
  const grouped: { [year: number]: { [month: number]: T[] } } = {};
  
  timesheets.forEach(timesheet => {
    const year = timesheet.year;
    const month = timesheet.month;
    
    // Initialize year if not present
    if (!grouped[year]) {
      grouped[year] = {};
    }
    
    // Initialize month array if not present
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    
    // Add timesheet to the appropriate year/month group
    grouped[year][month].push(timesheet);
  });
  
  // Convert to sorted array structure: [{year: number, months: {month: number, timesheets: T[]}}]
  const result: { year: number, months: { month: number, timesheets: T[] }[] }[] = [];
  
  // Sort years in descending order (newest first)
  const sortedYears = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);
  
  sortedYears.forEach(year => {
    const yearData = grouped[year];
    const yearEntry = {
      year,
      months: [] as { month: number, timesheets: T[] }[]
    };
    
    // Sort months in descending order (newest first)
    const sortedMonths = Object.keys(yearData)
      .map(Number)
      .sort((a, b) => b - a);
    
    sortedMonths.forEach(month => {
      yearEntry.months.push({
        month,
        timesheets: yearData[month]
      });
    });
    
    result.push(yearEntry);
  });
  
  return result;
}