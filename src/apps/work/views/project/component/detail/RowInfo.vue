<template>
  <div class='align-items-center flex flex-row gap-2'>
    <div
      class='align-items-center flex flex-row gap-1'
      :style='!isDate && "min-width: 10rem"'>
      <slot name='icon'></slot>
      {{ label }}:
    </div>
    <div
      v-if='groupAvatar.length === 0'
      class='font-semibold'>{{ info }}
    </div>

    <div v-if='labels.length > 0'>
      <Chip
        v-for='(labelVar, index) in labels'
        :key='index'
        class='mr-2'
        :label='labelVar.labelName'
        :outlined='true'
        :style="{
          backgroundColor: 'white',
          border: '1px solid ' + labelVar.labelColor,
          color: labelVar.labelColor
        }"/>
    </div>
    <AppGroupAvatar
      v-else
      avatar-size='2.5'
      :user-ids='groupAvatar'
      :users-highlight='groupAdmin?groupAvatar:[]'>
      <!--      <template #userTile='{user:user}'>-->
      <!--        <AppUser-->
      <!--          avatar-size='2.5'-->
      <!--          info-visible-->
      <!--          :infos='["positionName", "departments"]'-->
      <!--          name-visible-->
      <!--          :user-id='user.id'>-->
      <!--        </AppUser>-->
      <!--      </template>-->
      <template #header>
        <div class='flex font-semibold gap-4'>
          <div class='w-7'>
            {{ t("work.project.joiner") }}
          </div>
          <div class='w-2'>
            {{ t("common.role") }}
          </div>
          <div class='w-2'>
            {{ t("work.common.views") }}
          </div>
          <div class='pl-3 w-3'>
            {{ t("work.common.lastViewTime") }}
          </div>
          <div style='width: 21px'></div>
        </div>
      </template>

      <template #userTile='{ user: user }'>
        <div class='flex gap-5 w-full'>
          <div class='flex w-7'>
            <AppUser
              avatar-size='2.5'
              info-visible
              :infos="['positionName', 'departments']"
              name-visible
              :user-id='user.id'>
            </AppUser>
          </div>
          <div class='align-items-center flex w-2'>
            <span>
              {{ user.id ? mapUserType.get(user.id)?.join(", ") : "" }}
            </span>
          </div>
          <div class='align-items-center flex w-2'>
            <span
              v-if='userViews?.find((u) => u.userId === user.id)?.views'
              class='ml-2 number-user'>
              {{ userViews?.find((u) => u.userId === user.id)?.views }}
            </span>
          </div>
          <div class='align-items-center flex w-3'>
            <span
              v-if='
                userViews?.find((u) => u.userId === user.id)?.lastViewTime
              '>
              {{
                moment(
                  userViews?.find((u) => u.userId === user.id)
                    ?.lastViewTime,
                ).format("HH:mm DD/MM/yyyy")
              }}
            </span>
          </div>
        </div>
      </template>
    </AppGroupAvatar>
  </div>
</template>

<script setup lang="ts">

import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findProjectLabelByProjectId } from '@/apps/work/api/graphql/project-label';
import { getViewsByProjectId } from '@/apps/work/api/graphql/project-log-api';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  info: {
    type: [String, Number, Date],
    default: ''
  },
  isDate: {
    type: Boolean,
    default: false
  },
  groupAvatar: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  groupAdmin: {
    type: Boolean,
    default: false,
  },
  project: {
    type: {} as any,
    default: null
  },
  projectId: {
    type: String,
    default: null
  },
  labels: {
    type: [] as any[],
    default: []
  }
});
const { moment } = useMoment();
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const { onResult: getLabelResult, load: getLabelLoad, refetch: getLabelRefetch } = findProjectLabelByProjectId();
const mapUserType = computed<Map<string, string[]>>(() => {
  const rs = new Map<string, string[]>();
  props.project?.admins?.forEach((e: any) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.admin')]),
  );
  props.project?.implementers?.forEach((e: any) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.implement')]),
  );
  props.project?.followers?.forEach((e: any) =>
    rs.set(e, [...rs.get(e) || [], t('work.project.follow')]),
  );
  return rs;
});

const userViews =
    ref<{ userId: string; views: number; lastViewTime: string }[]>();
watch(
  () => props.projectId,
  () => {
    if (props.projectId) {
      getViewsByProjectId(props.projectId).onResult((param) => {
        userViews.value = param.data.getViewsByProjectId;
      });
    }
  },
  { immediate: true },
);
const { t } = useI18n();
</script>

<style scoped>

</style>