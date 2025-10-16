<template>
  <div v-if='isMultiple'>
    <MultiSelect
      v-model='selectedUserIds'
      display='chip'
      v-bind='$attrs'
      :option-label="'fullName'"
      :options='users'>
      <template #option='{ option }'>
        <AppUser
          avatar-size='3'
          info-visible
          :infos="['email', 'positionName']"
          name-visible
          :user-id='option?.id'/>
      </template>
      <template #chip='{ value }'>
        <AppUser
          avatar-size='1.5'
          name-visible
          :user-id='value?.id'/>
      </template>
    </MultiSelect>
  </div>
  <div v-else>
    <Dropdown
      v-model='selectedUserIds'
      :option-label="'fullName'"
      :options='users'>
      <template #option='{ option }'>
        <AppUser
          avatar-size='3'
          info-visible
          :infos="['email', 'positionName']"
          name-visible
          :user-id='option?.id'/>
      </template>
      <template #value='{ value }'>
        <AppUser
          avatar-size='1.5'
          name-visible
          :user-id='value?.id'/>
      </template>
    </Dropdown>
  </div>
</template>

<script lang="ts" setup>

import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import type { PropType } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';

defineProps({
  isMultiple: {
    type: Boolean,
    required: true
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => [],
  }
});
const selectedUserIds = defineModel<UserMoreInfo[] | UserMoreInfo>({ required: true });
</script>

<style scoped>

</style>