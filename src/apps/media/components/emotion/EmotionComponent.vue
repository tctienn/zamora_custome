<template>
  <div class='align-items-center flex gap-2'>
    <div>
      <EmojiInput
        v-for='emoji in showEmojis'
        :key='emoji'
        v-tooltip.top='tooltip'
        :content='emoji'
        :count='countEmotion(emoji)'
        :high-light='isHighLight(emoji)'
        @pointerenter='changeTooltip(emoji)'/>
      <Button
        v-ripple
        class='focus:shadow-none p-1'
        text
        @click='showMoreEmojis'>
        <span style='font-family: Emoji,serif'>•••</span>
      </Button>
    </div>

    <div
      v-if='emotions.length'
      class='cursor-pointer'
      @click='showList()'>
      <template v-if='haveCurrentUser()'>
        <span v-if='emotions.length - 1 > 0'>
          {{ t('media.common.emotions', { count: emotions.length - 1 }) }}
        </span>
        <span v-else>
          {{ t('media.common.selfEmotions') }}
        </span>
      </template>
      <template v-else>
        {{ t('media.common.otherEmotions', { count: emotions.length }) }}
      </template>
    </div>
  </div>
  <Menu
    ref='menuRef'
    :model='otherEmojis'
    popup
    :pt='{
      root: {
        style: "min-width: 0 !important;"
      }
    }'>
    <template #item='{label}'>
      <EmojiInput :content='label as string'/>
    </template>
  </Menu>
  <EmotionList
    v-model:visible='listVisible'
    :emotions='emotions'/>
</template>

<script lang='ts' setup>

import type { MenuItem } from 'primevue/menuitem';
import { computed, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import EmojiInput from '@/apps/media/components/emotion/EmojiInput.vue';
import EmotionList from '@/apps/media/components/emotion/EmotionList.vue';
import type { Emotion } from '@/apps/media/model/media';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  emotions: {
    type: Array as PropType<Emotion[]>,
    required: true
  }
});
const { t } = useI18n();
const { user } = useUserStore();
const listVisible = ref(false);
const {
  usersMoreInfo,
  fetchUserMoreInfo
} = useUserMoreInfoStore();
const allEmojis = ['👍', '👎', '❤️', '😂', '😢', '😡', '😲', '😍', '👏', '👌'];

const menuRef = ref();
const tooltip = ref<string>();

onMounted(() => {
  props.emotions?.forEach(e => fetchUserMoreInfo(e.userId));
});

const showEmojis = computed(() => {
  return new Set([...allEmojis.slice(0, 3), ...props.emotions.map(e => e.emotionType)]);
});

const otherEmojis = computed((): MenuItem[] => {
  return allEmojis.filter(e => !showEmojis.value.has(e)).map(e => ({ label: e }));
});

function changeTooltip(emoji: string) {
  tooltip.value = getTooltipText(emoji);
}

function getTooltipText(emoji: string) {
  return getUserIds(emoji).map(id => usersMoreInfo[id]?.fullName).join('\n');
}

function getUserIds(emoji: string) {
  return props.emotions.filter(e => e.emotionType === emoji).map(e => e.userId);
}

function isHighLight(emoji: string) {
  return props.emotions.some(e => e.emotionType === emoji && e.userId === user.id);
}

function countEmotion(emoji: string) {
  return props.emotions.filter(e => e.emotionType === emoji).length;
}

function showMoreEmojis(event: Event) {
  menuRef.value.toggle(event);
}

function haveCurrentUser() {
  return props.emotions.some(e => e.userId === user.id);
}

function showList() {
  listVisible.value = true;
}
</script>

<style scoped>

</style>