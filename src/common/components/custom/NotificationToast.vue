<template>
  <Toast
    group='notification'
    position='bottom-right'>
    <template #message='{message}'>
      <div class='flex flex-column flex-grow-1 gap-2'>
        <AppUser
          avatar-size='2.5'
          name-visible
          :user-id='message.detail.fromUserId'/>
        <div class='flex flex-column gap-1'>
          <div class='font-bold'>{{ message.detail.title }}</div>
          <div class=''>{{ message.detail.content }}</div>
        </div>
        <div class='flex justify-content-between'>
          <Chip
            class='font-semibold px-2 py-1 text-sm'
            :class='message.detail.module ? getChipColorClass(message.detail.module) : ""'>
            {{ t('system.menu.' + camelcase(message.detail.module)) }}
          </Chip>
          <span class='text-primary-300 text-sm'>{{ diffDuration(message.detail.time) }}</span>
        </div>
      </div>
    </template>
  </Toast>
</template>

<script lang='ts' setup>

import camelcase from 'camelcase';
import { useI18n } from 'vue-i18n';

import AppUser from '@/common/components/app/AppUser.vue';
import { getChipColorClass } from '@/common/helpers/color-util';
import { diffDuration } from '@/common/helpers/time-util';

const { t } = useI18n();
</script>

<style scoped>

</style>