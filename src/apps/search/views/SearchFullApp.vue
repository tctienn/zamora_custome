<template>
  <div
    class='card content'
    style='height:calc(100vh - 6rem)'>
    <div>
      <div class='text-center'>
        <h2>Tìm là thấy!</h2>
        <SearchInput
          v-model='keyword'
          @search='searchEvent'/>
      </div>
      <div
        class='overflow-auto tab'
        style='height:calc(100vh - 19rem)'>
        <div v-if='searchResult.length > 0'>
          <div class='flex justify-content-center'>
            <ProgressSpinner
              v-if='loading'
              class='w-5rem'/>
          </div>
          <TabView
            v-if='!loading'
            v-model:activeIndex='activeStatus'
            lazy>
            <TabPanel header='Tất cả'>
              <div class='flex flex-column gap-2'>
                <div
                  v-for='(r, i) of searchResult'
                  :key='i'>
                  <ItemContent
                    :highlight='r.highlight'
                    :object='r.source'/>
                </div>
              </div>
            </TabPanel>
            <TabPanel header='Truyền thông'>
            </TabPanel>
            <TabPanel header='Lịch họp'>
            </TabPanel>
            <TabPanel header='Văn bản'>
            </TabPanel>
            <TabPanel header='Điều xe'>
            </TabPanel>
            <TabPanel header='Nhân sự'>
            </TabPanel>
          </TabView>
        </div>
      </div>
      <div>
        <Paginator
          v-if='searchResult.length > 0'
          :rows='10'
          :rows-per-page-options='[10, 20, 30]'
          :total-records='totalRecord'
          @page='changePage($event)'></Paginator>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { searchFull } from '@/apps/search/api/rest/search';
import type { SearchResponse } from '@/apps/search/model/search-response';
import ItemContent from '@/apps/search/views/component/ItemContent.vue';
import SearchInput from '@/apps/search/views/SearchInput.vue';
import { type Pageable } from '@/common/model/query';

const { t } = useI18n();
const activeStatus = ref(0);
const searchResult = ref<SearchResponse[]>([]);
const loading = ref(false);
const keyword = ref('');
const totalRecord = ref(0);
const currentRecordInPage = ref(0);
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
  sort: [],
});
const paramSearch = ref({
  keyword: String,
  module: String,
  indexName: String,
  pageable: pageable
});

function changePage(event: any) {
  paramSearch.value.pageable.page = event.page;
  searchEvent();
}

function searchEvent() {
  loading.value = true;
  if (keyword.value) {
    searchFull(keyword.value, '', null, pageable).then((res: any) => {
      currentRecordInPage.value = res.numberOfElements;
      totalRecord.value = res.totalElements;
      searchResult.value = res.content;
    }).finally(() => {
      loading.value = false;
    });
  } else {
    searchResult.value = [];
    loading.value = false;
  }
}
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'SearchFullApp' });
</script>