<template>
  <div class='bg-orange-cus border-round-sm card flex gap-2 m-0 shadow-none w-full'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='align-items-center flex justify-content-between'>
        <div class='align-items-center flex justify-content-between'>
          <img
            alt='icon'
            class='border-circle h-3rem p-2 text-white w-3rem'
            src='/images/folder-icons/outgoing-doc.svg'/>
          <router-link
            class='font-bold m-0 ml-1 text-white text-xl'
            to='doc-out'>
            {{ t("document.menu.documentSubmit").toUpperCase() }}
          </router-link>
        </div>
        <h1 class='m-0 text-center text-white'>{{ total }}</h1>
      </div>
      <div class='ml-2'>
        <div class='flex flex-column flex-grow-1 gap-2'>
          <div
            v-for='menu in displayMenus'
            :key='menu.to?.name'
            class='gap-3'>
            <div class='align-items-center flex flex-grow-1'>
              <div style='min-width: 8rem'>
                <router-link
                  v-if='menu.to'
                  class='font-semibold text-white'
                  :to='menu.to'>
                  {{ menu.label }}
                </router-link>
                <div
                  v-else
                  class='font-semibold text-white'>
                  {{ menu.label }}
                </div>
              </div>

              <div class='align-items-center flex w-full'>
                <div
                  class='font-bold ml-2 text-lg text-white'
                  style='min-width: 2rem'>
                  {{ menu.count || 0 }}
                </div>
              </div>
            </div>

            <div class='flex mt-2 pl-3'>
              <div class='align-items-center flex gap-1'>
                <div class='text-white'>Thường:</div>
                <span
                  class='font-bold text-lg text-white'
                  style='min-width: 1.5rem'>
                  {{ menu.countNormal || 0 }}
                </span>
              </div>

              <div class='align-items-center flex gap-1'>
                <div class='text-white'>Hỏa tốc:</div>
                <span
                  class='font-bold text-lg text-white'
                  style='min-width: 1.5rem'>
                  {{ menu.countExpress || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useDocSubmitMenuConfig } from '@/apps/document/views/doc-menus';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  year: {
    type: Number,
    required: true,
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = computed((): DocSubmitSearch => {
  const date = moment(`${props.year}-01-01`);
  return {
    searchTimeFrom: date
      .startOf('year')
      .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
    searchTimeTo: date.endOf('year').format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
  };
});

const { filteredDocSubmitMenus, updateCount } =
  useDocSubmitMenuConfig(search);
const menusNeedAction = [
  'DocumentSubmitDraftManage',
  'DocumentSubmitWaitingProcessManage',
  'DocumentSubmitProcessingManage',
  'DocumentSubmitSpecialistProcessingManage',
  'DocumentSubmitSpecialistProcessedManage',
  'DocumentSubmitWaitingCommentManage',
];

const displayMenus = computed(() =>
  filteredDocSubmitMenus.value.filter((menu) =>
    menusNeedAction.includes(menu.to?.name as string),
  ),
);
const total = computed(() =>
  displayMenus.value.reduce((acc, menu) => acc + (menu.count || 0), 0),
);
const maxCount = computed(() =>
  Math.max(...displayMenus.value.map((menu) => menu.count || 0)),
);
watch(() => props.year, searchCounts);
watch(userDeptRole, searchCounts);

function searchCounts() {
  displayMenus.value.forEach(async (menu) => {
    if (menu.countFn) {
      const count = await menu.countFn();
      count !== undefined && updateCount(menu.to?.name as string, count);
    }
  });
}

onMounted(() => {
  searchCounts();
});
</script>

<style scoped>
.bg-orange-cus {
  background: #FF8B4E;
}
</style>
