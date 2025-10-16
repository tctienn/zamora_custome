<template>
  <InputGroup>
    <IconField
      class='w-full'
      icon-position='left'>
      <InputIcon class='pi pi-search' />
      <InputText
        v-model='keyword'
        class='w-full'
        :class="{ 'border-noround-right': !!fields }"
        :placeholder="t('common.search')"
        type='text'
        @keyup.enter='updateSearchTerm(keyword)'/>
    </IconField>
    <InputGroupAddon
      v-if='fields'
      class='cursor-pointer'
      @click='toggleOverlay'>
      <AppIcon
        name='filter_list'
        size='1.2rem' />
    </InputGroupAddon>
  </InputGroup>
  <SearchDropDown ref='op' />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';
import SearchDropDown from '@/common/components/app/search/SearchDropDown.vue';
import { useGlobalSearchStore } from '@/common/store/search';

const updateSearchTerm = inject('updateSearchTerm', (value: string) => void {});
const { t } = useI18n();
const { fields } = storeToRefs(useGlobalSearchStore());

const keyword = ref();
const op = ref<InstanceType<typeof SearchDropDown>>();

function toggleOverlay(event: MouseEvent) {
  op.value?.toggle(event);
}
</script>

<style scoped></style>
