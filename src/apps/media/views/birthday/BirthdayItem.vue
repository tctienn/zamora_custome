<template>
  <div
    class='border-round-sm flex flex-column gap-2 p-2 py-4 relative surface-0 text-center text-primary'
    :class="
      checkBirthdayIsPass
        ? `${isInDashboard ? 'hover:bg-green-50' : 'bg-green-50'} border-green`
        : 'hover:bg-pink-50 border-pink'
    ">
    <AppAvatar
      :avatar='generateAvatarUrl(user?.avatar)'
      :error='user?.avatarError'
      :is-highlight='isToday'
      :label='user.fullName'
      :show-birthday-icon='isToday'
      size='3.5'/>
    <div class='font-bold'>{{ user?.fullName }}</div>
    <div class='text-sm'>
      <span>
        <template v-if='user?.positionName'>{{ user?.positionName[0] || '' }} | </template>
        {{ formatOrganizations(user?.organizationName) }}
      </span>
    </div>
    <div class='text-sm'>
      <span>{{
        upperFirst(
          moment(new Date(user?.birthDay).setFullYear(getYear())).format(
            'dddd',
          ),
        )
      }}</span>
      {{ ' ' }}
      <span class='font-bold'>{{
        moment(user?.birthDay).format('DD/MM')
      }}</span>
    </div>
    <div
      v-if='isToday'
      class='menu'>
      <div class='cursor-pointer flex gap-1 justify-content-around text-600'>
        <AppIcon
          v-tooltip.top="t('common.chat')"
          class='btn-icon'
          name='chat_bubble'
          size='1.4'/>
        <AppIcon
          v-tooltip.top="t('common.sendGreetingCard')"
          class='btn-icon'
          name='featured_seasonal_and_gifts'
          size='1.4'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { upperFirst } from 'lodash';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  user: {
    type: Object as PropType<UserMoreInfo>,
    required: true,
  },
  isToday: {
    type: Boolean,
    default: false,
  },
  isInDashboard: {
    type: Boolean,
    default: false,
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const getYear = () => {
  if (moment().month() + 1 <= moment(props.user?.birthDay).month() + 1) {
    return moment().year();
  } else {
    return moment().year() + 1;
  }
};
const checkBirthdayIsPass =
    moment().date() > moment(props.user?.birthDay).date()
    && moment().month() === moment(props.user?.birthDay).month();

function formatOrganizations(orgs?: string[]) {
  return orgs?.join(', ');
}
</script>

<style lang='scss' scoped>
.border-pink {
  border: 1px solid transparent;
}

.border-green {
  border: 1px solid transparent;
}

.border-pink:hover {
  border: 1px solid deeppink;

  .menu {
    visibility: visible;
  }
}

.menu {
  visibility: hidden;
  position: absolute;
  right: 0.5rem;
  bottom: 0.4rem;
}

.border-green:hover {
  border: 1px solid #27ab83;
}

.btn-icon:hover {
  color: #000000;
}
</style>
