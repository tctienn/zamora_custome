<template>
  <div>
    <ButtonIcon
      class='bg-transparent border-transparent px-1'
      :icon='icon'
      @click='showDropdown'/>
    <Dropdown
      ref='buttonIconDropdown'
      class='opacity-0 overflow-hidden w-0'
      :filter='true'
      :model-value='selectedOption'
      option-label='label'
      option-value='value'
      :options='options'
      @update:model-value='updateSelectedGroup'/>
  </div>
</template>

<script lang='ts' setup>

import type { PropType } from 'vue';
import { ref } from 'vue';

defineProps({
  options: {
    type: Array as PropType<{ value: string, label: string }[]>,
    default: () => []
  },
  selectedOption: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update-selected-group']);
const buttonIconDropdown = ref();

function updateSelectedGroup(value: string) {
  emits('update-selected-group', value);
}

function showDropdown() {
  buttonIconDropdown.value.show();
}

</script>

<script lang='ts'>
export default { name: 'ButtonIconDropdown' };
</script>