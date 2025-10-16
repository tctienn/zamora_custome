<template>
  <div class='flex flex-column'>
    <TabMenu
      :model='tabMenus'>
      <template #item='{item}'>
        <router-link
          v-ripple
          active-class='text-primary border-primary'
          class='align-items-center border-bottom-2 border-gray-50 border-noround flex font-semibold gap-2 lg:hover:surface-hover px-3 py-2 transition-duration-400'
          :to='item.to'>
          <AppIcon
            :name='item.icon'
            size='1.3'/>
          <span class='line-height-3 white-space-nowrap'>{{ item.label }}</span>
          <Badge
            v-if='item?.count'
            style='background-color: #F36F24'
            :value='item?.count'/>
        </router-link>

      </template>
    </TabMenu>
    <div
      class='border-300 border-bottom-1 doc-in-action-buttons flex gap-1 p-1 surface-0'
      style='min-height: 39px'>
      <DocSubmitButtonActions
        v-if='selectedDocument'
        :doc='selectedDocument'
        :menu-actions='menuActions'
        :no-next-btn='true'/>
      <ButtonActions
        v-if='selectedDocument'
        :doc='selectedDocument'
        :doc-id="selectedDocument?.id?.toString() || ''"
        :process='process'
        :user-dept-role='userDeptRole'/>
    </div>

    <router-view class='mt-2'/>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, type PropType, provide, ref, toRef, watchEffect } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

import { findLastProcessByDocSubmitId } from '@/apps/document/api/graphql/submit-process';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { SearchModel } from '@/apps/document/model/doc/search';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import ButtonActions from '@/apps/document/views/doc/submit/actions/ButtonActions.vue';
import DocSubmitButtonActions from '@/apps/document/views/doc/submit/actions/DocSubmitButtonActions.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  tabMenus: {
    type: Array as PropType<(MenuItem & { count?: number, to?: object })[]>,
    default: () => []
  }
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const wrapperMenus = ['DocumentDocIn', 'DocumentDocOut', 'DocumentSubmit'];
const router = useRouter();
const route = useRoute();
const selectedDocument = ref<DocSubmit | undefined>();
const showActionButtons = ref(false);
const docStatus = ref('');
const search = ref<SearchModel>({});
const menuActions: DocumentAction[] = [
  DocumentAction.CREATE_DRAFT,
];
// Provide data for child components to communicate with action buttons
provide('wrapperSelectedDocument', selectedDocument);
provide('wrapperMenuActions', menuActions);
provide('wrapperShowActionButtons', showActionButtons);
provide('wrapperDocStatus', docStatus);
provide('wrapperSearch', search);
provide('isSpecialistDraft', toRef(true));

const process = ref<Process>();
watchEffect(() => {
  if (selectedDocument.value?.id) {
    findLastProcessByDocSubmitId(selectedDocument.value?.id.toString(), userDeptRole.value).onResult(res => {
      process.value = res.data?.findLastProcessByDocSubmitId;
    });
  }
});

function redirectToFirstChildRoute() {
  if (props.tabMenus[0]?.to) {
    router.push(props.tabMenus[0].to);
  }
}

onBeforeRouteUpdate((to) => {
  if (to.name && wrapperMenus.includes(String(to.name))) {
    redirectToFirstChildRoute();
  }
});

onMounted(() => {
  if (wrapperMenus.includes(String(route.name))) {
    redirectToFirstChildRoute();
  }
});
</script>

<style scoped>

</style>
