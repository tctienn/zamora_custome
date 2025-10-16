<template>
  <Menu
    ref='menuRef'
    :model='filterMenus'
    popup/>
</template>

<script setup lang='ts'>
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { WorkStatus } from '@/apps/work-flow/model/process/work';
import { actionsMapping } from '@/apps/work-flow/views/process/work-menu';

const props = defineProps({
  workStatus: {
    type: String as PropType<WorkStatus> | undefined,
    default: undefined
  }
});
const emits = defineEmits(['startWorkFlow', 'viewDetailWorkFlow', 'cancelWorkFlow', 'resumeWorkFlow', 'deleteWorkFlow']);
const { t } = useI18n();
const allMenus: MenuItem[] = [
  {
    label: t('work-flow.work.startWorkFlow'),
    icon: 'pi pi-play',
    command: () => emits('startWorkFlow'),
    code: 'start',
  },
  {
    label: t('common.view'),
    icon: 'pi pi-eye',
    command: () => emits('viewDetailWorkFlow'),
    code: 'view',
  },
  {
    label: t('work-flow.work.cancelWorkFlow'),
    icon: 'pi pi-times',
    command: () => emits('cancelWorkFlow'),
    code: 'cancel',
  },
  {
    label: t('work-flow.work.resumeWorkFlow'),
    icon: 'pi pi-step-forward',
    command: () => emits('resumeWorkFlow'),
    code: 'resume',
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => emits('deleteWorkFlow'),
    code: 'delete',
  },
];

const filterMenus = computed(() => allMenus.filter(menu => actionsMapping[menu?.code]?.includes(props.workStatus || '')));
const menuRef = ref<Menu>();

const showMenu = (event: Event) => {
  if (filterMenus.value.length === 0) {
    return;
  }
  // menuRef.value?.hide();
  // nextTick(() => menuRef.value?.toggle(event));
  menuRef.value?.toggle(event);
};

defineExpose({ showMenu });
</script>

<style scoped>

</style>