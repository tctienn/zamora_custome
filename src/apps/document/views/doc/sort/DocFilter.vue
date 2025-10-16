<template>
  <Button
    v-if='menuFilters.length'
    v-tooltip='t("common.filter")'
    class='badge-icon px-3 py-1'
    text
    @click='menuRef?.toggle($event)'>
    <i
      class='cursor-pointer hover:text-primary pi pi-filter'></i>
  </Button>
  <Menu
    ref='menuRef'
    :model='menuFilters'
    popup>
    <template #item='{ item: { icon, label, code } }'>
      <div class='flex flex-row gap-1 items-center p-menuitem-link'>
        <i
          class='icon-active pi w-1rem'
          :class='{ "pi-check" : code === filter}'></i>

        <MenuItem
          :class-icon="[ code === filter ? 'icon-active text-xl' : 'text-xl']"
          :class-item="[ code === filter ? 'icon-active' : '']"
          :icon='icon'
          :label='label'/>
      </div>
    </template>
  </Menu>
</template>

<script lang='ts' setup>
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type MenuFilter = MenuItem & { code: string };

const { t } = useI18n();
const menuRef = ref<InstanceType<typeof Menu>>();
const filters = inject<MenuFilter[]>('filters', []);
const menuFilters = computed((): MenuFilter[] => filters.map(m => {
  return {
    ...m,
    command(event) {
      m.command && m.command(event);
      changeFilter(event.item);
    },
  };
}));
// const menuFilter: MenuItem[] = [
//   {
//     label: t('common.all'),
//     code: 'all',
//     command(event) {
//       changeFilter(event.item);
//     }
//   },
//   {
//     label: t('document.doc.mainProcessing'),
//     code: 'mainProcessing',
//     command(event) {
//       changeFilter(event.item);
//     }
//   },
//   {
//     label: t('document.doc.coordinatedProcessing'),
//     code: 'coordinatedProcessing',
//     command(event) {
//       changeFilter(event.item);
//     }
//   }
// ];

const filter = ref<string>('all');

function changeFilter(item: MenuItem) {
  filter.value = item.code;
}
</script>

<style lang='scss' scoped>
.badge-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--primary-color);
  border: 1px solid transparent;

  &:hover {
    border-color: var(--primary-100);
    background: var(--primary-50);
  }

  :deep(.p-badge) {
    background-color: var(--primary-color);
  }
}

.p-menuitem-link {
  padding: 0.5rem;

  :deep( .p-menuitem-link) {
    padding: 0;
  }
}
:deep(.icon-active) {
  color: rgb(13, 153, 255);
}
:deep(.material-symbols-outlined.custom-icon.text-xl) {
  font-size: 1.45rem !important;
}
</style>