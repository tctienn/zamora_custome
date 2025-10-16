<template>
  <div class='flex-1'>
    <InputText
      v-model='searchKeyword'
      class='w-full'
      name='groupName'
      :placeholder='t(`chat.conversation.${isSelected ? "searchMember" : "searchUser"}`)'
      @keyup='emits("search-user", searchKeyword)'/>

    <div class='column-gap-3 flex flex-row mt-3'>
      <span class='font-bold'>
        {{ title }}
      </span>
      <ValidateErrorMessage
        v-if='memberErrors && memberErrors.length'
        :errors='memberErrors'/>
    </div>

    <div
      v-for='user in users'
      :key='user.id'
      class='align-items-center column-gap-2 cursor-pointer flex flex-row hover:bg-primary-50 p-2'
      @click='emits("select-user", user)'>
      <AppIcon
        v-if='typeof members !== "undefined"'
        :class='members.includes(user) ? "text-green-500" : "text-500"'
        :name='members.includes(user) ? "task_alt" : "radio_button_unchecked"'
        size='2'/>
      <AppIcon
        v-else
        :class='isSelected ? "text-green-500" : "text-500"'
        :name='isSelected ? "task_alt" : "radio_button_unchecked"'
        size='2'/>

      <div class='align-items-center column-gap-2 flex flex-row'>
        <ChatAvatar :item='user'/>
        <div class='flex flex-column'>
          <span>{{ user.fullName }}</span>
          <small>{{ user.email }}</small>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import { User } from '@/common/model/User';

defineProps({
  title: {
    type: String,
    default: ''
  },
  users: {
    type: Array as PropType<User[]>,
    default: () => []
  },
  members: {
    type: Array as PropType<User[]>,
    default: undefined
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  memberErrors: {
    type: Array as PropType<ErrorObject[]>,
    default: () => []
  }
});
const emits = defineEmits(['select-user', 'search-user']);

const { t } = useI18n();

const searchKeyword = ref('');

function clearSearchInput() {
  searchKeyword.value = '';
}

defineExpose({ clearSearchInput });

</script>

<script lang="ts">
export default { name: 'SelectUser' };
</script>