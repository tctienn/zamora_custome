<template>

  <EcmGroupHeader
    :summaries='summaries.filter((s) => s.count)'
    @change-layout='changeLayout'/>

  <DataView
    data-key='id'
    :layout='layout'
    lazy
    :value='groups'>
    <template #empty>
      <span class='block font-bold py-3 text-600 text-center'>{{
        t('common.emptyRecords', {itemType: toLower(t('admin.userGroup.group'))})
      }}</span>
    </template>

    <template #list='{items}'>
      <div
        v-for='(data, index) in items'
        :key='index'>
        <div
          v-if='!index'
          class='flex flex-row font-bold w-full'>
          <div class='flex flex-row list-item'>
            <div class='col-3 text-center'> {{ t("ecm.group.name") }}</div>
            <div class='col-1 text-center'> {{ t("ecm.group.publicType") }}</div>
            <div class='col-2 text-center'> {{ t("ecm.group.admin") }}</div>
            <!--          <div class='col-1 text-center'> {{ t("ecm.group.numberOfMember") }}</div>-->
            <div class='col-2 text-center'> {{ t("common.status") }}</div>
            <div class='col-3 text-center'> {{ t("common.description") }}</div>
          </div>
          <div class='w-5rem'></div>
        </div>
        <EcmGroupItem
          :group='data'
          :layout='layout'/>
      </div>

    </template>

    <template #grid='{items}'>
      <EcmGroupItem
        v-for='data in items'
        :key='data.id'
        :group='data'
        :layout='layout'/>
    </template>
  </DataView>
</template>

<script setup lang='ts'>
import { countBy, get, some, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Level } from '@/apps/admin/model/userGroup';
import { getEcmGroupUserInGraphql } from '@/apps/ecm/api/graphql/group-graphql-api';
import EcmGroupHeader from '@/apps/ecm/views/group-documents/components/EcmGroupHeader.vue';
import EcmGroupItem from '@/apps/ecm/views/group-documents/components/EcmGroupItem.vue';
import { ACTIVITY_STATUSES } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import type { Group } from '@/common/model/group';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const groups = ref<Group[]>([]);
const layout = ref<'list' | 'grid'>('list');

const summaries = computed<{ key: string, count: number }[]>(() => [
  {
    key: 'ecm.group.totalGroup',
    count: groups.value.length
  },
  {
    key: 'ecm.group.countActiveGroup',
    count: countBy(groups.value, ['status', ACTIVITY_STATUSES.ACTIVE])['true']
  },
  {
    key: 'ecm.group.countDeactivateGroup',
    count: countBy(groups.value, ['status', ACTIVITY_STATUSES.DEACTIVATE])['true']
  },
  {
    key: 'ecm.group.countGroupAsAdmin',
    count: countBy(groups.value, (group) => some(group.users, {
      'id': user.value.id,
      'level': Level[Level.MANAGE]
    }))['true']
  },
  {
    key: 'ecm.group.countGroupAsMember',
    count: countBy(groups.value, (group) => some(group.users, {
      'id': user.value.id,
      'level': Level[Level.MEMBER]
    }))['true']
  }
]);

const { onResult: getGroupUserInResult, refetch: getGroupUserInRefetch } = getEcmGroupUserInGraphql();
getGroupUserInResult((response) => {
  groups.value = get(response, 'data.groupUserIn', []);
});

onMounted(() => {
  EventBus.on('reload-data', reload);
});

onUnmounted(() => {
  EventBus.off('reload-data', reload);
});

function reload() {
  getGroupUserInRefetch();
}

function changeLayout(lo: 'list' | 'grid') {
  layout.value = lo;
}
</script>

<script lang='ts'>
export default { name: 'EcmGroups' };
</script>

<style scoped lang='scss'>
:deep(.list-item) {
  width: calc(100% - 5rem);
}
</style>