<template>
  <DocOutList
    v-model:selected-document='selectedDocument'
    v-bind='$props'>
    <template
      v-if='!isClerk(userDeptRole.roleId)'
      #additional-header>
      <TabMenu
        :model='additionalMenuItems'
        :pt='{
          action: {
            class: "px-3 py-2"
          }
        }'/>
    </template>
    <template #item='{doc, toggleSelected}'>
      <DocOutProclaimedItem
        :model='doc'
        :selected='selectedDocument?.id=== doc?.id'
        @click='toggleSelected(doc)'
        @dblclick='() => {
          visibleSidebarDetail = true;
        }'>
      </DocOutProclaimedItem>
    </template>
  </DocOutList>
  <PromulgateDetail
    :id='selectedDocument?.id'
    :visible='visibleSidebarDetail'
    @hide-sidebar='visibleSidebarDetail = false'/>

</template>

<script lang='ts' setup>

import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { isClerk } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import PromulgateDetail from '@/apps/document/views/doc/doc-out/detail/PromulgateDetail.vue';
import DocOutList from '@/apps/document/views/doc/doc-out/list/DocOutList.vue';
import DocOutProclaimedItem from '@/apps/document/views/doc/doc-out/list/item/DocOutProclaimedItem.vue';

defineProps({
  docOuts: {
    type: Array as PropType<DocOut[]>,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
});
const { t } = useI18n();
const { userDeptRole } = useDocumentRolesStore();
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const visibleSidebarDetail = ref(false);
const additionalMenuItems = computed((): (MenuItem & { count?: number })[] => [
  {
    label() {
      return t('document.doc.mine') + (this.count ? ' (' + this.count + ')' : '');
    },
    count: myProclaimedCount.value,
    command(event) {
      changeTab(0);
    },
  },
  {
    label() {
      return t('document.doc.all') + (this.count ? ' (' + this.count + ')' : '');
    },
    count: allProclaimedCount.value,
    command(event) {
      changeTab(1);
    },
  }]);

const myProclaimedCount = inject('myProclaimedCount', ref(0));
const allProclaimedCount = inject('allProclaimedCount', ref(0));
const changeTab = inject('changeProclaimedTab', (tab: number) => void 0);
</script>

<style scoped>

</style>