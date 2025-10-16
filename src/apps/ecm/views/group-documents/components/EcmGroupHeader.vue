<template>
  <div class='align-items-center flex flex-row justify-content-between my-2'>
    <div class='flex flex-row flex-wrap'>
      <span
        v-for='(summary, index) in summaries'
        :key='index'>
        {{ t(summary.key, {count: summary.count}) }}
        <span
          v-if='index < summaries.length - 1'
          class='inline-block mx-3'>/</span>
      </span>
    </div>

    <DataViewLayoutOptions v-model='layout'/>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  summaries: {
    type: Array as PropType<{key: string, count: number}[]>,
    default: () => []
  }
});

const emits = defineEmits(['change-layout']);

const { t } = useI18n();

const layout = ref<'list' | 'grid'>('list');

watch(() => layout.value, () => {
  emits('change-layout', layout.value);
});

</script>

<script lang='ts'>
export default { name: 'EcmGroupHeader' };
</script>