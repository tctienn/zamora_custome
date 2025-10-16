<template>
  <div
    class='align-items-center flex justify-content-center my-8'>
    <h5>{{t("common.enterSearchKeyword", {minKeywordLength: SEARCH_KEYWORD_MIN_LENGTH, notAllowedCharacters: FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS})}}</h5>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS, SEARCH_KEYWORD_MIN_LENGTH } from '@/common/constants';

const { t } = useI18n();

</script>

<script lang="ts">
export default { name: 'EmptyKeywordMessage' };
</script>

<style scoped>

</style>