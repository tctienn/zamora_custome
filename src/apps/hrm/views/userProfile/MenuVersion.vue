<template>
  <Menu
    :ref='refValue'
    class='border-none py-0'
    :model='menuDataVersion'
    popup>
    <template #item='{ item }'>
      <div
        class='border-b cursor-pointer flex flex-column gap-1 px-3 py-2 text-black-alpha-90'
        :class="[
          item.status === 'ACTIVE' ? 'bg-teal-100' : 'bg-yellow-100'
        ]">
        <div class='align-content-center flex gap-3'>
          <p class='flex font-semibold gap-2 items-center mb-0'>
            {{ item.status === PROFILE_STATUS.OLD ? 'Hồ sơ gốc' : `Lần thay đổi ${item.version - 1}` }}
          </p>
          <p
            v-if='item.createdTime'
            class='mb-0'>{{ formatDate(item.createdTime) }}</p>
        </div>

        <div
          v-if="item.status !== 'OLD'"
          class='text-sm'>
          Trạng thái:
          <span
            :class="[
              'font-bold',
              item.status === PROFILE_STATUS.DRAFT ? 'text-yellow-600'
              : 'text-red-500'
            ]">
            {{ statusProfile(item.status) }}
          </span>
        </div>
        <div
          v-if='item.approveTime'
          class='text-sm'>
          Thời gian: <i>{{ formatDate(item.approveTime) }}</i>
        </div>
        <div
          class='align-items-center flex justify-content-between text-sm'>
          <p v-if='item.approveBy'> Người duyệt: <b>{{ getDataUser(item.approveBy) }}</b></p>
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import type { PropType } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { PROFILE_STATUS } from '@/common/constants/profile';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  refValue: {
    type: String,
    default: '',
  },
  menuDataVersion: {
    type: Array as PropType<MenuItem[]>,
    default: () => [],
    required: true
  },
  currentSnapshotID: {
    type: String,
    default: '',
  }
});

const { moment } = useMoment();
const allUserDataStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(allUserDataStore);

const statusProfile = (status: string) => {
  switch (status) {
  case PROFILE_STATUS.ACTIVE:
    return 'Đã duyệt';
  case PROFILE_STATUS.DRAFT:
    return 'Bản nháp';
  case PROFILE_STATUS.PENDING:
    return 'Chờ duyệt';
  case PROFILE_STATUS.REJECTED:
    return 'Từ chối';
  default:
    return 'Bản gốc';
  }
};

const formatDate = (date: string) => {
  return moment(date).format('DD/MM/YYYY');
};

const getDataUser = (userID: string) => {
  const userName = allUsers.value.find((user: UserMoreInfo) => user.id === userID);
  return userName?.fullName ? userName.fullName : null;
};
</script>