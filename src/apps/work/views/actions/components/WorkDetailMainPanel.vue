<template>
  <GeneralInformationDetails
    :permission='permission'
    :task-fields='taskFields'/>

  <ProgressDetails
    :permission='permission'
    :task-fields='taskFields'/>

  <WorkEvaluatingDetails/>

  <WorkInformationAdditionPanel
    :task-dynamic-data='task.extends'
    :task-dynamic-fields='taskDynamicFields'
    @update-dynamic-data='updateDynamicData'
    @update-file='updateDynamicFile'/>

  <Divider
    v-if='task.extends?.length'
    class='mx-1'
    layout='horizontal'/>

  <ExchangeLogDetails
    :permission='permission'/>

  <UpdateResultDialog
    :visible-dialog='visibleDialog'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';

import { DataType, Property } from '@/apps/admin/model/object/Property';
import type { PermissionTask } from '@/apps/work/model/permission';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import UpdateResultDialog from '@/apps/work/views/actions/components/dialogs/UpdateResultDialog.vue';
import ExchangeLogDetails from '@/apps/work/views/actions/components/ExchangeLogDetails.vue';
import GeneralInformationDetails from '@/apps/work/views/actions/components/GeneralInformationDetails.vue';
import ProgressDetails from '@/apps/work/views/actions/components/ProgressDetails.vue';
import WorkEvaluatingDetails from '@/apps/work/views/actions/components/WorkEvaluatingDetails.vue';
import WorkInformationAdditionPanel from '@/apps/work/views/actions/components/WorkInformationAdditionPanel.vue';
import type { Attachment } from '@/common/model';

defineProps({
  taskDynamicFields: {
    type: Array as PropType<Property[]>,
    default: () => []
  },
  dynamicFieldsParent: {
    type: Array as PropType<{ key: string, value: unknown, type: DataType }[]>,
    default: () => []
  },
  taskFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});

const emits = defineEmits(['update-dynamic-data', 'update-file']);
const { task } = storeToRefs(useTaskDetailStore());

const visibleDialog = ref();

function updateDynamicData(fieldName: string, inputData: unknown, type: DataType) {
  emits('update-dynamic-data', fieldName, inputData, type);
}

function updateDynamicFile(attachment: Attachment[], files: FileList) {
  emits('update-file', attachment, files);
}

</script>

<script lang='ts'>
export default { name: 'WorkDetailMainPanel' };
</script>

<style lang='scss' scoped>
:deep(.break-field-rule) {
  &.field {
    & > label {
      margin-bottom: 0;
    }

    input {
      min-width: 20rem;
    }

    .p-inputwrapper {
      min-width: 20rem;
    }
  }
}
</style>