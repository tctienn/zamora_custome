<template>
  <div>

    <Toolbar class='py-2'>
      <template #start>
        <div class='font-semibold'>
          {{ t('hrm.defaultAttendance.finger.users.title') }}
        </div>
      </template>
      <template #end>
        <Button
          icon='pi pi-sync'
          :label='t("common.sync")'
          :loading='isSyncing'
          @click='sync'></Button>
      </template>
    </Toolbar>

    <DataTable
      :current-page-report-template="t('common.resultPagination', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      })"
      data-key='id'
      lazy
      paginator
      paginator-template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport'
      row-hover
      :rows='pageable.size'
      :rows-per-page-options='[10, 20, 50]'
      :total-records='total'
      :value='data'
      @page='onPage($event)'>
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'
        style='width: 5rem'>
        <template #body='{index}'>
          {{ pageable.page * pageable.size + index + 1 }}
        </template>
      </Column>
      <Column
        field='id'
        :header='t("hrm.defaultAttendance.finger.users.code")'
        style='width: 10rem'/>
      <Column
        field='name'
        :header='t("hrm.defaultAttendance.finger.users.name")'/>
      <Column
        class='text-center'
        field='enabled'
        :header='t("common.status")'
        style='width: 10rem'>
        <template #body='{data: {enabled}}'>
          <span
            class='status-badge'
            :class='`status-${enabled ? "active" : "deactivate"}`'>{{
              t(`common.statuses.${enabled ? 'active' : 'deactivate'}`)
            }}</span>
        </template>
      </Column>
      <template #empty>
        <EmptyResult/>
      </template>
    </DataTable>
  </div>

</template>

<script setup lang='ts'>
import type { DataTablePageEvent } from 'primevue/datatable';
import { computed, inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { fingerUsers, syncFingerUsers } from '@/apps/hrm/api/graphql/finger';
import type { FingerUser } from '@/apps/hrm/model/default_attendance';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { DEFAULT_PAGE } from '@/common/constants';
import type { Connection } from '@/common/model/page';
import { Direction } from '@/common/model/query';

const { t } = useI18n();

const searchTerm = inject('searchTerm', ref(''));
const pageable = reactive({
  ...DEFAULT_PAGE,
  sort: [{
    property: 'id',
    direction: Direction.ASC
  }]
});

const {
  result,
  refetch
} = fingerUsers(searchTerm.value, pageable);

const data = computed(() => (result.value?.fingerUsers as Connection<FingerUser>)?.edges?.map(e => e.node) || []);
const total = computed(() => (result.value?.fingerUsers as Connection<FingerUser>)?.totalCount || 0);
watch(searchTerm, (value) => {
  pageable.page = 0;
  refetch({
    keyword: value,
    pageable
  });
});

function onPage(event: DataTablePageEvent) {
  pageable.page = event.page;
  pageable.size = event.rows;
}

const isSyncing = ref(false);

function sync() {
  isSyncing.value = true;
  syncFingerUsers().mutate().then(() => {
    refetch();
  })
    .finally(() => {
      isSyncing.value = false;
    });
}
</script>

<style scoped>

</style>