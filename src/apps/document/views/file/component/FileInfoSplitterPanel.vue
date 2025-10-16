<template>
  <div class='flex justify-content-between p-3 w-full'>
    <AppUser
      avatar-size='2.5'
      info-visible
      name-visible
      :user-id='file?.createdBy'>
      <template #name='{ user }'>
        <span class='flex'>Người tạo:&nbsp;<strong>{{ user?.fullName }}</strong></span>
        <small class='flex flex-row gap-2 opacity-80'>
          Thời gian tạo:
          {{ moment(file?.createdTime).format("DD/MM/YYYY HH:mm") }}
        </small>
      </template>
    </AppUser>
    <div>
      <AppGroupAvatar
        v-if='file?.shareUser'
        avatar-size='2.5'
        :number-avatar-display='4'
        :user-ids='
          file?.shareUser?.map((item: any) => item.userId?.toString()) || []
        '/>
    </div>
  </div>
  <div>
    <TabViewFile
      :id='file?.id'
      :list-docs='listDocs'
      @reload="emits('reload')"/>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

import type { FileInterface } from '@/apps/document/model/file';
import TabViewFile from '@/apps/document/views/file/component/TabViewFile.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { FilesSystemData } from '@/common/model/attachment';

const props = defineProps({
  file: {
    type: Object as PropType<FileInterface>,
    default: undefined,
  },
  listDocs: {
    type: Array as PropType<FilesSystemData[]>,
    default: () => [],
  },
});
const emits = defineEmits(['reload']);
const file = computed(() => props.file);
const listDocs = computed(() => props.listDocs);
const { moment } = useMoment();
</script>

<style scoped></style>
