<template>
  <div
    class='flex flex-column row-gap-2'>
    <h5>{{ t('work.task.progress') }}</h5>
    <div class='p-fluid'>
      <div class='align-items-center flex'>
        <div class='col-2 font-bold'>
          <label>{{ t('work.task.status') }}</label>
        </div>

        <div class='col-4'>
          {{ task.statusName }}
        </div>

        <div class='col-2 font-bold'>
          <label>{{ t('work.task.progress') }}</label>
        </div>

        <div class='col-4'>
          {{ task.percent }}%
        </div>
      </div>
      <div
        v-if='taskFields.includes("checkLists")'
        class='col-12'>
        <TaskCheckList
          v-if='task.checkLists'
          v-model='task.checkLists'
          :editable='permission.isUpdateInfo'
          label-class='font-bold'>
          <template #icon>
            <AppIcon name='tv_options_edit_channels'/>
          </template>
        </TaskCheckList>
      </div>

      <div
        v-if='task.children?.length'
        class='col font-bold'>
        <i class='mr-2 pi pi-clone'/><label>{{
          t('work.task.childTask')
        }}</label>
      </div>

      <div
        v-for='(children, key) in task.children'
        :key='key'
        class='align-items-center flex ml-4'>
        <div>
          -{{ children['name'] }}
        </div>
      </div>

      <div
        v-if='taskFields.includes("locations")'
        class='col-12'>
        <TaskLocationComponent
          v-if='task.locations'
          v-model='task.locations'
          class='ml-4'
          label-class='font-bold'>
          <template #icon>
            <AppIcon name='map'/>
          </template>
        </TaskLocationComponent>
      </div>
      <div
        v-if='taskFields.includes("attachments")'
        class='col-12'>
        <AppFileAttachment
          :attachments='task.attachments'
          :disabled='!permission.isUpdateInfo'
          label-class='font-bold'
          :title='t("common.attachment")'
          @update-files='updateAttachments'>
          <template #icon>
            <AppIcon name='attach_file'/>
          </template>
        </AppFileAttachment>
      </div>

    </div>
  </div>
  <Divider/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { type PermissionTask } from '@/apps/work/model/permission';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import TaskCheckList from '@/apps/work/views/actions/components/task/TaskCheckList.vue';
import TaskLocationComponent from '@/apps/work/views/actions/components/task/TaskLocationComponent.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppFileAttachment from '@/common/components/app/upload/AppFileAttachment.vue';
import type { Attachment } from '@/common/model';

defineProps({
  taskFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});
const { t } = useI18n();
const taskAttachments = ref<Attachment[]>([]);
const files = ref<FileList>();

const { task } = storeToRefs(useTaskDetailStore());

function updateAttachments(attachments: Attachment[], fileUploads: FileList) {
  taskAttachments.value = attachments;
  files.value = fileUploads;
  task.value.files = files.value;
  task.value.taskAttachments = taskAttachments.value;
}
</script>

<script lang='ts'>
export default { name: 'GeneralInformationDetails' };
</script>

<style lang='scss' scoped>
:deep(.left-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>