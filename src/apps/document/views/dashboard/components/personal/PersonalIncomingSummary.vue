<template>
  <div :class='`card border-round-sm flex gap-2 m-0 shadow-none w-full ${bgClass}`'>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='align-items-center flex justify-content-between'>
        <div class='align-items-center flex justify-content-between'>
          <AppIcon
            class='text-white'
            name='archive'
            size='30px'/>
          <router-link
            class='font-bold m-0 ml-1 text-white text-xl'
            to='doc-in'>
            {{ t("document.menu.documentDocIn").toUpperCase() }}
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

import type { SearchModel } from '@/apps/document/model/doc/search';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useDocInMenuConfig } from '@/apps/document/views/doc-menus';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  year: {
    type: Number,
    required: true,
  },
  bgClass: {
    type: String,
    default: 'bg-orange-cus',
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const search = computed((): SearchModel => {
  const date = moment(`${props.year}-01-01`);
  return {
    searchTimeFrom: date
      .startOf('year')
      .format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
    searchTimeTo: date.endOf('year').format(DateTimeFormat.ISO_LOCAL_DATE_TIME),
  };
});

const { filteredDocInMenus, updateCount, updateCountWithPriority } =
  useDocInMenuConfig(search);
const menusNeedAction = [
  'DocumentDocInReceiveManage',
  'DocumentDocInWaitingManage',
  'DocumentDocInProcessingManage',
  'DocumentDocInClerkProcessingManage',
  'DocumentDocInWaitingCommentManage',
];

const displayMenus = computed(() =>
  filteredDocInMenus.value.filter((menu) =>
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
    if (menu.countWithPriorityFn) {
      const countWithPriority = await menu.countWithPriorityFn();
      countWithPriority
        && updateCountWithPriority(
          menu.to?.name as string,
          countWithPriority?.countNormal || 0,
          countWithPriority?.countExpress || 0,
        );
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
.bg-green-cus {
  background: #94C748;
}
</style>
