<template>
  <div class='doc-list-container'>
    <DataView
      data-key='id'
      layout='list'
      :pt='{
        header: {
          class: "px-0 py-0"
        },
        content: {
          class: "scrollable-content"
        }
      }'
      :value='docIns'>
      <template #header>
        <div class='flex gap-1 justify-content-between surface-0'>
          <DateFilterDoc class='col-10 p-0'/>
          <div
            class='flex pl-0 pr-1 w-max'
            style='padding-top: 6px; padding-bottom: 5px;'>
            <DocFilter2
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
              :view-detail='goToDetailRoute'>
              <DocInItem
                :model='doc'
                :selected='selectedDocument?.id === doc.id'
                @click='toggleSelected(doc)'
                @dblclick='goToDetailRoute($router, doc)'>
              </DocInItem>
            </slot>
            <divider class='m-0 p-0'/>
          </div>
        </div>
      </template>
    </DataView>

    <!-- Fixed Paginator at bottom -->
    <div class='paginator-fixed-container'>
      <AppIcon
        v-tooltip='t("document.docHelper.descriptionTable")'
        class='cursor-pointer help-icon hover:text-primary'
        name='live_help'
        size='1.5'
        @click='helper?.toggle($event)'></AppIcon>
      <Paginator
        current-page-report-template='{first}-{last}/{totalRecords}'
        :pt='{
          root: { class: "border-noround-top fixed-paginator" }
        }'
        :rows='10'
        template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
        :total-records='total'
        @page='onPage'/>
    </div>

    <DocInHelperOverlay ref='helper'/>
  </div>
</template>

<script lang='ts' setup>

import type { PageState } from 'primevue/paginator';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { type Router } from 'vue-router';

import { type DocIn } from '@/apps/document/model/doc/doc-in';
import DateFilterDoc from '@/apps/document/views/doc/DateFilterDoc.vue';
import DocInHelperOverlay from '@/apps/document/views/doc/doc-in/list/DocInHelperOverlay.vue';
import DocInItem from '@/apps/document/views/doc/doc-in/list/item/DocInItem.vue';
import DocFilter from '@/apps/document/views/doc/sort/DocFilter.vue';
import DocFilter2 from '@/apps/document/views/doc/sort/DocFilter2.vue';
import DocSort from '@/apps/document/views/doc/sort/DocSort.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

defineProps({
  docIns: {
    type: Array as PropType<DocIn[]>,
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

const { t } = useI18n();
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocIn | undefined>,
  default: undefined
});
const readDoc = inject('readDoc', (docIn: DocIn) => void {});
const helper = ref<InstanceType<typeof DocInHelperOverlay>>();

function toggleSelected(doc: DocIn) {
  selectedDocument.value = doc;
  readDoc(doc);
}

const updatePageable = inject('updatePageable', (page: number) => void {});
const goToDetailRoute = inject('goToDetailRoute', (router: Router, docIn: DocIn) => void {});

function onPage(event: PageState) {
  updatePageable(event.page);
}

</script>

<style scoped>
/* Container for the entire list component */
.doc-list-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Scrollable content area */
:deep(.scrollable-content) {
  height: calc(100vh - 10rem);
  min-height: calc(100vh - 18rem);
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 4rem; /* Space for fixed paginator */
}

/* Ensure DataView takes full height */
:deep(.p-dataview) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.p-dataview-content) {
  flex: 1;
  overflow: scroll;
}

/* Fixed paginator container at bottom of sidebar */
.paginator-fixed-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--surface-0);
  border-top: 1px solid var(--surface-200);
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1);
  padding: 5px;
}

/* Help icon positioning within fixed container */
.help-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Fixed paginator styling */
:deep(.fixed-paginator) {
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  justify-content: center;
}

/* Paginator button styling */
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
  padding: .35rem .75rem;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .paginator-fixed-container {
    padding: 0.25rem;
  }

  .help-icon {
    left: 0.5rem;
    font-size: 1.2rem;
  }

  :deep(.fixed-paginator) {
    font-size: 0.875rem;
  }

  :deep(.p-paginator .p-paginator-first),
  :deep(.p-paginator .p-paginator-prev),
  :deep(.p-paginator .p-paginator-next),
  :deep(.p-paginator .p-paginator-last),
  :deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    min-width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }

  :deep(.p-paginator .p-dropdown) {
    height: 1.75rem;
    font-size: 0.875rem;
  }
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  border-radius: 4px !important;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

:deep(.p-paginator .p-paginator-current) {
  height: 2rem;
  min-width: 2rem;
}

:deep(.p-dataview .p-dataview-header) {
  border-bottom: 1px solid var(--surface-200);
  border-top: none;
}
</style>
