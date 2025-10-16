<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    :header="t('work.project.projectInfo')"
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
    }'
    :show-close-icon='false'
    style='width: 90%; height: 100%'
    @hide='closeDialogDetail'>
    <template #header>
      <div class='w-full'>
        <div class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 w-full'>
          <div class='align-items-center flex gap-1 max-h-3rem'>
            <Button
              class='border-round-sm h-2rem mr-2 py-1 w-2rem'
              icon='pi pi-arrow-left'
              severity='danger'
              @click='closeDialogDetail'/>
          </div>
          <div class='flex justify-content-between w-full'>
            <span class='font-bold text-lg'>
              {{ t('work.project.projectInfo') }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <div class='pt-2 relative'>
      <TabView
        :pt='{
          panelContainer: {
            class: "pb-0"
          }}'>
        <TabPanel
          :header="t('work.project.generalInfo')"
          :pt='{
            content: {
              "class": "p-1 surface-ground"
            }
          }'>
          <ProjectGeneralInfo
            v-if='projectId'
            :project='project'
            :project-id='projectId'></ProjectGeneralInfo>
        </TabPanel>
        <TabPanel :header="t('work.project.work')+ ' ('+totalTaskByRole +'/'+ project.totalTask+')'">
          <ProjectWork
            v-if='projectId'
            :project='project'
            :project-id='projectId'
            @total-task='getTotalTask'/>
        </TabPanel>
        <TabPanel
          :header="t('work.project.document')"
          :pt='{
            content: {
              "class": "p-1 surface-ground"
            }
          }'>
          <ProjectDocumentDetail
            v-if='projectId'
            :object-id='projectId'
            :project='project'></ProjectDocumentDetail>
        </TabPanel>
        <!--        <TabPanel :header='t("work.project.discussion")'>-->
        <!--          <ProjectDiscussion-->
        <!--            v-if='projectId'-->
        <!--            :project-id='projectId'>-->
        <!--          </ProjectDiscussion>-->
        <!--        </TabPanel>-->
        <!--        <TabPanel header='Báo cáo'></TabPanel>-->
        <TabPanel
          v-if='!disableModify'
          :header="t('Sự kiện')">
          <EventManager
            v-if='projectId'
            :project-id='projectId'/>
        </TabPanel>
        <TabPanel
          v-if='!disableModify'
          :header="t('work.project.activity')">
          <ProjectLog
            v-if='projectId'
            :project-id='projectId'></ProjectLog>
        </TabPanel>
      </TabView>
      <div class='flex gap-2 group-avatar'>
        <ButtonIcon
          v-model='isImportant'
          v-tooltip="'Dự án tôi thích'"
          :class="isImportant ? 'text-yellow-500' : 'text-black-alpha-20'"
          :fill='!!isImportant'
          icon='kid_star'
          icon-size='2'
          rounded
          text
          @click='changeImportantProject'/>

        <ButtonIcon
          class='text-black-alpha-20'
          icon='arrow_circle_down'
          icon-size='2'
          rounded
          text
          @click='toggleActionMenu({ event: $event })'/>

        <Menu
          ref='menuAction'
          :model='menuActionsFilter'
          :popup='true'>
          <template #item='{ item: { icon, label } }'>
            <MenuItem
              :icon='icon'
              :label='label'/>
          </template>
        </Menu>

        <Dropdown
          v-model='project.status'
          class='w-15rem'
          option-label='name'
          option-value='value'
          :options='statusOptions'
          :placeholder="t('common.selectStatus')"
          style='background: green'
          :style='{ background: getColorByStatusProject(project.status) }'
          @change='updateStatusProject($event)'>
          <template #option='slotOption'>
            <label
              :style='{
                color: getColorByStatusProject(slotOption.option.value),
              }'>
              {{ slotOption.option.name }}
            </label>
          </template>
        </Dropdown>

        <AppGroupAvatar
          :avatar-size="'2.5'"
          header='Danh sách thành viên'
          :number-avatar-display='5'
          :user-ids='
            Array.from(
              new Set([
                ...(project?.admins || []),
                ...(project?.implementers || []),
                ...(project?.followers || []),
              ]),
            )
          '
          :users-highlight='project?.admins'>
          <template #header>
            <div class='flex font-semibold'>
              <div class='w-6'>
                {{ t('work.project.joiner') }}
              </div>
              <div class='w-2'>
                {{ t('common.role') }}
              </div>
              <div class='w-2'>
                {{ t('work.common.views') }}
              </div>
              <div class='w-2'>
                {{ t('work.common.lastViewTime') }}
              </div>
            </div>
          </template>
          <template #userTile='{ user: user }'>
            <div class='flex w-full'>
              <div class='w-6'>
                <AppUser
                  avatar-size='2.5'
                  info-visible
                  :infos="['positionName', 'departments']"
                  :is-highlight='user.id && project.admins.includes(user.id)'
                  name-visible
                  :user-id='user.id'>
                </AppUser>
              </div>
              <div class='align-items-center w-2'>
                {{ user.id ? mapUserType.get(user.id)?.join(', ') : '' }}
              </div>
              <div class='align-items-center flex w-2'>
                <span
                  v-if='userViews?.find((u) => u.userId === user.id)?.views'
                  class='ml-2 number-user'>
                  {{ userViews?.find((u) => u.userId === user.id)?.views }}
                </span>
              </div>
              <div class='align-items-center flex w-2'>
                <span
                  v-if='
                    userViews?.find((u) => u.userId === user.id)?.lastViewTime
                  '>
                  {{
                    moment(
                      userViews?.find((u) => u.userId === user.id)
                        ?.lastViewTime,
                    ).format('HH:mm DD/MM/yyyy')
                  }}
                </span>
              </div>
            </div>
          </template>
        </AppGroupAvatar>
      </div>
    </div>

    <UpdateDescriptionDialog
      v-if='visibleUpdateDescriptionDialog'
      :project-id='props.projectId'
      :visible-dialog='visibleUpdateDescriptionDialog'
      @hide-dialog='visibleUpdateDescriptionDialog = false'/>

    <TagDialog
      v-if='visibleTagDialog'
      v-model:visible-dialog='visibleTagDialog'
      :selected-labels='selectedTags'
      @hide-dialog='visibleTagDialog = false'
      @save-label='saveLabels'/>

    <MeetingForm
      v-if='visibleFormEvent'
      :project-id='props.projectId'
      :visible-form='visibleFormEvent'
      @hide-dialog='hideDialog'/>

    <Sidebar
      v-model:visible='visibleForm'
      :dismissable='false'
      header='Nhân bản dự án'
      position='right'
      v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "40vw"}}'
      @hide='()=> closeDialog()'>
      <FormProject
        :id='projectId'
        :is-form-copy='true'
        @hide-dialog='()=> closeDialog()'>
      </FormProject>
    </Sidebar>
  </Sidebar>
