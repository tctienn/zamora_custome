<template>
  <div
    class='flex flex-column gap-3 kanban-item p-3 transition-duration-200 w-full'
    :draggable='true'
    style='border-radius: 2px'>
    <div class='align-items-center flex justify-content-between'>
      <div
        class='font-bold hover:text-blue-700'
        @click='showProjectDetail'>
        <AppIcon
          v-if='project?.isImportant'
          v-tooltip='"Dự án tôi thích"'
          class='text-yellow-500'
          fill
          name='kid_star'
          rounded
          size='1'
          text/>
        {{ project?.name }}
      </div>
      <ButtonIcon
        v-if="!isAdmin && !['PAUSE', 'CANCEL', 'CLOSE'].includes(project?.status)"
        class='align-self-start flex-shrink-0 p-1'
        icon='more_vert'
        rounded
        text
        @click='toggleActionMenu({event : $event})'/>
    </div>

    <LayoutImg
      v-if='project.images.length > 0'
      :imgs='project.images'/>

    <div
      v-if='false'
      style='min-height: 3rem'>
    </div>
    <div class='align-items-center flex justify-content-between'>
      <div class='flex gap-2'>
        <AppGroupAvatar
          v-if='project?.admins'
          avatar-size='2.5'
          :user-ids='project?.admins?.map((x:any) => x)'
          :users-highlight='project?.admins'/>
        <AppGroupAvatar
          v-if='project?.admins || project?.implementers'
          avatar-size='2.5'
          :user-ids='Array.from(new Set([...project?.admins?.map((x:any) => x),...project?.implementers?.map((x:any) => x)]))'/>
      </div>
      <div>
        <!--        <Knob-->
        <!--          :model-value='project?.progress || 0'-->
        <!--          range-color='SlateGray'-->
        <!--          :size='55'-->
        <!--          :stroke-width='10'-->
        <!--          value-color='MediumTurquoise'-->
        <!--          :value-template='(val: number): string => `${val}%`'/>-->
        <ProgressRing :progress='project?.progress || 0'/>
      </div>
    </div>
    <div class='flex justify-content-between'>
      <div>
        <div class='flex justify-content-between'>
          <div class='flex gap-2'>
            <div class='align-items-center flex'>
              <AppIcon
                v-tooltip='"Trao đổi"'
                name='chat_bubble'
                size='1.5'
                text/>
              {{ project.totalMessage }}
            </div>
            <div class='align-items-center flex'>
              <AppIcon
                v-tooltip='"File đính kèm"'
                name='attach_file'
                size='1.5'
                text/>
              {{ project.totalAttachment }}
            </div>
            <div class='align-items-center flex gap-1'>
              <AppIcon
                v-tooltip='"Công việc"'
                name='checklist'
                size='1.5'
                text/>
              {{ project?.totalTask }}
            </div>
          </div>
        </div>
      </div>
      <div class='align-items-center flex ml-2 text-right'>
        <AppIcon
          name='schedule'
          size='1.5'
          text/>

        <span
          class='flex'
          style='font-size: 10px'>
          {{
            project?.startDate ? moment(project?.startDate).format('DD/MM/YYYY') : ""
          }} {{ project?.endDate && project?.endDate ? " - " : "" }} {{
            project?.endDate ? moment(project?.endDate).format('DD/MM/YYYY') : ""
          }}
        </span>
      </div>
    </div>

  </div>
  <ProjectDetail
    v-model:visible='visibleDetail'
    :project-id='project.id || "" '>
  </ProjectDetail>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang="ts">

import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProjectById } from '@/apps/work/api/graphql/project';
import LayoutImg from '@/apps/work/views/data/components/kanban/LayoutImg.vue';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Event } from '@/common/model/widget/event';

const props = defineProps({
  project: {
    type: Object as PropType<any>,
    default: {} as any
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['refresh']);
const { moment } = useMoment();
const { t } = useI18n();
const menuAction = ref();
const visibleDetail = ref<boolean>(false);

function showProjectDetail() {
  visibleDetail.value = true;
}

function toggleActionMenu({ event, }: { event: Event }) {
  menuAction.value.toggle(event);
}

const openForm = inject('openForm', (id?: string) => void {});
const { mutate: deleteMutate, onDone: deleteOnDone } = deleteProjectById();

const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      openForm(props.project?.id);
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteProject();
    }
  },
  {
    label: t('work.project.copyProject'),
    icon: 'content_copy'
  }
];

function deleteProject() {
  deleteMutate({ projectId: props.project?.id });
}

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa dự án thành công') });
  emits('refresh');
});

watch(visibleDetail, (value) => {
  if (!value) {
    emits('refresh');
  }
});

</script>

<style lang="scss" scoped>
.kanban-item {
  background-color: var(--surface-a);
  touch-action: pan-x;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--surface-300);
  }
}
</style>