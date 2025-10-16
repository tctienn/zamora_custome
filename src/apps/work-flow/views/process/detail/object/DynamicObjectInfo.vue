<template>
  <div
    class='grid'>
    <template
      v-for='field in fields'
      :key='field'>
      <DynamicField
        v-if='modelValue[field]!=undefined'
        class='col-6'
        :field='field'
        :value='modelValue[field]'/>
    </template>
  </div>
</template>

<script setup lang='ts'>
import { omit } from 'lodash';
import { computed, type PropType } from 'vue';

import type { ObjectInfo } from '@/apps/work-flow/model/process/flow-type';
import DynamicField from '@/apps/work-flow/views/process/detail/object/DynamicField.vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<ObjectInfo>,
    required: true
  }
});

const fields = computed(() => Object.keys(omit(props.modelValue, 'id', 'isDeleted', 'deleted'))
  .sort((a, b) => {
    if (a.includes('name') && !b.includes('name')) {
      return -1;
    }
    if (!a.includes('name') && b.includes('name')) {
      return 1;
    }
    return 0;
  }));
</script>

<style scoped>

</style>