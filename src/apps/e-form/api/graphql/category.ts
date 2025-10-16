import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export const DYNAMIC_CATEGORY_GROUPS = gql`
  query DynamicCategoryGroups {
    dynamicCategoryGroups {
      code
      name
      parentCode
    }
  }
`;

export const DYNAMIC_CATEGORY_KEYS = gql`
  query DynamicCategoryKeys {
    dynamicCategoryKeys
  }
`;

export const CATEGORY_DATA_OPTIONS = gql`
  query CategoryDataOptions($group: String!, $filters: JSON) {
    categoryDataOptions(group: $group, filters: $filters)
  }
`;

function useDynamicCategoryGroups() {
  return useQuery(DYNAMIC_CATEGORY_GROUPS, null, { clientId: ADMIN_CLIENT_ID });
}

function useDynamicCategoryKeys() {
  return useQuery(DYNAMIC_CATEGORY_KEYS, null, { clientId: ADMIN_CLIENT_ID });
}

function useCategoryDataOptions(group: string, filters?: Record<string, any>) {
  return useQuery(
    CATEGORY_DATA_OPTIONS,
    {
      group,
      filters
    },
    { clientId: ADMIN_CLIENT_ID }
  );
}

export {
  useCategoryDataOptions,
  useDynamicCategoryGroups,
  useDynamicCategoryKeys
};