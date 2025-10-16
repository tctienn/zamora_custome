<template>
  <div
    class='align-items-center cursor-pointer flex gap-1 pb-1 pt-2 px-2 toggle-item'
    style='user-select: none'
    @click='toggle = !toggle'>
    <AppIcon
      class='icon-rotate'
      :class="toggle ? 'rotate' : ''"
      name='expand_more'
      size='1.7'/>
    <span class='text-blue-600'>{{ label }}<span class='font-bold text-700'>{{ type }}</span></span>
  </div>
  <Transition name='expand'>
    <div
      v-show='toggle'
      class='mb-2'
      style='min-height: 60px'>
      <div
        v-for='(item, i) in data'
        :key='i'
        class='cursor-pointer expand-item mb-1'
        style='height: 65px'>
        <div
          class='flex gap-3 h-full p-2'
          @click='setNewEmployee(item)'>
          <HrmAvatar
            :avatar='generateAvatarUrl(item.avatar)'
            class='border-round-sm col-4 p-0'
            width='50px'/>
          <div class='flex flex-column w-full'>
            <div class='font-bold'>{{ item.fullName }}</div>
            <div class='text-sm'>{{ item.positionName }}</div>
            <div class='text-sm'>{{ item.organizationName }}</div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang='ts'>
import { inject, type PropType, ref } from 'vue';

import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { Employee } from '@/apps/hrm/model/employee';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  label: {
    type: String,
    default: 'Nhân sự cùng '
  },
  type: {
    type: String,
    default: ''
  },
  data: {
    type: Array as PropType<any>,
    default: [] as any[]
  }
});
const toggle = ref(true);
if (props.data.length === 0) {
  toggle.value = false;
}

const employeeIdObj = inject('employeeId', {
  get: () => ({
    id: '',
    snapshotId: undefined
  }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set: (_val: { id: string; snapshotId?: string }) => {
  } // Placeholder for injection, will be overridden in parent
});

const setNewEmployee = (data: any) => {
  // Gán lại giá trị employeeId khi chọn nhân sự mới
  console.log(data);
  if (data && data.id) {
    employeeIdObj.set({
      id: data.id,
      snapshotId: data.snapshotId
    });
  }
};
</script>

<style lang='scss' scoped>
.toggle-item {
  margin-bottom: 10px;
  background: var(--surface-b);

  &:first-child {
    border-radius: 6px 6px 0 0;
  }
}

:deep(.image-container) {
  width: 50px;
  height: 50px;
}

:deep(.image-container img) {
  height: 100%;
  object-fit: cover;
}

/* Transition expand/collapse */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.icon-rotate {
  transition: transform 0.3s ease;
}

.rotate.icon-rotate {
  transform: rotate(-90deg);
}

.expand-item {
  :hover {
    background-color: #E5F3FF;
  }
}
</style>