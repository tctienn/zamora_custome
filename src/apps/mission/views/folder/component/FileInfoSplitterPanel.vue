<template>
  <div class='flex justify-content-between p-3 w-full'>
    <AppUser
      avatar-size='2.5'
      info-visible
      name-visible
      :user-id='folder?.createdBy'>
      <template #name='{ user }'>
        <span class='flex'>Người tạo:&nbsp;<strong>{{ user?.fullName }}</strong></span>
        <small class='flex flex-row gap-2 opacity-80'>
          Thời gian tạo:
          {{ moment(folder?.createdTime).format('DD/MM/YYYY HH:mm') }}
        </small>
      </template>
    </AppUser>
    <div>
      <AppGroupAvatar
        v-if='folder?.shareUser'
        avatar-size='2.5'
        :number-avatar-display='4'
        :user-ids='
          folder?.shareUser?.map((item: any) => item.userId?.toString()) || []
        '/>
    </div>
  </div>
  <div>
    <TabViewFile
      :id='folder?.id'
      :folder='folder'
      :list-jobs='listJobs'
      @reload="emits('reload')"/>
  </div>
</template>

<script setup lang='ts'>
import { computed, type PropType } from 'vue';

import TabViewFile from '@/apps/mission/views/folder/component/TabViewFile.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  folder: {
    type: Object as PropType<any>,
    default: undefined,
  },
  listJobs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});
const emits = defineEmits(['reload']);
const folder = computed(() => props.folder);
const listJobs = computed(() => props.listJobs);
const { moment } = useMoment();
</script>

<style scoped></style>
