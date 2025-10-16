<template>
  <Card>
    <template #header>
      <TabMenu
        :active-index='activeTabIndex'
        class='overflow-visible'
        :model='menus'>
        <template #item='{ item, props }'>
          <router-link
            v-if='item.route'
            v-slot='{ href, navigate }'
            custom
            :to='item.route'>
            <a
              v-ripple
              :href='href'
              v-bind='props.action'
              @click='navigate'>
              <span v-bind='props.icon'/>
              <span v-bind='props.label'>{{ item.label }}</span>
            </a>
          </router-link>
        </template>
      </TabMenu>
    </template>
    <template #content>
      <component :is='menus[activeTabIndex].component'/>
    </template>
  </Card>

</template>

<script setup lang='ts'>
import type { MenuItem } from 'primevue/menuitem';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import ConfigApp from '@/apps/admin/views/product/config-app/ConfigApp.vue';
import ProductInfoManagement from '@/apps/admin/views/product/product-info/ProductInfoManagement.vue';

const route = useRoute();
const { t } = useI18n();
const menus: MenuItem[] = [
  {
    label: 'Thông tin sản phẩm',
    route: 'info',
    component: ProductInfoManagement
  },
  // {
  //   label: 'Cấu hình sản phẩm',
  //   route: 'config',
  //   component: ConfigApp
  // },
];

const activeTabIndex = computed(() => {
  return route.params.tab && menus.findIndex(x => x.route === route.params.tab) || 0;
});

</script>

<style scoped>

</style>
