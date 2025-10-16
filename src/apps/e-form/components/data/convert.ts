import type { MongoFilterCondition } from '@/apps/e-form/model/data-source';

export function convertToMongoFilter(conditions?: MongoFilterCondition[]): Record<string, any> {
  const result: Record<string, any> = {};
  if (conditions) {
    for (const condition of conditions) {
      const {
        field,
        operator,
        value
      } = condition;

      if (!result[field]) {
        result[field] = {};
      }

      result[field][operator] = value;
    }
  }

  return result;
}