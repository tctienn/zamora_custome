<template>
  <div class='border-round-sm card h-full shadow-none'>
    <div class='border-bottom-1 font-bold p-3 surface-border'>
      <div class='flex justify-content-between'>
        <span>{{ t('admin.dashboard.dashboard.todayLoginUsers') }}</span>
        <span class='text-primary-500'>{{ loginUsersData.length }}</span>
      </div>
    </div>
    <div class='p-2'>
      <div
        class='flex flex-column gap-3 overflow-auto pr-2'
        style='height: 30rem'>
        <div
          v-for='(user, index) in loginUsersData'
          :key='index'
          class='align-items-center flex justify-content-between'>
          <div class='align-items-center flex gap-2'>
            <div>
              <AppAvatar
                :avatar='generateAvatarUrl(usersMoreInfo[user.userId]?.avatar)'
                :error='user?.avatarError'
                :label='user?.fullName'/>
            </div>
            <div>
              <div class='font-medium'>{{ user.fullName }}</div>
              <div class='text-500 text-sm'>{{ usersMoreInfo[user.userId]?.positionName.join(', ') }} {{
                (usersMoreInfo[user.userId]?.positionName.length > 0 && usersMoreInfo[user.userId]?.departments.length > 0) ? ' | ' : ''
              }} {{
                usersMoreInfo[user.userId]?.departments
                  ?.map((department: any) => department.name)
                  .join(', ')
              }}
              </div>
            </div>
          </div>
          <div class='text-500'>{{
            moment(user.time)
              .format('HH:mm DD/MM/YYYY')
          }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getLoggedTodayByOrgId } from '@/apps/admin/api/graphql/log-auth-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  selectedOrganization: {
    type: String,
    default: null
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const loginUsersData = ref<any>([]);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers();

const {
  onResult,
  refetch
} = getLoggedTodayByOrgId(props.selectedOrganization);

watch(() => props.selectedOrganization, () => {
  refetch({ organizationId: props.selectedOrganization });
});

onResult(res => {
  loginUsersData.value = cloneDeep(res.data.getLoggedTodayByOrgId);
});

</script>

<style scoped>
.card {
  background-color: var(--surface-card);
  height: 100%;
}

/* Ensure consistent height for user items */
.surface-100 {
  border-radius: 6px;
}
</style>