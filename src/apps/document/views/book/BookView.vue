<template>
  <TabMenu
    :model='menuFiltered'>
    <template #item='{item}'>
      <router-link
        v-ripple
        active-class='text-primary border-primary'
        class='align-items-center border-bottom-2 border-gray-50 border-noround flex font-semibold gap-2 lg:hover:surface-hover px-3 py-2 transition-duration-400'
        :to='item.to'>
        <span class='line-height-3 white-space-nowrap'>{{ item.label }}</span>
        <Badge
          v-if='item?.count'
          style='background-color: #F36F24'
          :value='item?.count'/>
      </router-link>

    </template>
  </TabMenu>
  <RouterView/>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, onMounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';

import { hasPermission } from '@/apps/admin/services/permission';
import { countSearchAdvance } from '@/apps/document/api/graphql/searchAdvanced';
import docRoutes from '@/apps/document/router';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { findRouter } from '@/apps/document/views/doc-menus';

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
type DocumentMenu = MenuItem & {
  count?: number,
  to?: { name?: string; path?: string };
  countField?: string,
};
const bookTypes = ref<DocumentMenu[]>([
  {
    label: t('document.menu.documentDocIn'),
    to: { name: 'DocInLookup' },
    countField: 'countDocIn',
  },
  {
    label: t('document.menu.documentDocOut'),
    to: { name: 'DocOutLookup' },
    countField: 'countDocOut',
  },
  {
    label: t('Tờ trình'),
    to: { name: 'DocSubmitLookup' },
    countField: 'countDocSubmit',
  },
]);

const menuFiltered = computed(() => {
  return bookTypes.value.filter(m => {
    if (m.to?.name) {
      const route = findRouter(docRoutes, m.to.name);
      return route?.meta?.functionMapping ? hasPermission(route?.meta?.functionMapping as string + '/') : true;
    }
    return true;
  });
});

const router = useRouter();

function redirectToFirstChildRoute() {
  if (menuFiltered.value[0]?.to) {
    router.push(menuFiltered.value[0]?.to);
  }
}

const {
  load,
  refetch
} = countSearchAdvance(userDeptRole.value);

function updateCount(countField: string, count: number) {
  bookTypes.value = bookTypes.value.map((m) => {
    if (m.countField === countField) {
      return {
        ...m,
        count,
      };
    }
    return m;
  });
}

provide('updateCount', updateCount);

onBeforeRouteUpdate((to) => {
  if (to.name === 'DocumentLookup') {
    redirectToFirstChildRoute();
  }
});

onMounted(() => {
  redirectToFirstChildRoute();
  (load() || refetch())
    ?.then((res) => {
      if (res.countSearchAdvance) {
        Object.entries(res.countSearchAdvance).forEach(([key, value]) => {
          updateCount(key, Number(value));
        });
      }
    });
});
</script>

<style scoped></style>
