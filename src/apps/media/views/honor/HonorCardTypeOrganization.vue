<template>
  <div
    class='container gap-2'>
    <div class='avatar-container'>
      <AppGroupAvatar
        avatar-size='3.5'
        :number-avatar-display='5'
        :user-ids='organization?.users?.map((x:any) => x.id)'/>
    </div>
    <div class='font-bold'>{{ organization?.name }}</div>
    <div class='text-sm'>Tên công ty</div>
    <div
      class='align-items-center bg-pink-400 flex font-bold justify-content-between text-sm text-white w-full'
      style='height: 2.3rem'>
      <div></div>
      {{ honor?.title }}
      <div class='mr-2'>
        <AppIcon
          v-if='honor?.isHighlight'
          fill
          name='star'
          size='1.5'
          style='color: #ffca35'
          text/>
      </div>
    </div>
    <div class='created-date text-sm'>{{ moment(honor?.createdDate).format('DD.MM.YY') }}</div>
  </div>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import { type PropType, ref } from 'vue';

import { getUsersInOrganizationByCode } from '@/apps/media/graphql/honor';
import type { IHonor } from '@/apps/media/model/honor';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  organizationCode: {
    type: String,
    default: ''
  },
  honor: { type: Object as PropType<IHonor> }
});
const { moment } = useMoment();
const organization = ref();

const { onResult: getUsersInOrganizationByCodeResult } = getUsersInOrganizationByCode(props.organizationCode);

getUsersInOrganizationByCodeResult((res) => {
  organization.value = get(res, 'data.getUsersInOrganizationByCode');
});
</script>

<style scoped>
.container {
  text-align: center;
  background-color: var(--surface-0);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
}

.avatar-container {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.created-date {
  position: absolute;
  top: .5rem;
  right: .5rem;
}
</style>