</template>

<script lang='ts' setup>
import { camelCase, cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getProjectDetail, readProjectById, updateStatus, } from '@/apps/work/api/graphql/project';
import { saveProjectImportant } from '@/apps/work/api/graphql/project-important-api';
import { findProjectLabelByProjectId, saveProjectLabels } from '@/apps/work/api/graphql/project-label';
import { getViewsByProjectId } from '@/apps/work/api/graphql/project-log-api';
import { useTaskStore } from '@/apps/work/store/task';
import EventManager from '@/apps/work/views/project/component/detail/project-event/EventManager.vue';
import MeetingForm from '@/apps/work/views/project/component/detail/project-event/meeting/MeetingForm.vue';
import ProjectDocumentDetail from '@/apps/work/views/project/component/detail/ProjectDocumentDetail.vue';
import ProjectGeneralInfo from '@/apps/work/views/project/component/detail/ProjectGeneralInfo.vue';
import ProjectLog from '@/apps/work/views/project/component/detail/ProjectLog.vue';
import ProjectWork from '@/apps/work/views/project/component/detail/ProjectWork.vue';
import TagDialog from '@/apps/work/views/project/component/detail/TagDialog.vue';
import UpdateDescriptionDialog from '@/apps/work/views/project/component/detail/UpdateDescriptionDialog.vue';
import FormProject from '@/apps/work/views/project/component/FormProject.vue';
import { getColorByStatusProject, type ProjectInterface, StatusProject, } from '@/apps/work/views/project/model';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined,
  },
  totalTask: {
    type: Number,
    default: 0
  }
});
const emits = defineEmits<{
  (e: 'hide'): void,
}>();
const visibleForm = ref<boolean>(false);
const visibleFormEvent = ref<boolean>(false);
const selectedTags = ref();
const { t } = useI18n();
const statusOptions = ref<
  {
    value: string;
    name: string;
  }[]
