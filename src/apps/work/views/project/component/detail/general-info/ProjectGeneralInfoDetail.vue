<template>
  <div class='flex gap-6 p-1'>
    <div
      class='flex gap-2'
      style='width: 45rem'>
      <BoxInfo
        icon='checklist'
        :label="'Công việc'"
        :quantity='totalTask'
        severity='warning'>
      </BoxInfo>

      <BoxInfo
        icon='check_circle'
        :label="'Hoàn thành'"
        :quantity='completed'
        severity='success'>
      </BoxInfo>

      <BoxInfo
        icon='list'
        :label="'Đang thực hiện'"
        :quantity='onGoing'
        severity='info'>
      </BoxInfo>

      <BoxInfo
        icon='warning'
        :label="'Quá hạn'"
        :quantity='overdue'
        severity='danger'>
      </BoxInfo>
    </div>

    <div class='align-content-center flex-grow-1'>
      <span>
        {{ 'Tiến độ' }}
      </span>
      <ProgressBar
        class='mr-2'
        :pt='{
          root:{
            class:["bg-orange-400"]
          },
          value:{
            class:["bg-blue-400","relative"]
          },
          label:{
            class:["absolute"],
            style:{right:0}
          }
        }'
        style='height:1rem'
        :value='Math.ceil(project.progress)'></ProgressBar>
    </div>
  </div>

  <div
    class='flex flex-column gap-4 pl-4 relative'>
    <AvatarUploadOnly
      v-if='project.logo'
      :avatar-upload-size='{
        height:5,
        width:5,
        emptyIconSize:5,
        border:0.1
      }'
      :avatar-url='project.logo'
      class='absolute logo'
      empty-image-icon=''
      shape='rectangle'
      :tooltip='""'
      :view-only='true'></AvatarUploadOnly>
    <div class='align-items-center flex flex-row gap-2'>
      <div class='align-content-center align-items-center flex gap-2'>
        {{ t('work.project.createdBy') }}:
        <AppUser
          :name-visible='true'
          :user-id='project.createdBy'>
          <template #name='{user:user}'>
            <span
              class='flex font-semibold justify-content-start text-primary'>{{ user?.fullName }}</span>
          </template>
        </AppUser>
      </div>
      <RowInfo
        :info='moment(project.createdDate).format("DD/MM/YYYY")'
        is-date
        :label="t('work.project.createdDate')"/>
      <div></div>
    </div>
    <RowInfo
      :info='project.code'
      :label="t('work.project.code')"/>
    <RowInfo
      :info='project.name'
      :label="t('work.project.name')">
      <template #icon>
        <AppIcon
          name='bar_chart'
          size='1.5'>
        </AppIcon>
      </template>
    </RowInfo>
    <RowInfo
      :info='project.typeName'
      :label="t('work.project.type')"/>
    <RowInfo
      :info='project.groupName'
      :label="t('work.project.group')"/>
    <RowInfo
      :info='project.parentProjName'
      :label="t('work.project.parentProject')"/>
    <div class='flex flex-row gap-5'>
      <RowInfo
        class='w-6'
        :info='project.startDate?moment(project.startDate).format("DD/MM/YYYY"):""'
        :label="t('work.project.startDate')">
        <template #icon>
          <AppIcon
            name='schedule'
            size='1.5'>
          </AppIcon>
        </template>
      </RowInfo>
      <RowInfo
        class='w-6'
        :info='project.endDate?moment(project.endDate).format("DD/MM/YYYY"):""'
        is-date
        :label="t('work.project.endDate')"/>
    </div>

    <RowInfo
      :group-admin='true'
      :group-avatar='project.admins'
      :label="t('work.project.admins')"
      :project='project'
      :project-id='project?.id'>
      <template #icon>
        <AppIcon
          name='account_circle'
          size='1.5'>
        </AppIcon>
      </template>
    </RowInfo>
    <RowInfo
      :group-avatar='project.implementers'
      :label="t('work.project.implementers')"
      :project='project'
      :project-id='project?.id'/>
    <RowInfo
      :group-avatar='project.followers'
      :label="t('work.project.followers')"
      :project='project'
      :project-id='project?.id'/>

    <RowInfo
      :info='optionsRecipe.find((recipe) => recipe.value == project?.recipe?.type)?.label'
      :label="t('work.project.recipe')">
    </RowInfo>

    <RowInfo
      :label="t('work.project.label')"
      :labels='project.projectLabel'>
      <template #icon>

      </template>
    </RowInfo>

    <div>
      <div class='flex gap-1'>
        <AppIcon
          name='edit_note'
          size='1.5'></AppIcon>
        {{ t('work.project.description') }}:
      </div>
      <div>
        <div
          ref='descriptionRef'
          v-sanitize-html='project.description'
          class='description overflow-y-hidden white-space-pre-wrap word-break-break-word'
          :style="{ maxHeight: isExpanded ? 'none' : '5rem' }">
        </div>
        <div class='flex justify-content-end mr-3'>
          <AppIcon
            v-if='visibleViewMore || isExpanded'
            v-tooltip="t(isExpanded ? 'Ẩn bớt' : 'Xem thêm')"
            class='align-items-end border-round cursor-pointer hover:surface-hover surface-border'
            name='more_vert'
            size='1.6'
            @click='isExpanded=!isExpanded'/>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { nextTick, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BoxInfo from '@/apps/work/views/project/component/detail/general-info/BoxInfo.vue';
import RowInfo from '@/apps/work/views/project/component/detail/RowInfo.vue';
import { optionsRecipe, type ProjectInterface } from '@/apps/work/views/project/model';
import AppUser from '@/common/components/app/AppUser.vue';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  project: {
    type: Object as PropType<ProjectInterface>,
    required: true
  },
  totalTask: {
    type: Number,
    default: 0
  },
  completed: {
    type: Number,
    default: 0
  },
  onGoing: {
    type: Number,
    default: 0
  },
  overdue: {
    type: Number,
    default: 0
  }
});
const { t } = useI18n();
const { moment } = useMoment();

// const uniqueUserIds = computed(() => {
//   return new Set([...props.project?.admins || [], ...props.project?.implementers || [], ...props.project?.followers || []]).size;
// });
const visibleViewMore = ref<boolean>(false);
const isExpanded = ref(false);
const descriptionRef = ref<HTMLDivElement | null>(null);
const checkOverflow = () => {
  if (descriptionRef.value) {
    visibleViewMore.value =
        descriptionRef.value?.scrollHeight > descriptionRef.value?.clientHeight;
  }
};

watch(() => props.project?.description, () => {
  nextTick(checkOverflow);
}, { immediate: true });

</script>

<style lang='scss' scoped>

.logo {
  top: 1rem;
  right: 1rem;
}

</style>