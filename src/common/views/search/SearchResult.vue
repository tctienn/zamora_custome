<template>
  <div class='search-result'>
    <TabView
      :active-index='activeIndex'
      :lazy='true'
      @tab-change='onTabChange'>

      <TabPanel :header='t("common.searchName")'>
        <SearchName
          v-if='keyword'
          :keyword='toString(keyword)'/>
        <EmptyKeywordMessage v-else />
      </TabPanel>

      <TabPanel :header='t("common.searchContent")'>
        <SearchContent
          v-if='keyword'
          :keyword='toString(keyword)'/>
        <EmptyKeywordMessage v-else />
      </TabPanel>
    </TabView>
  </div>

</template>

<script setup lang="ts">

import { toString } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TabViewChangeEvent } from 'primevue/tabview';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useAppStore } from '@/common/store/app';
import EmptyKeywordMessage from '@/common/views/search/components/EmptyKeywordMessage.vue';
import SearchContent from '@/common/views/search/SearchContent.vue';
import SearchName from '@/common/views/search/SearchName.vue';

const { t } = useI18n();

const route = useRoute();
const { keyword } = route.query || {
  keyword: '',
  type: ''
};
const activeIndex = ref(0);

const appStore = useAppStore();
const { searchType } = storeToRefs(appStore);

switch (searchType.value) {
case 'name':
  activeIndex.value = 0;
  break;
case 'content':
  activeIndex.value = 1;
  break;
default:
  activeIndex.value = 0;
}

function onTabChange(event: TabViewChangeEvent) {
  const index = event.index;

  switch (index) {
  case 0:
    searchType.value = 'name';
    break;
  case 1:
    searchType.value = 'content';
    break;
  default:
    searchType.value = 'name';
  }
}

</script>

<script lang="ts">
export default { name: 'SearchResult' };
</script>

<style scoped>

</style>