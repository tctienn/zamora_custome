<template>
  <div class='content flex gap-2'>

    <div class='align-items-start flex'>
      <img
        v-if='app?.icon'
        alt=''
        class='w-2rem'
        draggable='false'
        :src='`/images/menus/${app?.icon}`'
        @error='handleFileImageError'/>
      <AppIcon
        v-else
        class='m-2 text-center w-2rem'
        name='menu'
        size='2'/>

    </div>

    <div class='flex flex-column gap-2'>
      <div class='align-content-end text-blue-300'>{{ app?.name }}</div>
      <component
        :is='headerComp'
        :highlight='highlight'
        :object='object'/>
      <div
        v-for='f in getField(highlight)'
        :key='f'>
        <div
          v-for='text of highlight?.[f]'
          :key='text'
          v-sanitize-html='text'>
        </div>
      </div>
    </div>

  </div>

</template>

<script lang='ts' setup>

import { type Component, computed, type PropType } from 'vue';

import type { SearchSource } from '@/apps/search/model/search-response';
import ItemAttachment from '@/apps/search/views/component/ItemAttachment.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { handleFileImageError } from '@/common/helpers/file-utils';
import { useMenuStore } from '@/common/store/menu';

const props = defineProps({
  object: {
    type: Object as PropType<SearchSource>,
    default: undefined
  },
  highlight: {
    type: Object as PropType<{ [key: string]: string[] }>,
    default: undefined
  }
});

const { configuredApps } = useMenuStore();

const app = computed(() => configuredApps?.find((app) => app.code === props.object?.module));

const headerItemComponents: { [key: string]: Component } = { 'Attachment': ItemAttachment };
const headerComp = computed(() => props.object?.type ? headerItemComponents[props.object?.type] : null);

function getField(object?: { [key: string]: string[] }) {
  return object ? Object.keys(object).filter(k => !k.includes('.keyword')) : [];
}
</script>

<script lang='ts'>
export default { name: 'ItemContent' };

</script>

<style scoped>

</style>