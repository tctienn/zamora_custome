<template>
  <div>
    <div class='align-items-center flex justify-content-between pb-1'>
      <div class='align-items-center flex'>
        <AppIcon
          name='sell'
          size='1.5'
          text/>
        <label
          class='font-bold'>{{ t(`media.common.${lowerCase(props.mediaType)}.subAnnouncement`) }}</label>
      </div>

      <ButtonIcon
        v-if='!isView'
        v-tooltip="'Chọn thông báo liên quan'"
        icon='add_circle'
        icon-size='1.5'
        rounded
        style='margin-left:auto'
        text
        @click='showDialogFn'/>
      <input
        hidden
        multiple
        name='fileAttachments'
        type='file'/>
    </div>

    <input
      hidden
      name='subMedias'
      type='text'
      :value='subMediaFromDB'>

    <div
      v-for='media of subMedia'
      :key='media.id'
      class='align-items-center file-row flex h-3rem hover:surface-hover p-2'>

      <div
        v-if='isView'>
        <router-link :to='{name: `Media${startCase(camelCase(mediaType))}Detail`, params :{id: media.id} }'>&#8226; {{
          media.title
        }}
        </router-link>
      </div>
      <div
        v-else
        class='align-items-center flex flex-1 gap-2'>
        <i v-if='isView'>&#8226;</i> {{ media.title }}
      </div>
      <div class='align-items-center flex gap-2 justify-content-end w-5rem'>
        <ButtonIcon
          v-if='!isView'
          v-tooltip.left='t("media.common.delete")'
          class='btnAction'
          icon='delete'
          icon-size='1.5'
          rounded
          text
          @click='deleteSubMedia(media.id)'/>
      </div>
    </div>
  </div>
  <ListSubAnnouncement
    v-if='showDialog'
    :announcement-id='props.id'
    :media-type='mediaType'
    :sub-list='subMedia'
    :visible-dialog='showDialog'
    @hide-dialog='hideDialogFn'
    @update:list-announcement='updateMedias'/>
</template>

<script setup lang="ts">

import { camelCase, lowerCase, startCase } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { IAnnouncement } from '@/apps/media/model/announcement';
import type { IMedia, MediaType } from '@/apps/media/model/media';
import ListSubAnnouncement from '@/apps/media/views/announcement/ListSubMedia.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const props = defineProps({
  isView: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String as PropType<MediaType>,
    default: null
  },
  subMedia: {
    type: Array as PropType<IMedia[]>,
    default: null
  },
  subMediaFromDB: {
    type: Array as PropType<string[]>,
    default: null
  }
});

const emits = defineEmits(['update:subMedia', 'update:subMediaFromDB']);

const { t } = useI18n();
const showDialog = ref(false);

function showDialogFn() {
  showDialog.value = true;
}

function updateMedias(data: IAnnouncement[]) {
  emits('update:subMedia', data);
  emits('update:subMediaFromDB', data.map((x) => x.id));
}

function hideDialogFn() {
  showDialog.value = false;
}

function deleteSubMedia(id?: string) {
  emits('update:subMedia', props.subMedia?.filter((x) => x.id != id));
  emits('update:subMediaFromDB', props.subMedia?.filter((x) => x.id != id).map((x) => x.id));

}
</script>

<script lang="ts">
export default { name: 'SubMedia' };
</script>

<style scoped lang="scss">
.file-row {
  &:hover {
    .btnAction {
      display: block;
    }
  }
}

.btnAction {
  display: none
}
</style>