<template>
  <div class='border-round-sm card flex flex-column gap-2 p-4'>
    <span class='font-bold text-lg'>{{ quickSurvey?.questionContent }}</span>
    <div class='align-items-center flex justify-content-between'>
      <div class='align-items-center flex gap-2'>
        <AppIcon
          name='schedule'
          size='1.5'
          text/>
        {{ quickSurvey?.createdDate && moment(quickSurvey?.createdDate).format('DD/MM/YYYY') }}
      </div>
      <div
        class='cursor-pointer hover:underline text-blue-500'
        @click='userGroupDialogVisible = true'>
        {{ countTotalVotes() }} người đã tham gia bình chọn
      </div>
    </div>
    <div
      v-for='item in options'
      :key='item.id'
      class='align-items-center bg-primary-reverse flex mb-1 overflow-hidden relative rounded-md w-full'
      style='min-height: 42px'>
      <div
        class='absolute h-full left-0 top-0'
        :style='{ width: `${(getOptionCount(item.id) / countTotalVotes()) * 100}%`, backgroundColor: "#B3DF97" }'></div>
      <div class='align-items-center flex justify-content-between p-2 relative w-full'>
        <div class='font-medium'>
          {{ item?.content }}
        </div>
        <AppGroupAvatar
          avatar-size='2'
          :user-ids='getUserVote(item.id)'/>
      </div>
    </div>
    <div
      v-if='remainingTime > 0'
      class='align-items-center flex justify-content-between'>
      <div>Thời gian còn lại: <span class='font-bold'>{{ formattedTime }}</span></div>
      <ButtonIcon
        icon=''
        label='Bình chọn'
        @click='showForm = true'/>
    </div>
    <div
      v-if='quickSurvey.deadlineReply === null'
      class='align-items-center flex justify-content-between'>
      <div></div>
      <ButtonIcon
        icon=''
        label='Bình chọn'
        @click='showForm = true'/>
    </div>
  </div>

  <VotingCardDialog
    v-if='showForm'
    :id='quickSurvey.id'
    :list-count='listCount'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>

  <UserGroupDialog
    v-if='userGroupDialogVisible'
    :dialog-visible='userGroupDialogVisible'
    :users='users as User[]'
    @hide-dialog='userGroupDialogVisible = false'>
    <template
      v-if='$slots.header'
      #header>
      <slot name='header'>
      </slot>
    </template>

    <template
      v-if='$slots.userTile'
      #userTile='{user:user}'>
      <slot
        name='userTile'
        :user='user'>
      </slot>
    </template>
  </UserGroupDialog>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, type PropType, ref } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getOptionsQuickSurvey, getQuickSurveyById } from '@/apps/media/graphql/survey';
import type { QuickSurvey } from '@/apps/media/model/survey';
import VotingCardDialog from '@/apps/media/views/survey/components/VotingCardDialog.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import UserGroupDialog from '@/common/components/dialog/UserGroupDialog.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { User } from '@/common/model/User';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  listCount: {
    type: Array as PropType<any>,
    default: [] as any[]
  }
});

const userGroupDialogVisible = ref(false);
const { moment } = useMoment();
const showForm = ref(false);
const options = ref();
const quickSurvey = ref<QuickSurvey>({} as QuickSurvey);

if (props.id) {
  getQuickSurveyById(props.id).onResult((res) => {
    quickSurvey.value = res.data.getQuickSurveyById;
  });
  getOptionsQuickSurvey(props.id).onResult((res) => {
    options.value = res.data.getOptionsQuickSurvey;
  });
}

const listCount = computed(() => props.listCount);

const getOptionCount = (id: string) => listCount.value?.find((item: any) => item.optionId === id)?.listUser.length ?? 0;
const getUserVote = (id: string) => listCount.value?.find((item: any) => item.optionId === id)?.listUser ?? [];
const getAllUserVote = () => {
  return listCount.value?.flatMap((item: any) => item.listUser) ?? [];
};

const infoStore = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(infoStore);
const users = computed<UserMoreInfo[]>(() => getAllUserVote()
  ?.map((id: any) => usersMoreInfo.value[id])
  .filter((a: any) => a));

function countTotalVotes() {
  let totalVotes = 0;
  if (Array.isArray(listCount.value)) {
    for (const result of listCount.value) {
      if (result.listUser && Array.isArray(result.listUser)) {
        totalVotes += result.listUser.length;
      }
    }
  } else {
    return 0;
  }
  return totalVotes;
}

function hideDialogFn() {
  showForm.value = false;
}

const remainingTime = ref(0);
const intervalId = ref<any>();

const startCountdown = () => {
  const updateRemainingTime = () => {
    const deadline = new Date(quickSurvey.value.deadlineReply).getTime();
    const now = new Date().getTime();
    remainingTime.value = Math.max(0, deadline - now);
  };

  updateRemainingTime();

  intervalId.value = setInterval(updateRemainingTime, 1000);
};

onMounted(() => {
  startCountdown();
});

onBeforeUnmount(() => {
  clearInterval(intervalId.value);
});

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(remainingTime.value / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor(totalSeconds % (24 * 60 * 60) / (60 * 60));
  const minutes = Math.floor(totalSeconds % (60 * 60) / 60);

  return days > 0 ? `${days}ngày ${hours}giờ` : `${hours}giờ ${minutes}phút`;
});

</script>

<style scoped>

</style>