<template>
  <div class='flex flex-wrap'>
    <div
      v-for='item in dataSummary'
      :key='item.id'
      class='col-6 md:col-3 p-2'>
      <div
        class='border-round-sm items-detail px-3 py-2'
        :style='{ backgroundColor: item.color.bgColor, minHeight: "100px"}'>
        <i
          :class='item.icon'
          style='font-size: 1.5rem; color: var(--primary-color)'></i>
        <div>
          <p class='m-0'>{{ item.title }}</p>
          <p
            class='font-bold m-0 text-2xl text-center'
            :style='{ color: item.color.textColor }'>{{ item.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  dataSummary: {
    type: Array as () => Array<{
      id: number;
      title: string;
      value: string | number;
      icon: string;
      color: {
        bgColor: string;
        textColor: string;
      };
    }>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.items-detail {
  display: grid;
  grid-template-columns: 0.5fr auto;
  align-items: center;
  gap: 20px;
}
</style>