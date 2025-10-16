<template>
  <div
    v-if='originCreatedType'
    class='border-round surface-border'
    @click='goToOrigin'>
    <div class='text-sm'>
      Được tạo từ {{ mapOriginModuleName[originCreatedType] }}
    </div>
    <div>
      <slot
        :data='originData'
        name='data'>
        <component
          :is='choseComponent'
          :origin-created-id='originCreatedId'
          :origin-created-type='originCreatedType'
          :origin-data='originData'
          @go-to-origin='goToOrigin'>
        </component>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';

import { mapOriginModuleName, OriginModule } from '@/apps/work/model/task';
import DocumentCreatedModule
  from '@/apps/work/views/task/component/detail/origin-created-module/DocumentCreatedModule.vue';

const props = defineProps({
  originCreatedType: {
    type: String as PropType<OriginModule>,
    default: undefined
  },
  originCreatedId: {
    type: String,
    default: undefined,
  },
  originData: {
    type: Object,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'goToOrigin', originCreatedId: string, originData: object, fetchedData: unknown): void
}>();

function goToOrigin(fetchedData: unknown) {
  props.originCreatedId && emits('goToOrigin', props.originCreatedId, props.originData || {}, fetchedData);
}

const choseComponent = computed(() => {
  switch (props.originCreatedType) {
  case OriginModule.DOCUMENT:
    return DocumentCreatedModule;
  }
});
</script>

<style scoped>

</style>