<template>
  <component
    :is='tag'
    :style='{
      fontSize,
      color,
      fontWeight,
      textAlign: align
    }'>
    {{ label }}
  </component>
  <span>{{ subText }}</span>
</template>

<script lang='ts' setup>

defineProps<{
  subText: string,
  label: string;
  tag?: string;
  align?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
}>();
</script>

<style scoped>

</style>