>([]);
const project = ref<ProjectInterface>({} as ProjectInterface);
const isImportant = ref(false);
const projectImportantId = ref();
const disableModify = computed(() => ['CANCEL', 'CLOSE', 'COMPLETED'].includes(project.value.status));
provide('disableModifyInProject', computed(() => ['CANCEL', 'CLOSE', 'COMPLETED'].includes(project.value.status)));
const initStatus = ref<string>('');
const visibleUpdateDescriptionDialog = ref(false);
const visibleTagDialog = ref(false);
const totalTaskByRole = ref(0);
const { searchKeyword } = storeToRefs(useTaskStore());
const { user } = storeToRefs(useUserStore());
const {
  onResult: getLabelResult,
  load: getLabelLoad,
  refetch: getLabelRefetch
} = findProjectLabelByProjectId();

const {
  onResult: getProjectResult,
  load: getProjectLoad,
  refetch: getProjectRefetch
} = getProjectDetail();

getLabelResult((res) => {
  selectedTags.value = res.data.findProjectLabelByProjectId.map((projectLabel: any) => ({
    id: projectLabel.labelId,
    labelTitle: projectLabel.labelName,
    labelColor: projectLabel.labelColor
  }));
});

getProjectResult((res) => {
  project.value = cloneDeep(
    get(res, 'data.getProjectDetail') as ProjectInterface,
  );
  initStatus.value = project.value.status;
  isImportant.value = project.value?.projectImportant?.isImportant
    ? project.value?.projectImportant?.isImportant
    : false;
  projectImportantId.value = project.value?.projectImportant?.id
    ? project.value?.projectImportant?.id
    : null;
  readProjectById().mutate({ projectId: project.value.id });
});

function hideDialog() {
  visibleFormEvent.value = false;
}

function closeDialogDetail() {
  emits('hide');
  searchKeyword.value = '';
}

function getTotalTask(numbTask: number) {
  totalTaskByRole.value = numbTask;
}

const userViews =
  ref<{ userId: string; views: number; lastViewTime: string }[]>();

watch(() => props.projectId, () => {
  if (props.projectId) {
    getViewsByProjectId(props.projectId).onResult((param) => {
      userViews.value = param.data.getViewsByProjectId;
    });

    getLabelLoad(undefined, { projectId: props.projectId });

    getProjectLoad(undefined, { id: props.projectId });
  }
},
{ immediate: true },
);
const { moment } = useMoment();
statusOptions.value = Object.keys(StatusProject)
  .filter((e) => e != 'ALL')
  .map((e: string) => {
    return {
      value: e,
      name: t(`work.project.statusProject.${camelCase(e)}`),
    };
  });

const menuAction = ref();

function closeDialog() {
  visibleForm.value = false;
}

