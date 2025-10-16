<template>
  <Dialog
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {width: "50vw"}}'
    v-model:visible='visible'
    header='Cập nhật mô tả dự án'
    @hide='emits("hide-dialog")'>
    <div>
      <div class='field'>
        <label
          class='font-bold'>{{ t('work.project.description') }}</label>
        <AppEditor
          v-model='project.description'
          class='w-full'
          editor-style='height: 15rem;'>
        </AppEditor>
        <input
          v-model='project.description'
          hidden
          name='description'>
      </div>

      <div class='field'>
        <label
          v-required
          class='font-bold'>{{ t('work.project.implementers') }}</label>
        <NamedMultiSelectUser
          v-model='project.implementers'
          v-model:list-user='project.implementers'
          class='p-component'
          :disable='!((project.admins?.includes(user.id||"")) || (parameterProject?.addAssignee == true
            && project.implementers?.includes(user.id||"")))'
          name='implementers'
          :placeholder="`${t('common.choose')} ${t('work.project.implementers').toLowerCase()}`"
          :select-max='3'/>
      </div>

      <div class='field'>
        <label
          class='font-bold'>{{ t('work.project.followers') }}</label>
        <NamedMultiSelectUser
          v-model='project.followers'
          v-model:list-user='project.followers'
          class='p-component'
          :disable='!((project.admins?.includes(user.id||"")) || (parameterProject?.addFollower == true
            && project.implementers?.includes(user.id||"") == true))'
          name='followers'
          :placeholder="`${t('common.choose')} ${t('work.project.followers').toLowerCase()}`"
          :select-max='3'/>
      </div>
    </div>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-check'
        :label="t('common.save')"
        @click='updateDescription'/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getProjectById, updateDescriptionProject } from '@/apps/work/api/graphql/project';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-dialog']);

const { t } = useI18n();
const { parameterProject } = storeToRefs(useParameterConfigStore());

const { user } = storeToRefs(useUserStore());
const visible = ref(props.visibleDialog);
const project = ref<ProjectInterface>({} as ProjectInterface);

getProjectById(props.projectId).onResult((res) => {
  project.value = cloneDeep(res.data.getProjectById);
});

function updateDescription() {
  updateDescriptionProject().mutate({
    projectId: props.projectId,
    description: project.value.description,
    implements: project.value.implementers,
    followers: project.value.followers
  }).then(() => {
    toastSuccess({ message: 'Cập nhật mô tả dự án thành công.' });
    emits('hide-dialog');
  });
}

</script>

<script lang="ts">
export default { name: 'UpdateDescriptionDialog' };
</script>

<style scoped>

</style>