<template>
  <nav class='layout-breadcrumb'>
    <ol>
      <li>
        <router-link
          style='color: inherit'
          :to='home.to'>
          <i :class='home.icon'></i>
        </router-link>
      </li>
      <li
        v-if='breadcrumbRoutes.length'
        class='layout-breadcrumb-chevron'>/</li>
      <template
        v-for='(breadcrumbRoute, i) in breadcrumbRoutes'
        :key='breadcrumbRoute'>
        <li :class='{"font-bold": (i === breadcrumbRoutes.length - 1)}'> {{ breadcrumbRoute.label }}</li>
        <li
          v-if='i !== breadcrumbRoutes.length - 1'
          class='layout-breadcrumb-chevron'>/
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup>
import { camelCase, each, isEmpty, reject } from 'lodash';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useMenuStore } from '@/common/store/menu';

const route = useRoute();
const { t } = useI18n() || {};

const home = reactive({
  icon: 'pi pi-home',
  to: '/',
});
const menuStore = useMenuStore();
const breadcrumbRoutes = ref(generateBreadcrumb());

function generateBreadcrumb() {
  let displayRoute;
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const item = route.matched[i];
    if(!('showInBreadcrumb' in item.meta) || item.meta['showInBreadcrumb']) {
      displayRoute = item;
      break;
    }
  }
  let routes = reject((displayRoute || route).path.split('/'), isEmpty);
  const breadcrumb = [];
  each(routes, (item, index) => {
    const previousPath = index === 0 ? '' : breadcrumb[index - 1].to;
    const currentPath = index === 0 ? `/${ item }` : `${ previousPath }/${ item }`;

    breadcrumb.push({
      label: t(`${ camelCase(menuStore.currentApp) }.menu.${ camelCase(currentPath) }`),
      to: currentPath,
      disabled: true
    });
  });

  return breadcrumb;
}

watch(route, () => {
  breadcrumbRoutes.value = generateBreadcrumb();
});
</script>

<script>
export default { name: 'AppBreadcrumb' };
</script>

<style scoped>

</style>