const menuActions = [
  {
    key: 'export',
    label: 'Export công việc',
    icon: 'exit_to_app',
    command: () => {
    },
  },
  {
    key: 'addEvent',
    label: 'Thêm sự kiện',
    icon: 'calendar_add_on',
    command: () => {
      visibleFormEvent.value = true;
    },
  },
  {
    key: 'editDescription',
    label: 'Cập nhập mô tả dự án',
    icon: 'edit_document',
    command: () => {
      visibleUpdateDescriptionDialog.value = true;
    },
  },
  {
    key: 'copy',
    label: 'Nhân bản dự án',
    icon: 'file_copy',
    command: () => {
      // copyProject().mutate({ projectId: props.projectId }).then((res) => {
      //   toastSuccess({ message: 'Nhân bản dự án thành công.' });
      // });
      visibleForm.value = true;
    },
  },
  {
    key: 'tag',
    label: 'Gán nhãn',
    icon: 'sell',
    command: () => {
      visibleTagDialog.value = true;
    },
  },
];

let menuActionsFilter = ref();

function toggleActionMenu({ event }: { event: Event }) {
  menuActionsFilter.value = menuActions;
  menuAction.value.toggle(event);
}

const visible = defineModel<boolean>('visible', { default: false });

const mapUserType = computed<Map<string, string[]>>(() => {
  const rs = new Map<string, string[]>();
  project.value?.admins?.forEach((e) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.admin')]),
  );
  project.value?.implementers?.forEach((e) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.implement')]),
  );
  project.value?.followers?.forEach((e) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.follow')]),
  );
  return rs;
});

function updateStatusProject(event: any) {
  updateStatus()
    .mutate({
      projectId: props.projectId,
      status: event.value,
    })
    .then(() => {
      toastSuccess({ message: 'Đã cập nhật trạng thái dự án thành công.' });
    }).catch((err) => {
      project.value.status = initStatus.value;
      toastError({ message: t('work.project.errors.' + err.graphQLErrors[0].extensions.errorCode) });
    });
}

function changeImportantProject() {
  isImportant.value = !isImportant.value;

  saveProjectImportant()
    .mutate({
      project: {
        isImportant: isImportant.value,
        userId: user.value.id,
        projectId: props.projectId,
      },
    })
    .then((res: any) => {
      toastSuccess({
        message:
          res.data.saveProjectImportant.isImportant == true
            ? 'Bạn đã thay đổi dự án này thành dự án quan trọng.'
            : 'Dự án này không còn là dự án quan trọng với bạn.',
      });
    });
}

function saveLabels(data: any) {
  saveProjectLabels().mutate({
    projectLabels: data.map((d: any) => ({
      projectId: props.projectId,
      labelId: d.id,
      labelName: d.labelTitle,
      labelColor: d.labelColor
    }))
  }).then(() => {
    toastSuccess({ message: 'Gán nhãn vào dự án thành công.' });
    getLabelLoad(undefined, { projectId: props.projectId }) || getLabelRefetch();
    getProjectLoad(undefined, { id: props.projectId }) || getProjectRefetch();
    visibleTagDialog.value = false;
  });
}

function refreshProjectDetail() {
  getProjectRefetch();
}

onMounted(() => {
  EventBus.on('refreshProjects', refreshProjectDetail);
});

onUnmounted(() => {
  EventBus.off('refreshProjects', refreshProjectDetail);
});
</script>

<script lang='ts'>
export default { name: 'ProjectDetail' };
</script>

<style scoped>
.group-avatar {
  position: absolute;
  top: 0.25rem;
  right: 1.5rem;
  z-index: 1001;
}

:deep(.p-tabview-nav-container) {
  width: 100%;
  position: fixed;
  z-index: 1000;
}

:deep(.p-tabview-panels) {
  padding-top: 4rem;
  padding-right: 0;
}
:deep(.p-tabview-nav-link.p-tabview-header-action) {
  padding: 1rem;
  align-items: center;
}
</style>
