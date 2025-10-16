<template>
  <SearchSkeleton v-if='loading'/>

  <div
    v-if='!loading && isAllEmpty([personalFiles, personalFolders, groupFiles, groupFolders, sharedFiles, sharedFolders])'
    class='my-5 text-center'>
    <h5>{{ t("common.noSearchResult") }}</h5>
  </div>

  <ResultNamePanel
    :header='t("ecm.menu.ecmPersonalDocuments")'
    :result='[personalFolders, personalFiles]'
    :search-type='ServiceType[ServiceType.PERSON]'/>

  <ResultNamePanel
    :header='t("ecm.menu.ecmGroupDocuments")'
    :result='[groupFolders, groupFiles]'
    :search-type='ServiceType[ServiceType.GROUP]'/>

  <ResultGroup
    :header='t("ecm.menu.ecmGroup")'
    :result='[groups]'/>

  <ResultNamePanel
    :header='t("ecm.menu.ecmPersonalDocumentsSharedDocuments")'
    :result='[sharedFolders, sharedFiles]'
    :search-type='ServiceType[ServiceType.SHARED]'/>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import {
  searchGroupByKeyword,
  searchGroupByNameGraphql,
  searchPersonalByNameGraphql,
  searchSharedByNameGraphql
} from '@/apps/ecm/api/graphql/search-graphql';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { isAllEmpty } from '@/common/helpers/file-utils';
import ResultGroup from '@/common/views/search/components/ResultGroup.vue';
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
const personalFolders = ref<EcmFolder[]>([]);
const groupFiles = ref<EcmFile[]>([]);
const groupFolders = ref<EcmFolder[]>([]);
const sharedFiles = ref<EcmFile[]>([]);
const sharedFolders = ref<EcmFolder[]>([]);
const groups = ref<UserGroupInterface[]>([]);

const loading = ref(true);

const { onResult: searchPersonalByNameResult } = searchPersonalByNameGraphql(props.keyword);
searchPersonalByNameResult((response) => {
  loading.value = false;
  personalFiles.value = get(response, 'data.searchPersonalByName.files', []);
  personalFolders.value = get(response, 'data.searchPersonalByName.folders', []);
});

const { onResult: searchGroupByNameResult } = searchGroupByNameGraphql(props.keyword);
searchGroupByNameResult((response) => {
  loading.value = false;
  groupFiles.value = get(response, 'data.searchGroupByName.files', []);
  groupFolders.value = get(response, 'data.searchGroupByName.folders', []);
});

const { onResult: searchSharedByNameResult } = searchSharedByNameGraphql(props.keyword);
searchSharedByNameResult((response) => {
  loading.value = false;
  sharedFiles.value = get(response, 'data.searchSharedByName.files', []);
  sharedFolders.value = get(response, 'data.searchSharedByName.folders', []);
});

const { onResult: searchGroupByKeywordResult } = searchGroupByKeyword(props.keyword);
searchGroupByKeywordResult((response) => {
  loading.value = false;
  groups.value = get(response, 'data.searchGroupByKeyword', []);
});
</script>

<script lang="ts">
export default { name: 'SearchName' };
</script>

<style scoped>

</style>