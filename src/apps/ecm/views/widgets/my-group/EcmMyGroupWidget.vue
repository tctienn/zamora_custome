<template>
  <SystemDashboardWidget :widget='widget'>
    <!--    <template #header-action>-->
    <!--      <ButtonIcon-->
    <!--        class='p-1'-->
    <!--        icon='add_circle'-->
    <!--        icon-size='1.5'-->
    <!--        rounded-->
    <!--        text-->
    <!--      />-->
    <!--    </template>-->

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
      <EcmMyGroupWidgetItem
        :groups='groups'
        @toggle-menu='(event, data) => toggleActionMenu(event, data)'/>
    </template>

    <template #footer>
      <router-link
        class='align-self-end font-italic mx-3 my-1 text-color underline'
        target='_blank'
        :to='{name: "EcmGroups"}'>
        <small>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </router-link>
    </template>
  </SystemDashboardWidget>

  <!--  <ContextMenu-->
  <!--    ref='actionMenu'-->
  <!--    :model='menuActions'-->
  <!--    :popup='true'-->
  <!--  >-->
  <!--    <template #item='{item: {icon, label}}'>-->
  <!--      <MenuItem-->
  <!--        :icon='icon'-->
  <!--        icon-size='1.25'-->
  <!--        :label='label'-->
  <!--      />-->
  <!--    </template>-->
  <!--  </ContextMenu>-->
</template>

<script setup lang='ts'>
import { get, toLower } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getGroupDashboard } from '@/apps/ecm/api/graphql/group-graphql-api';
import EcmMyGroupWidgetItem from '@/apps/ecm/views/widgets/my-group/EcmMyGroupWidgetItem.vue';
import type { DashboardWidgetSubHeader, WidgetInstance } from '@/common/model';
import type { Group } from '@/common/model/group';
import SystemDashboardWidget from '@/common/views/dashboard/component/SystemDashboardWidget.vue';

const props = defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const groups = ref<Group[]>();
const group = ref<Group>();
const actionMenu = ref();

const activeSubHeader = ref(0);
const { t } = useI18n();
// const menuActions: MenuItem[] = [
//   {
//     label: t('common.detail'),
//     icon: 'file_open',
//     command: showDetail
//   }
// ];
const subHeaders = ref<DashboardWidgetSubHeader[]>([
  {
    key: 'all',
    label: 'ecm.widget.group.all',
    count: 0,
    action: loadAllGroup
  },
  {
    key: 'favorite',
    label: 'ecm.widget.group.favorite',
    count: 0,
    action: loadFavoriteGroup
  }
]);

if (subHeaders.value.length) {
  subHeaders.value[0].action();
}

// function showDetail() {
//   return;
// }

function loadAllGroup() {
  activeSubHeader.value = 0;
  getGroupDashboard(props.widget?.recordNumber as number).onResult((response) => {
    groups.value = get(response, 'data.getGroupDashboard.allGroup', []);
    subHeaders.value.forEach(it => {
      if (it.key == 'all') {
        it.count = get(response, 'data.getGroupDashboard.totalAllGroup', 0);
      } else if (it.key == 'favorite') {
        it.count = get(response, 'data.getGroupDashboard.totalFavoriteGroup', 0);
      }
    });
  });
}

function loadFavoriteGroup() {
  activeSubHeader.value = 1;
  getGroupDashboard(props.widget?.recordNumber as number).onResult((response) => {
    groups.value = get(response, 'data.getGroupDashboard.favoriteGroup', []);
  });
}

function toggleActionMenu(event: Event, data: Group) {
  group.value = data;
  actionMenu.value.show(event);
}
</script>

<script lang='ts'>
export default { name: 'EcmMyGroupWidget' };
</script>