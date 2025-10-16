<template>
  <div class='flex flex-column p-fluid row-gap-2'>
    <DynamicFields
      :dynamic-data-props='dynamicDataProps'
      :fields='taskDynamicFields'
      @update-dynamic-data='updateDynamicData'
      @update-file='updateFile'/>
  </div>
</template>

<script lang='ts' setup>
import { computed, type PropType } from 'vue';

import { DataType, Property } from '@/apps/admin/model/object/Property';
import { getFilesByIdsGraphql } from '@/apps/work/api/graphql/attachment-api';
import type { TaskExtend } from '@/apps/work/model/task';
import DynamicFields from '@/common/components/dynamicFields/DynamicFields.vue';
import type { Attachment } from '@/common/model';

const props = defineProps({
  taskDynamicFields: {
    type: Array as PropType<Property[]>,
    default: () => []
  },
  taskDynamicData: {
    type: Array as PropType<TaskExtend[]>,
    default: () => []
  }
});
const emits = defineEmits(['update-dynamic-data', 'update-file']);
const dynamicDataProps = computed(() => props.taskDynamicData?.reduce((result, item) => {
  switch (item.type) {
  case DataType.DATE :
  case DataType.DATETIME :
    result[item.fieldName] = new Date(item.value) ?? null;
    break;
  case DataType.INT:
    result[item.fieldName] = parseInt(item.value) ?? null;
    break;
  case DataType.FLOAT:
    result[item.fieldName] = parseFloat(item.value) ?? null;
    break;
  case DataType.MULTI_SELECT:
  case DataType.CHECK_BOX: {
    const strWithoutBrackets = item.value.slice(1, -1);
    result[item.fieldName] = strWithoutBrackets.split(', ');
  }
    break;
  case DataType.FILE: {
    if (item.value) {
      const strWithoutBrackets = item.value.slice(1, -1);
      const arrayOfStrings = strWithoutBrackets.split(', ');
      getFilesByIdsGraphql(arrayOfStrings)
        .onResult(res => {
          result[item.fieldName] = res.data.getFilesByIds;
        });
    }
    break;
  }
  default:
    result[item.fieldName] = item.value ?? null;
  }
  return result;
}, {} as { [key: string]: unknown }) as { [key: string]: unknown } ?? {} as { [key: string]: unknown });

function updateDynamicData(fieldName: string, inputData: unknown, type: DataType) {
  emits('update-dynamic-data', fieldName, inputData, type);
}

function updateFile(attachment: Attachment[], files: FileList) {
  emits('update-file', attachment, files);
}
</script>

<script lang='ts'>
export default { name: 'WorkInformationAdditionPanel' };
</script>