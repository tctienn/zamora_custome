<template>
  <div class='card'>
    <DataTable
      :always-show-paginator='false'
      :first='first'
      paginator
      :rows='row'
      :value='props.data'>
      <Column
        class='text-center'
        header='STT'
        style='max-width: 5%'>
        <template #body='slotProps'>
          {{ currentPage * row + slotProps.index + 1 }}
        </template>
      </Column>
      <Column
        field='areaName'
        header='Lĩnh vực' />
      <Column
        class='text-center'
        field='count'
        header='Tổng cộng' />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';

interface CountDocByArea {
  areaId: string;
  areaName: string;
  count: number;
}

const props = defineProps({
  data: {
    type: Array as PropType<CountDocByArea[]>,
    default: () => [],
  },
});

const currentPage = ref(0);
const first = ref(0);
const row = ref(10);

function onPage(event: any) {
  currentPage.value = event.page;
  first.value = event.first;
}
</script>

<style scoped></style>
