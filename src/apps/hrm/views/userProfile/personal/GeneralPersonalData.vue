<template>
  <div class='flex gap-2 general-data p-2 pr-4 surface-card text-primary'>
    <div class='avt flex-none'>
      <!--      {{-->
      <!--        props.userData?.workProcessInternal.map((w) => ({-->
      <!--          fromDate: w.fromDate,-->
      <!--          toDate: w.toDate-->
      <!--        }))-->
      <!--      }}-->
      <img
        v-if='!previewAvatar'
        alt='Profile Image'
        class='cursor-pointer w-full'
        src='@/common/assets/images/avatar-default.png'
        style='max-height: 80px'/>

      <img
        v-else
        alt='Profile Image'
        class='cursor-pointer object-fit-contain w-full'
        :src='generateAvatarUrl(previewAvatar) as string'
        style='max-height: 80px'>
    </div>
    <div class='flex-1 sum-info'>
      <p class='font-bold mb-0'>{{ props.userData?.general?.fullName }}</p>
      <div class='align-items-center flex justify-content-between'>
        <div>
          <span>{{ props.userData?.general?.code }}</span>
          <span v-if='props.userData?.general?.managerCode'>| {{ props.userData?.general?.managerCode }}</span>
          <p>{{ props.userData?.education?.currentPosition }} |
            {{ props.userData?.workProcessInternal && props.userData?.workProcessInternal[0].organizationName }}</p>
        </div>
        <div>
          <span>{{
            t('hrm.profile.personal.datetimeJoin')
          }}: <b>{{ formatDate(props.userData?.general?.joinDate as string) }}</b></span>
          <p>{{ t('hrm.profile.personal.timeMember') }}: <b>{{ seniority }}</b></p>
        </div>
        <div v-if='workProcessInternals[0]'>
          <span>Ngày bổ nhiệm gần nhất : <b>{{ formatDate(workProcessInternals[0]?.lastModifiedTime) }}</b></span>
          <p>Hợp đồng đang hiệu lực: <b>{{ contract.code }}</b></p>
        </div>
        <div>
          <div
            v-if='hasChanged'
            class='bg-pink-50 border-1 border-dashed border-red-400 border-round px-4 py-2 text-red-400'>
            {{ t('hrm.profile.profileHasChanged') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Employee } from '@/apps/hrm/model/employee';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { calculateTotalWorkTime } from '@/common/helpers/work-time-calculator';

const props = defineProps({
  userData: {
    type: Object as PropType<Employee>,
    default: () => {
    }
  },
  contract: {
    type: Object,
    default: () => {
    }
  },
  hasChanged: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();
const { t } = useI18n();
const seniority = computed(() => {
  return calculateTotalWorkTime(props.userData?.workProcessInternal);
});

const previewAvatar = ref(props.userData?.general?.avatar || '');

watch(
  () => props.userData?.general?.avatar,
  (newAvatar) => {
    previewAvatar.value = newAvatar || '';
  },
  { immediate: true }
);
const workProcessInternals = inject('dataWorkProcess', ref<any[]>([]));
const formatDate = (date: string | undefined) => {
  if (!date) {
    return '';
  }
  return moment(date).format('DD/MM/YYYY');
};

</script>

<style scoped>
::v-deep(.status-badge) {
  text-transform: unset !important;
}

.general-data {
  border-radius: 5px;
}
</style>