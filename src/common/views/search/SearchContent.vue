<template>
  <SearchSkeleton v-if='loading'/>

  <div
    v-if='!loading && isAllEmpty([personalFiles, groupFiles, sharedFiles])'
    class='my-8 text-center'>
    <h5>{{ t("common.noSearchResult") }}</h5>
  </div>

  <ResultNamePanel
    :header='t("ecm.menu.ecmPersonalDocuments")'
    :result='[personalFiles]'
    :search-type='ServiceType[ServiceType.PERSON]'/>

  <ResultNamePanel
    :header='t("ecm.menu.ecmGroupDocuments")'
    :result='[groupFiles]'
    :search-type='ServiceType[ServiceType.GROUP]'/>

  <ResultNamePanel
    :header='t("ecm.menu.ecmPersonalDocumentsSharedDocuments")'
    :result='[sharedFiles]'
    :search-type='ServiceType[ServiceType.SHARED]'/>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import {
  searchGroupByContentGraphql,
  searchPersonalByContentGraphql,
  searchSharedByContentGraphql
} from '@/apps/ecm/api/graphql/search-graphql';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import { isAllEmpty } from '@/common/helpers/file-utils';
import ResultNamePanel from '@/common/views/search/components/ResultNamePanel.vue';
import SearchSkeleton from '@/common/views/search/SearchSkeleton.vue';

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();

const personalFiles = ref<EcmFile[]>([]);
const groupFiles = ref<EcmFile[]>([]);
const sharedFiles = ref<EcmFile[]>([]);

const loading = ref(true);

const { onResult: searchPersonalByContentResult } = searchPersonalByContentGraphql(props.keyword);
searchPersonalByContentResult((response) => {
  loading.value = false;
  personalFiles.value = get(response, 'data.searchPersonalByContent', []);
});

const { onResult: searchGroupByContentResult } = searchGroupByContentGraphql(props.keyword);
searchGroupByContentResult((response) => {
  loading.value = false;
  groupFiles.value = get(response, 'data.searchGroupByContent', []);
});

const { onResult: searchSharedByContentResult } = searchSharedByContentGraphql(props.keyword);
searchSharedByContentResult((response) => {
  loading.value = false;
  sharedFiles.value = get(response, 'data.searchSharedByContent', []);
});
</script>

<script lang="ts">
export default { name: 'SearchContent' };
</script>

<style scoped>

</style>