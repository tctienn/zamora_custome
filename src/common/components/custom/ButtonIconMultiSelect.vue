<template>
  <div>
    <ButtonIcon
      class='bg-transparent border-transparent px-1'
      :icon='icon'
      @click='showMultiSelect'/>
    <MultiSelect
      ref='buttonIconMultiSelect'
      v-model='cols'
      class='opacity-0 overflow-hidden w-0'
      dropdown-icon='pi pi-credit-card'
      filter
      option-label='name'
      :options='columns'
      @change='onToggle'/>
  </div>
</template>

<script lang='ts' setup>

import type { MultiSelectChangeEvent } from 'primevue/multiselect';
import { ref } from 'vue';

interface FilterTableColumnProps {
  selectedColumns: { code: string, name: string }[];
  columns: { code: string, name: string }[];
  icon: string;
}

const props = withDefaults(defineProps<FilterTableColumnProps>(), {
  selectedColumns: () => [],
  columns: () => [],
  icon: ''
});

const emits = defineEmits(['on-toggle']);
const buttonIconMultiSelect = ref();
const cols = ref(props.selectedColumns);

const onToggle = (val: MultiSelectChangeEvent) => {
  emits('on-toggle', val.value);
};

function showMultiSelect() {
  buttonIconMultiSelect.value.show();
}

</script>

<script lang='ts'>
export default { name: 'FilterTableColumn' };
</script>

<style lang='scss' scoped>
</style>