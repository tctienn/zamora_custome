<template>
  <div class='flex flex-column gap-0'>
    <TabMenu
      :model='filteredDocInMenus'>
      <template #item='{item}'>
        <router-link
          v-ripple
          active-class='text-primary border-primary'
          class='align-items-center border-bottom-2 border-gray-50 border-noround flex font-semibold gap-2 lg:hover:surface-hover px-3 py-2 transition-duration-400'
          :to='item.to'>
          <AppIcon
            :name='item.icon'
            size='1.4'/>
          <span class='line-height-3 white-space-nowrap'>{{ item.label }}</span>
          <Badge
            v-if='item?.count'
            style='background-color: #F36F24'
            :value='item?.count'/>
        </router-link>
      </template>
    </TabMenu>
    
    <!-- DocInActionButtons moved from DocInManageWrapper -->
    <DocInActionButtons
      v-if='showActionButtons'
      :key='flowButtonsKey'
      :doc='selectedDocument'
      :menu-actions='menuActions'
      @show-dialog='exportDialogVisible = true'/>
    <div
      v-else
      class='surface-0'
      style='min-height: 38px'></div>
    
    <router-view
      :key='route.name || route.path'
      class='mt-2'
      :menu-actions='menuActions'
      :selected-document='selectedDocument'
      @update:menu-actions='menuActions = $event'
      @update:selected-document='selectedDocument = $event'/>
      
    <ExportDialog
      v-if='exportDialogVisible'
      v-model:visibleDialog='exportDialogVisible'
      :doc-status='docStatus'
      :export-options='exportOptions'
      :search='search'
      @hide-dialog='exportDialogVisible = false'/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { exportExcelDocIn, exportPDFDocIn, exportWordDocIn } from '@/apps/document/api/rest/docIn';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { useUserSupportStore } from '@/apps/document/store/user-support';
import ExportDialog from '@/apps/document/views/doc/component/ExportDialog.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocInActionButtons from '@/apps/document/views/doc/doc-in/action/DocInActionButtons.vue';
import { useDocInMenuConfig } from '@/apps/document/views/doc-menus';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { useDocumentActions } from '@/common/composables/useDocumentActions';
import { DateTimeFormat } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const now = new Date();
const searchModel = ref<SearchModel>({
  searchTimeFrom: moment(now)
    .startOf('month')
    .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
  searchTimeTo: moment(now)
    .endOf('month')
    .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
});

// Reactive data for action buttons
const selectedDocument = ref<DocIn | undefined>();
const menuActions = ref<DocumentAction[]>([]);
const showActionButtons = ref(false);
const exportDialogVisible = ref(false);
const docStatus = ref('');
const search = ref<SearchModel>({});

// Export options for the export dialog
const exportOptions = computed(() => [
  {
    label: t('document.exportDoc.exportPdf'),
    fileName: t('document.dashboard.incomingDoc') + '.pdf',
    exportFunction: exportPDFDocIn,
    icon: '/images/file-types/pdf-logo.png',
  },
  {
    label: t('document.exportDoc.exportWord'),
    fileName: t('document.dashboard.incomingDoc') + '.docx',
    exportFunction: exportWordDocIn,
    icon: '/images/file-types/word-logo.png',
  },
  {
    label: t('document.exportDoc.exportExcel'),
    fileName: t('document.dashboard.incomingDoc') + '.xlsx',
    exportFunction: exportExcelDocIn,
    icon: '/images/file-types/excel-logo.png',
  },
]);
const {
  filteredDocInMenus,
  updateCount
} = useDocInMenuConfig(searchModel);

provide('updateCount', updateCount);

// Function to load all menu counts
async function loadMenuCounts() {
  for (const menu of filteredDocInMenus.value) {
    if (menu.countFn) {
      const count = await menu.countFn();
      count !== undefined && updateCount(menu.to?.name as string, count);
    }
  }
}

// Provide data for child components to communicate with action buttons
provide('wrapperSelectedDocument', selectedDocument);
provide('wrapperMenuActions', menuActions);
provide('wrapperShowActionButtons', showActionButtons);
provide('wrapperDocStatus', docStatus);
provide('wrapperSearch', search);

// Function to redirect to first accessible route
function redirectToFirstAccessibleMenu() {
  if (route.name === 'DocumentDocIn' && filteredDocInMenus.value.length > 0) {
    const firstAccessibleMenu = filteredDocInMenus.value[0];
    if (firstAccessibleMenu.to?.name) {
      router.replace({ name: firstAccessibleMenu.to.name });
    }
  }
}

// Watch for route changes to handle permission-based redirects
watch(route, async (newRoute, oldRoute) => {
  if (newRoute.name === 'DocumentDocIn') {
    // Wait a bit for filteredDocInMenus to be populated, then redirect
    await new Promise(resolve => setTimeout(resolve, 100));
    redirectToFirstAccessibleMenu();
  }
}, { immediate: true });

// Also watch filteredDocInMenus changes in case route is already on parent route
watch(filteredDocInMenus, () => {
  redirectToFirstAccessibleMenu();
}, { immediate: true });

onMounted(async () => {
  // Always load menu counts initially to show all tab counts
  // This ensures all tabs show their counts even when navigating directly to a child route
  await loadMenuCounts();
});
const { supportPermission: supportPermissions } = storeToRefs(useUserSupportStore());
// watch(() => userDeptRole, value => {
//   if (value?.roleId === RoleType.TRO_LY) {
//     findByUserSupport(value).onResult(param => {
//       supportPermissions.value = param.data?.findByUserSupport?.supportPermission;
//     });
//   } else {
//     supportPermissions.value = undefined;
//   }
// }, {
//   immediate: true,
//   deep: true
// });
const mapSupportAction = computed(() => {
  const rs: Record<string, true> = {};
  const mapPermissionToDocumentActionIn: Record<string, string> = {
    READ_INCOMING_DOC: 'READ_INCOMING_DOC',
    ADVISE_INCOMING_DOC: DocumentAction.ASK_FOR_OPINION,
    TRANSFER_INCOMING_DOC: 'TRANSFER',
    RETURN: 'RETURN',
    COMPLETE: 'COMPLETE',
    WITHDRAW_INCOMING_DOC: 'REVOKE',
    PUBLISH: DocumentAction.PROCLAIM,
  };

  supportPermissions.value?.forEach((s) => {
    if (mapPermissionToDocumentActionIn[s]) {
      rs[mapPermissionToDocumentActionIn[s]] = true;
    }
  });
  return rs;
});
provide('mapSupportAction', mapSupportAction);

const flowButtonsKey = ref(0);
function handleSaveDocBack() {
  // Increment key to force re-render
  flowButtonsKey.value++;
  EventBus.emit('reload-doc-in');
}

function handleSaveDocContinue() {
  // Increment key to force re-render
  flowButtonsKey.value++;
  EventBus.emit('reload-doc-in');
}

// Initialize document actions composable
const { onSaveAndBack, onSaveAndContinue } = useDocumentActions();

// Set up event listeners
onMounted(() => {
  onSaveAndBack(handleSaveDocBack);
  onSaveAndContinue(handleSaveDocContinue);
});

// Clean up event listeners
onUnmounted(() => {
  EventBus.off('document-save-and-back', handleSaveDocBack);
  EventBus.off('document-save-and-continue', handleSaveDocContinue);
});

</script>

<style lang="scss" scoped>
:deep(.revoke-btn) {
  border-color: transparent !important;
  &:hover {
    border-color: var(--surface-400) !important;
  }
}
</style>
