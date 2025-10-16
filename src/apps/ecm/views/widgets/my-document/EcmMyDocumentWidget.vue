<template>
  <SystemDashboardWidget :widget='widget'>
    <template #sub-header>
      <div class='flex flex-row flex-wrap'>
        <template
          v-for='(subHeader, index) in subHeaders'
          :key='index'>
          <span
            class='cursor-pointer'
            :class='{"font-bold": activeSubHeader === index}'
            @click='subHeader.action'>
            {{ t(subHeader.label, {count: subHeader.count}) }}
          </span>

          <Divider
            v-if='index < subHeaders.length - 1'
            class='border-left-1 mx-2 p-0'
            layout='vertical'/>
        </template>
      </div>
    </template>

    <template #body>
      <div class='flex flex-column row-gap-3'>
        <EcmMyDocumentWidgetItem
          :documents='documents'
          @toggle-menu='(event, data) => toggleActionMenu(event, data)'/>
      </div>
    </template>

    <template #footer>
      <router-link
        class='align-self-end font-italic mx-3 my-1 text-color underline'
        target='_blank'
        :to='{name: "EcmPersonalDocumentsMyDocuments"}'>
        <small>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </router-link>
    </template>
  </SystemDashboardWidget>

  <ContextMenu
    ref='actionMenu'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItemComponent
        :icon='icon'
        icon-size='1.25'
        :label='label'/>
    </template>
  </ContextMenu>
</template>

<script setup lang='ts'>
import { get, slice, toLower } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getDocumentDashboard } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import EcmMyDocumentWidgetItem from '@/apps/ecm/views/widgets/my-document/EcmMyDocumentWidgetItem.vue';
import MenuItemComponent from '@/common/components/custom/MenuItem.vue';
import { downloadFileUrl, generateFileDownloadUrl } from '@/common/helpers/file-utils';
import type { DashboardWidgetSubHeader, WidgetInstance } from '@/common/model';
import { useUserStore } from '@/common/store/user';
import SystemDashboardWidget from '@/common/views/dashboard/component/SystemDashboardWidget.vue';

const props = defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const userId = useUserStore().user.id;
const countRecentDocument = ref(0);
const countMyDocument = ref(0);
const countSharedDocument = ref(0);
const { t } = useI18n();
const router = useRouter();

const documents = ref<EcmFile[]>([]);
const document = ref<EcmFile>({} as EcmFile);
const activeSubHeader = ref(0);

const actionMenu = ref();
const menuActions: MenuItem[] = [
  {
    label: t('common.view'),
    icon: 'file_open',
    command: openDocument
  },
  {
    label: t('common.download'),
    icon: 'download',
    command: downloadDocument
  }
];

const subHeaders = ref<DashboardWidgetSubHeader[]>([
  {
    key: 'recent',
    label: 'ecm.widget.myDocument.recentDocuments',
    count: countRecentDocument.value,
    action: loadRecentDocuments
  },
  {
    key: 'shared',
    label: 'ecm.widget.myDocument.sharedDocuments',
    count: countSharedDocument.value,
    action: loadSharedDocuments
  },
  {
    key: 'all',
    label: 'ecm.widget.myDocument.allDocument',
    count: countMyDocument.value,
    action: loadAllDocument
  }
]);

if (subHeaders.value.length) {
  subHeaders.value[0].action();
}

function loadRecentDocuments() {
  activeSubHeader.value = 0;
  const { onResult: getDocumentDashboardResult } = getDocumentDashboard(userId as string, props.widget?.recordNumber as number);
  getDocumentDashboardResult((response) => {
    documents.value = slice(get(response, 'data.getDocumentDashboard.documentRecent.files', []), 0, props.widget?.recordNumber);
    countRecentDocument.value = get(response, 'data.getDocumentDashboard.numberDocumentRecent', 0);
    countSharedDocument.value = get(response, 'data.getDocumentDashboard.numberDocumentShared', 0);
    countMyDocument.value = get(response, 'data.getDocumentDashboard.numberMyDocument', 0);

    subHeaders.value.forEach(it => {
      if (it.key == 'recent') {
        it.count = countRecentDocument.value;
      } else if (it.key == 'shared') {
        it.count = countSharedDocument.value;
      } else if (it.key == 'all') {
        it.count = countMyDocument.value;
      }
    });
  });
}

function loadSharedDocuments() {
  activeSubHeader.value = 1;
  const { onResult: getDocumentDashboardResult } = getDocumentDashboard(userId as string, props.widget?.recordNumber as number);
  getDocumentDashboardResult((response) => {
    documents.value = slice(get(response, 'data.getDocumentDashboard.documentShared.files', []), 0, props.widget?.recordNumber);
  });
}

function loadAllDocument() {
  activeSubHeader.value = 2;
  const { onResult: getDocumentDashboardResult } = getDocumentDashboard(userId as string, props.widget?.recordNumber as number);
  getDocumentDashboardResult((response) => {
    documents.value = slice(get(response, 'data.getDocumentDashboard.myDocument.files', []), 0, props.widget?.recordNumber);
  });
}

function toggleActionMenu(event: Event, data: EcmFile) {
  document.value = data;
  actionMenu.value.show(event);
}

function downloadDocument() {
  downloadFileUrl(generateFileDownloadUrl(document.value.treePath), document.value.name);
}

function openDocument() {
  router.push({
    name: 'EcmFileViewer',
    params: { fileId: document.value.id }
  });

}

</script>

<script lang='ts'>
export default { name: 'EcmMyDocumentWidget' };
</script>