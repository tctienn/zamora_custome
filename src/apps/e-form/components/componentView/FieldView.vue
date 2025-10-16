<template>
  <div class='flex gap-2'>
    <div class='font-semibold'>{{ label }}:</div>
    <div>{{ formatValue(modelValue) }}</div>
  </div>
</template>

<script setup lang='ts'>

import type { PropType } from 'vue';

defineProps({
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: Object as PropType<string | number | Date>,
    default: null
  }
});

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  if (typeof value === 'string') {
    // Kiểm tra nếu là chuỗi ISO date
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return formatDate(date);
    }
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'Có' : 'Không';
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  if (Array.isArray(value)) {
    return value.map(item => formatValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value); // hoặc bạn có thể hiển thị field cụ thể như `value.name`
  }

  return String(value);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN'); // format theo locale Việt Nam
}
</script>

<style scoped>

</style>