<template>
  <div>
    <div
      class='align-items-center border-1 flex flex-row gap-2 h-full justify-content-center px-2 py-1'
      :class='severity'>
      <slot name='icon'>
        <AppIcon
          :class="'text-'+severity"
          :name='icon'
          size='1.5'/>
      </slot>
      <div class='align-items-center flex gap-1 text-sm'>
        <slot name='content'>
          <slot :quantity='quantity'>
            <span
              class='font-semibold'
              :class="'text-'+severity">{{ quantity }} </span>
          </slot>
          <slot
            :label='label'
            name='label'>
            {{ label }}
          </slot>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    default: undefined
  },
  label: {
    type: String,
    default: undefined
  },
  quantity: {
    type: Number,
    default: undefined
  },
  severity: {
    type: String as PropType<'info' | 'success' | 'warning' | 'danger'>,
    default: 'info',
  },
});
</script>

<style scoped>
.success {
  background-color: rgba(101, 214, 173, 0.1);
  border: 1px solid rgb(101, 214, 173);
}

.info {
  background-color: rgba(94, 208, 250, 0.1);
  border: 1px solid rgb(94, 208, 250);
}

.warning {
  background-color: rgba(250, 219, 95, 0.1);
  border: 1px solid rgb(250, 219, 95);
}

.danger {
  background-color: rgba(255, 155, 155, 0.1);
  border: 1px solid rgb(255, 155, 155)
}

.text-success {
  color: #22C55ED6;
}

.text-info {
  color: #2196F3D6;
}

.text-warning {
  color: #F0500AD6;
}

.text-danger {
  color: #FF2D2DD6;
}
</style>