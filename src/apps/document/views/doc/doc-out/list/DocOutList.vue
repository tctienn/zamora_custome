<template>
  <div class='doc-list-container'>
    <DataView
      current-page-report-template='{first}-{last}/{totalRecords}'
      data-key='id'
      layout='list'
      :pt='{
        header: {
          class: "p-0"
        },
        content: {
          style: {
            height: `${slots["additional-header"] ? "calc(100vh - 18rem)" : "calc(100vh - 16rem)"}`,
            overflow: "auto"
          }
        },
        footer: {
          class: "p-0"
        }
      }'
      :value='docOuts'>
      <template #header>
        <div class='flex justify-content-between surface-0'>
          <DateFilterDoc/>
          <div
            class='flex pl-0 pr-1 w-max'
            style='padding-top: 6px; padding-bottom: 5px;'>
            <DocFilter/>
            <DocSort class='col-6 p-0'/>
          </div>
        </div>
        <slot name='additional-header'>
        </slot>
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
              :go-to-detail-route='goToDetailRoute'
              name='item'
              :toggle-selected='toggleSelected'>
              <DocOutItem
                :model='doc'
                :selected='selectedDocument?.id === doc.id'
                @click='toggleSelected(doc)'
                @dblclick='goToDetailRoute($router, doc)'>
              </DocOutItem>
            </slot>

            <divider class='m-0 p-0'/>
          </div>
        </div>
      </template>
    </DataView>
    <div class='paginator-fixed-container'>
      <AppIcon
        v-tooltip='t("document.docHelper.descriptionTable")'
        class='absolute cursor-pointer hover:text-primary'
        name='live_help'
        size='1.5'
        style='bottom: 1.5rem; left: 1rem'
        @click='helper?.toggle($event)'></AppIcon>
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
    <DocOutHelperOverlay ref='helper'/>
  </div>

</template>

<script lang='ts' setup>

import type { PageState } from 'primevue/paginator';
import { inject, type PropType, ref, useSlots } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { type DocOut } from '@/apps/document/model/doc/doc-out';
import DateFilterDoc from '@/apps/document/views/doc/DateFilterDoc.vue';
import DocOutHelperOverlay from '@/apps/document/views/doc/doc-out/list/DocOutHelperOverlay.vue';
import DocOutItem from '@/apps/document/views/doc/doc-out/list/item/DocOutItem.vue';
import DocFilter from '@/apps/document/views/doc/sort/DocFilter.vue';
import DocFilter2 from '@/apps/document/views/doc/sort/DocFilter2.vue';
import DocSort from '@/apps/document/views/doc/sort/DocSort.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

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
  }
});
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined
});
const slots = useSlots();

const readDoc = inject('readDoc', (docOut: DocOut) => void {});
const helper = ref<InstanceType<typeof DocOutHelperOverlay>>();

function toggleSelected(doc: DocOut) {
  selectedDocument.value = doc;
  readDoc(doc);
}

const { t } = useI18n();

const updatePageable = inject('updatePageable', (page: number) => void {});
const goToDetailRoute = inject('goToDetailRoute', (router: Router, docIn: DocOut) => void {});

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
