<template>
  <div
    v-if='loading'
    class=''>
    <AppLoader/>
  </div>

  <div
    v-else-if='group.id && accessAllow'
    class='column-gap-2 ecm-group flex flex-grow-1 flex-row h-full'>
    <div class='flex flex-column flex-grow-1 row-gap-2'>
      <EcmGroupInfo/>

      <component :is='viewerType'/>
    </div>

    <EcmGroupSidebar @toggle-sidebar='updateGridResponsiveClasses'/>
  </div>

  <div
    v-else
    class='align-items-center exception-body flex h-full justify-content-center'>
    <NotFound/>
  </div>
</template>

<script setup lang="ts">
import { filter, get, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Level } from '@/apps/admin/model/userGroup';
import { getEcmGroupGraphql } from '@/apps/ecm/api/graphql/group-graphql-api';
import EcmGroupInfo from '@/apps/ecm/views/group-documents/components/info/EcmGroupInfo.vue';
import EcmGroupSidebar from '@/apps/ecm/views/group-documents/components/sidebar/EcmGroupSidebar.vue';
import { ACTIVITY_STATUSES, GRID_RESPONSIVE_CLASSES_MAX_5, GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import type { Group } from '@/common/model/group';
import { useUserStore } from '@/common/store/user';
import NotFound from '@/common/views/error/404Panel.vue';

const loading = ref(true);
const group = ref<Group>({} as Group);
const route = useRoute();
const { user } = storeToRefs(useUserStore());
const { id } = route.params;

const viewerType = ref('GroupDocument');

const accessAllow = computed(() => group.value.status === ACTIVITY_STATUSES.ACTIVE
    || group.value.status === ACTIVITY_STATUSES.DEACTIVATE && map(filter(group.value.users, ['level', Level[Level.MANAGE]]), 'id').includes(user.value.id as string));

const gridResponsiveClasses = ref(GRID_RESPONSIVE_CLASSES_MAX_5);
provide('grid-responsive-classes', gridResponsiveClasses);

function updateGridResponsiveClasses(expandedSidebar: boolean) {
  gridResponsiveClasses.value = expandedSidebar ? GRID_RESPONSIVE_CLASSES_MAX_5 : GRID_RESPONSIVE_CLASSES_MAX_7;
}

const { onResult: getEcmGroupResult, onError: getEcmGroupError } = getEcmGroupGraphql(id as string);
getEcmGroupResult((response) => {
  group.value = get(response, 'data.ecmGroup', {} as Group);
  loading.value = false;
});

getEcmGroupError((error) => {
  loading.value = false;
  toastError({ message: error.message });
});

function changeViewerType(type: string) {
  viewerType.value = type;
}

onMounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.add('overflow-hidden');
  }
});

onUnmounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.remove('overflow-hidden');
  }
});

provide('group', group);
provide('change-group-viewer-type', changeViewerType);
provide('group-viewer-type', viewerType);
</script>

<script lang='ts'>
import GroupDocument from '@/apps/ecm/views/group-documents/GroupDocument.vue';
import GroupTrash from '@/apps/ecm/views/group-documents/GroupTrash.vue';

export default {
  name: 'GroupMainPage',

  components: {
    GroupDocument,
    GroupTrash
  }
};
</script>"