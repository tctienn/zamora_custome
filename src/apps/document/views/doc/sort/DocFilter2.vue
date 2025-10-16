<template>
  <Button
    v-tooltip='t("common.filter")'
    class='badge-icon px-1 py-1'
    icon='pi pi-filter'
    style='max-width:32px'
    text
    @click='menuRef?.toggle($event)'>

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
          :class-icon="[ code === filter ? 'icon-active' : '']"
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
// const menuFilters = computed((): MenuFilter[] => filters.map(m => {
//   return {
//     ...m,
//     command(event) {
//       m.command && m.command(event);
//       changeFilter(event.item);
//     },
//   };
// }));
const menuFilters: MenuItem[] = [
  {
    label: t('common.all'),
    code: 'all',
    icon: 'mail',
    command(event) {
      changeFilter(event.item);
    }
  },
  {
    label: 'Văn bản chưa đọc',
    code: 'DocUnread',
    icon: 'mark_email_unread',
    command(event) {
      changeFilter(event.item);
    }
  },
  {
    label: 'Văn bản quá hạn',
    code: 'DocOverdue',
    icon: 'flag',
    command(event) {
      changeFilter(event.item);
    }
  },
  {
    label: 'Cơ quan ban hành',
    code: 'DocOrganization',
    icon: 'account_balance',
    command(event) {
      changeFilter(event.item);
    }
  },
  {
    label: 'Loại văn bản',
    code: 'DocType',
    icon: 'list_alt',
    command(event) {
      changeFilter(event.item);
    }
  }
];

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
</style>