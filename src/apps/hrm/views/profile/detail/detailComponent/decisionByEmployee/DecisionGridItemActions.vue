<template>
  <div>
    <slot name='trigger'>
      <Button
        ref='actionBtn'
        class='p-0 p-button-text'
        icon='pi pi-ellipsis-v'
        @click='toggleMainMenu'/>
    </slot>

    <Menu
      ref='menuRef'
      :model='menuItems'
      :popup='true'>
      <template #submenuheader='{ item }'>
        <div>
          <i class='pi pi-download'></i>
          <span class='ml-2'>{{ item.label }}</span>
        </div>
      </template>
      <template #item='{ item, props }'>
        <a
          v-ripple
          class='align-items-center flex'
          :class='item.class'
          v-bind='props.action'>
          <span :class='item.icon' />
          <span class='ml-2'>{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { computed, type PropType, ref } from 'vue';

import type { DecisionInterface } from '@/apps/hrm/model/decision';
import { generateDownloadUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  decision: {
    type: Object as PropType<DecisionInterface>,
    required: true,
  }
});

const emit = defineEmits<{
  (e: 'view-detail', decision: any): void;
}>();

if (!props.decision) {
  throw new Error('[DecisionGridItemActions] Missing required prop: decision');
}

const actionBtn = ref();
const menuRef = ref();

function viewDetail() {
  emit('view-detail', props.decision);
}

const fileSubMenuItems = computed(() =>
  props.decision?.files?.map((file: any) => ({
    label: file.name,
    class: 'mx-3',
    command: () => generateDownloadUrl(file.path),
  })) ?? []
);

const menuItems = computed(() => [
  {
    label: 'Xem chi tiết',
    icon: 'pi pi-info-circle',
    command: () => viewDetail(),
  },
  {
    label: 'Tải xuống',
    icon: 'pi pi-download',
    items: fileSubMenuItems.value,
  },
]);

const toggleMainMenu = (event: Event) => {
  menuRef.value.toggle(event);
};
</script>

<style scoped>
.p-button.p-0 {
  width: 2rem;
  height: 2rem;
}
</style>
