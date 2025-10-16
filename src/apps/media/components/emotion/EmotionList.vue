<template>
  <Dialog
    v-model:visible='visible'
    dismissable-mask
    modal>
    <template #container>
      <Card
        :pt='{
          content: {
            class: "p-0"
          }
        }'
        style='min-width: 20rem'>
        <template #header>
          <TabMenu
            class='border-round-top'
            :model='tabs'>
            <template #itemicon='{item}'>
              <span
                class='line-height-1 mr-1'
                style='font-family: Emoji,serif'>{{ item.icon }}</span>
            </template>
          </TabMenu>
        </template>
        <template #content>
          <div class='flex flex-column gap-1'>
            <div
              v-for='(emotion, index) in filterEmotions'
              :key='index'
              class='relative'>
              <AppUser
                avatar-size='3'
                info-visible
                :infos='["positionName", "departments"]'
                name-visible
                :user-id='emotion.userId'/>
              <div
                class='absolute'
                style='bottom: 0; left: 2rem; font-family: Emoji,serif'>{{ emotion.emotionType }}
              </div>
            </div>
          </div>

        </template>
      </Card>
    </template>

  </Dialog>
</template>

<script lang='ts' setup>
import { groupBy } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Emotion } from '@/apps/media/model/media';
import AppUser from '@/common/components/app/AppUser.vue';

const props = defineProps({
  emotions: {
    type: Array as PropType<Emotion[]>,
    required: true
  }
});
const { t } = useI18n();
const visible = defineModel<boolean>('visible', {
  type: Boolean,
  default: false
});

const tabs = computed((): MenuItem[] => {
  const map = Object.keys(groupBy(props.emotions, 'emotionType'))?.map(e => ({
    icon: e,
    label: '' + props.emotions.filter(em => em.emotionType === e).length,
    command() {
      type.value = e;
    },
  }));
  return [
    {
      label: t('common.all'),
      command() {
        type.value = 'all';
      },
    },
    ...map
  ];
});

const type = ref('all');

const filterEmotions = computed(() => {
  return props.emotions?.filter(e => type.value == 'all' || e.emotionType === type.value);
});

</script>

<style scoped>

</style>