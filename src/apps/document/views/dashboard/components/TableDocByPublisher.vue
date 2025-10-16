<template>
  <div class='overflow-x-auto'>
    <table class='border-collapse min-w-full'>
      <thead>
        <tr class='bg-gray-100 dark:bg-gray-700'>
          <th class='border px-4 py-2 text-right'>STT</th>
          <th class='border px-4 py-2 text-left'>Đơn vị ban hành</th>
          <th class='border px-4 py-2 text-right'>Số lượng</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for='(item, index) in sortedData' 
          :key='index'
          class='dark:hover:bg-gray-600 hover:bg-gray-50'>
          <td class='border px-4 py-2 text-right'>{{ index + 1 }}</td>
          <td class='border px-4 py-2'>{{ item.publisherName }}</td>
          <td class='border px-4 py-2 text-right'>{{ item.count }}</td>
        </tr>
        <tr v-if='sortedData.length === 0'>
          <td
            class='border px-4 py-2 text-center'
            colspan='3'>Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  data?: Array<{
    publisherName: string;
    count: number;
  }> | null;
}>();

const sortedData = computed(() => {
  if (!props.data) {
    return [];
  }
  return [...props.data].sort((a, b) => b.count - a.count);
});
</script>