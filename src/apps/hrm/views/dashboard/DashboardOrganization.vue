<template>
  <div class='mb-0 mt-2 mx-0 pb-0 relative surface-0'>
    <Carousel
      v-if='!loading'
      :autoplay-interval='3000'
      :num-scroll='1'
      :num-visible='6'
      :pt='{
        "indicators": {
          style: {
            "display": "none"
          }
        }
      }'
      :responsive-options='responsiveOptions'
      :value='organizations'>
      <template #item='slotProps'>
        <div
          class='bg-blue-50 border-1 border-round h-5rem m-2 p-2 surface-border'
          :class="{
            'bg-primary text-white': slotProps.data.organizationName === 'Tất cả nhân sự',
            'bg-blue-100 text-black': slotProps.data.organizationName !== 'Tất cả nhân sự'
          }">
          <div
            class='flex gap-3 justify-content-center'
            :class="{
              'text-white': slotProps.data.organizationName === 'Tất cả nhân sự',
              'text-black': slotProps.data.organizationName !== 'Tất cả nhân sự'
            }">

            <AppIcon
              class='cursor-pointer'
              :name='slotProps.data.isRoot ? "person" : "domain"'
              size='3'/>

            <div>
              <div class='font-semibold text-sm'>{{
                slotProps.data.organizationName.length > 25 ? slotProps.data.organizationName.substring(0, 25) + '...' : slotProps.data.organizationName
              }}
              </div>
              <div class='font-semibold text-4xl text-center'>{{ slotProps.data.totalEmp }}</div>
            </div>
          </div>
        </div>
      </template>
    </Carousel>

    <!-- Skeleton loader when data is loading -->
    <div
      v-else
      class='p-2'>
      <div
        class='grid'
        style='margin-bottom: -1rem;'>
        <div
          v-for='n in 6'
          :key='n'
          class='col-12 md:col-2 p-2'>
          <div
            class='bg-blue-50 border-1 border-round h-5rem m-2 p-2 surface-border'
            style='display: flex; align-items: center; justify-content: center;'>
            <Skeleton
              class='border-round h-full w-full'
              style='background-color: #e9ecef;'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import Skeleton from 'primevue/skeleton';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { countEmployeeInOrganization } from '@/apps/hrm/api/graphql/contract';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps<{
  organizationId?: string | null;
}>();

const { t } = useI18n();

const organizations = ref<any[]>([]);
const loading = ref(true);
const responsiveOptions = [
  {
    breakpoint: '1000px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '1199px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '575px',
    numVisible: 1,
    numScroll: 1
  }
];

// Process the API result to match the expected format for the template
const processResult = (result: any) => {
  if (result?.countEmployeeInOrganization) {
    const orgs = result.countEmployeeInOrganization;
    const dataFromApi = orgs.map((o: any) => {
      return {
        organizationName: o.organizationName,
        totalEmp: Number(o.totalEmp) || 0,
        isRoot: o.organizationId === props.organizationId
      };
    });

    organizations.value = [...dataFromApi];
  } else {
    organizations.value = [];
  }
  loading.value = false; // Set loading to false after data is processed
};

// Watch for changes in the organization id prop and fetch new data
watch(
  () => props.organizationId,
  (newId) => {
    if (newId) {
      loading.value = true; // Set loading to true when fetching new data
      // Call the new API with the organization id
      const { result } = countEmployeeInOrganization(newId);

      // Watch for changes in the result
      watch(result, (newResult) => {
        if (newResult) {
          processResult(newResult);
        }
      });
    } else {
      // If no organization id is selected, clear the data
      organizations.value = [];
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
:deep(.p-carousel-prev) {
  z-index: 1000;
  position: absolute;
}

:deep(.p-carousel-next) {
  position: absolute;
  right: 0;
  z-index: 1000;
}
</style>