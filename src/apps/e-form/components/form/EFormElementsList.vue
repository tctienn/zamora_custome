<template>
  <div class='border-round card m-0 sidebar'>
    <div class='font-semibold text-xl'>Elements</div>
    <div
      class='element-list'
      :class='{"p-disabled": disabled }'>
      <div
        v-for='element in Object.keys(defaultConfigElements)'
        :key='element'
        class='element-item'>
        <DynamicEFormElement
          :draggable='true'
          :mode='ElementMode.PREVIEW'
          :type='ElementType[element as keyof typeof ElementType]'
          @dragstart='$emit("drag", element)'/>

        <i
          class='cursor-pointer pi pi-plus'
          @click='$emit("add-element", element)'></i>
      </div>

    </div>
  </div>
</template>

<script lang='ts' setup>
import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode, ElementType } from '@/apps/e-form/components/element';
import { defaultConfigElements } from '@/apps/e-form/components/element-config';

defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});
defineEmits(['drag', 'add-element']);
</script>

<style lang='scss' scoped>

.sidebar {
  width: 15rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.element-list {
  display: flex;
  flex-direction: column;
}

.element-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-b);
  border: 1px solid var(--surface-d);
  padding: 0.5rem;
  cursor: grab;

  :is(i) {
    opacity: 0;
  }

  &:hover {
    :is(i) {
      opacity: 1;
    }
  }
}
</style>