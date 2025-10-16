<template>
  <div class='flex flex-column row-gap-3'>
    <!--    <div class='-m-3 align-self-end flex flex-column'>-->
    <!--      <ButtonIcon-->
    <!--        v-tooltip='t("common.close")'-->
    <!--        class='w-auto'-->
    <!--        icon='close'-->
    <!--        icon-size='1.5'-->
    <!--        rounded-->
    <!--        text-->
    <!--        @click='backMainSidebar'>-->
    <!--      </ButtonIcon>-->
    <!--    </div>-->

    <div class='align-items-center flex flex-row justify-content-between'>
      <div class='align-items-center column-gap-2 flex flex-row'>
        <ButtonIcon
          v-if='leftButton'
          v-tooltip='leftButton.label'
          :icon='leftButton.icon'
          icon-size='1.5'
          rounded
          text
          @click='leftButton.command'>
        </ButtonIcon>
        <AppIcon
          v-if='icon'
          :name='icon'
          size='1.5'/>
        <h5 class='m-0'>{{ title }}</h5>
        <ButtonIcon
          v-if='titleButton'
          v-tooltip='titleButton.label'
          :icon='titleButton.icon'
          icon-size='1.5'
          rounded
          text
          @click='titleButton.command'>
        </ButtonIcon>
      </div>

      <div class='column-gap-2 flex flex-row'>
        <ButtonIcon
          v-if='rightButton'
          v-tooltip='rightButton.label'
          :icon='rightButton.icon'
          icon-size='1.5'
          rounded
          text
          @click='rightButton.command'>
        </ButtonIcon>

        <ButtonIcon
          v-tooltip='t("common.close")'
          class='w-auto'
          icon='close'
          icon-size='1.5'
          rounded
          text
          @click='backMainSidebar'>
        </ButtonIcon>
      </div>

    </div>
  </div>

  <Divider class='mx-0 my-2'/>
</template>

<script setup lang='ts'>
import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';

defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  leftButton: {
    type: Object as PropType<{ icon: string, label: string, command: () => void }>,
    default: () => undefined
  },
  titleButton: {
    type: Object as PropType<{ icon: string, label: string, command: () => void }>,
    default: () => undefined
  },
  rightButton: {
    type: Object as PropType<{ icon: string, label: string, command: () => void }>,
    default: () => undefined
  }
});

const backMainSidebar = inject('back-main-sidebar', () => {
  return;
});

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'EcmGroupWidgetHeader' };
</script>