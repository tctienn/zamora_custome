<template>
  <DocumentWrapper :tab-menus='filteredDocSubmitMenus'/>
</template>

<script lang='ts' setup>

import { onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import DocumentWrapper from '@/apps/document/views/doc/DocumentWrapper.vue';
import { useDocSubmitMenuConfig } from '@/apps/document/views/doc-menus';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const router = useRouter();
const route = useRoute();
const now = new Date();
const searchModel = ref<DocSubmitSearch>({
  searchTimeFrom: moment(now)
    .startOf('month')
    .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
  searchTimeTo: moment(now)
    .endOf('month')
    .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
});
const {
  filteredDocSubmitMenus,
  updateCount
} = useDocSubmitMenuConfig(searchModel);

provide('updateCount', updateCount);
onMounted(async () => {
  // Check if we're on the parent route and need to redirect to first accessible tab
  if (route.name === 'DocumentSubmit') {
    // Wait for filteredDocSubmitMenus to be computed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (filteredDocSubmitMenus.value.length > 0) {
      const firstAccessibleMenu = filteredDocSubmitMenus.value[0];
      if (firstAccessibleMenu.to?.name) {
        router.replace({ name: firstAccessibleMenu.to.name });
        return;
      }
    }
  }
  
  filteredDocSubmitMenus.value.forEach(async (m) => {
    if (m.countFn) {
      const count = await m.countFn();
      count !== undefined && updateCount(m.to?.name as string, count);
    }
  });
});
</script>

<style scoped>

</style>