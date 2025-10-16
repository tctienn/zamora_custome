<template>
  <div
    class='container gap-2'>
    <div class='avatar-container'>
      <AppAvatar
        :avatar='generateAvatarUrl(user?.avatar)'
        :error='user?.avatarError'
        :label='user?.fullName'
        size='4.8'/>
      <img
        v-if='template?.url'
        :alt='template?.name'
        class='honor-template'
        :src='template?.url'/>
    </div>
    <div class='font-bold'>{{ user?.fullName }}</div>
    <div class='text-sm'> {{ user?.positionName[0] || '' }}
      <template v-if='user?.positionName'> |</template>
      {{ formatOrganizations(user?.departments?.map((item: any) => item.name)) }}
    </div>
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

import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref, watch } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { IHonor } from '@/apps/media/model/honor';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  honor: { type: Object as PropType<IHonor> }
});
const { moment } = useMoment();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed((): UserMoreInfo => usersMoreInfo.value[props.userId]);

if (props.userId) {
  store.fetchUserMoreInfo(props.userId);
}

watch(() => props.userId, (userId) => {
  store.fetchUserMoreInfo(userId);
});

const templates = ref<{ name: string | undefined; url: string }[]>([]);
const template = ref<{ name: string | undefined; url: string } | null>(null);

const imageFiles = import.meta.glob('/public/images/honor-template/*.{jpg,png,svg}');

onMounted(() => {
  templates.value = Object.keys(imageFiles).map(file => ({
    name: file.split('/').pop(),
    url: file.replace('/public', '')
  }));
  template.value = templates.value.find(style => style.name === props.honor?.style) || null;
});

function formatOrganizations(orgs?: string[]) {
  return orgs?.join(', ');
}
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
}

.honor-template {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-container > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.created-date {
  position: absolute;
  top: .5rem;
  right: .5rem;
}
</style>