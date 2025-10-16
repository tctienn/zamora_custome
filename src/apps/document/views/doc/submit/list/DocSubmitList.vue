<template>
  <DataView
    data-key='id'
    layout='list'
    :pt='{
      header: {
        class: "p-0"
      },
      content: {
        style: {
          height: "calc(100vh - 16rem)",
          overflow: "auto"
        }
      },
      footer: {
        class: "p-0"
      }
    }'
    :value='docSubmits'>
    <template #header>
      <div class='flex justify-content-between surface-0'>
        <DateFilterDoc/>
        <div
          class='flex pl-0 pr-1 w-max'
          style='padding-top: 6px; padding-bottom: 5px;'>
          <DocFilter
            class='col-6 px-0 py-1'/>
          <DocSort class='col-6 p-0'/>
        </div>
      </div>

    </template>
    <template #empty>
      <ProgressBar
        v-if='loading'
        class='border-noround'
        mode='indeterminate'
        style='height: .25rem'></ProgressBar>
      <div
        v-else
        class='align-items-center flex font-semibold h-10rem justify-content-center text-lg'>
        {{ t('document.doc.emptyRecord') }}
      </div>
    </template>
    <template #list='{items}'>
      <ProgressBar
        v-if='loading'
        class='border-noround'
        mode='indeterminate'
        style='height: .25rem'></ProgressBar>
      <div
        v-else
        class='grid grid-nogutter mb-1'>
        <div
          v-for='doc in items'
          :key='doc.id'
          class='col-12'>
          <slot
            :doc='doc'
            name='item'
            :toggle-selected='toggleSelected'
            :view-detail='showSidebar'>
            <DocSubmitItem
              :model='doc'
              :selected='selectedDocument?.id === doc.id'
              @click='toggleSelected(doc)'
              @dblclick='showSidebar'>
            </DocSubmitItem>
          </slot>
          <divider class='m-0 p-0'/>
        </div>
      </div>
    </template>
    <template #footer>
      <div class='relative'>
        <AppIcon
          v-tooltip='t("document.docHelper.descriptionTable")'
          class='absolute cursor-pointer hover:text-primary'
          name='live_help'
          size='1.5'
          style='bottom: 1.5rem; left: 1rem'
          @click='helperRef?.toggle($event)'></AppIcon>
        <Paginator
          current-page-report-template='{first}-{last}/{totalRecords}'
          :pt='{
            root:{class:"border-noround-top"}
          }'
          :rows='10'
          template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
          :total-records='total'
          @page='onPage'/>
      </div>
    </template>
  </DataView>
  <DocSubmitHelperOverlay ref='helperRef'/>
  <DocSubmitDetailSideBar
    v-if='selectedDocument'
    :doc-id='selectedDocument.id'
    :visible='visibleDetail'
    @hide-sidebar='visibleDetail = false'/>
</template>

<script lang='ts' setup>

import type { PageState } from 'primevue/paginator';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import DateFilterDoc from '@/apps/document/views/doc/DateFilterDoc.vue';
import DocFilter from '@/apps/document/views/doc/sort/DocFilter.vue';
import DocSort from '@/apps/document/views/doc/sort/DocSort.vue';
import DocSubmitDetailSideBar from '@/apps/document/views/doc/submit/DocSubmitDetailSideBar.vue';
import DocSubmitHelperOverlay from '@/apps/document/views/doc/submit/list/DocSubmitHelperOverlay.vue';
import DocSubmitItem from '@/apps/document/views/doc/submit/list/item/DocSubmitItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

defineProps({
  docSubmits: {
    type: Array as PropType<DocSubmit[]>,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocSubmit | undefined>,
  default: undefined
});
const { t } = useI18n();
const helperRef = ref<InstanceType<typeof DocSubmitHelperOverlay> | null>(null);
const readDoc = inject('readDoc', (doc: DocSubmit) => void {});
const visibleDetail = ref(false);

function toggleSelected(doc: DocSubmit) {
  selectedDocument.value = doc;
  readDoc(doc);
}

const updatePageable = inject('updatePageable', (page: number) => void {});
const goToDetailRoute = inject('goToDetailRoute', (router: Router, doc: DocSubmit) => void {});

function showSidebar() {
  if (selectedDocument.value) {
    visibleDetail.value = true;
    const router = inject('router') as Router;
    goToDetailRoute(router, selectedDocument.value);
  }
}

function onPage(event: PageState) {
  updatePageable(event.page);
}
</script>

<style scoped>
:deep(.p-paginator .p-paginator-first) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-prev) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-next) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-dropdown) {
  height: 2rem;

}

:deep(.p-dropdown-trigger) {
  width: 2rem;
}

:deep(.p-inputtext) {
  padding: .35rem .75rem
}

</style>