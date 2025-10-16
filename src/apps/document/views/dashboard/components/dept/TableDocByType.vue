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
        field='docTypeName'
        header='Loại văn bản' />
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

interface CountDocByType {
  docTypeId: string;
  docTypeName: string;
  count: number;
}

const props = defineProps({
  data: {
    type: Array as PropType<CountDocByType[]>,
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
