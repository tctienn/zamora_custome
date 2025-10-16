<template>
  <Button
    v-tooltip='t("common.sort")'
    class='badge-icon px-1 py-1'
    icon='pi pi-sort-amount-down'
    style='max-width:32px'
    text
    @click='menuRef?.show($event)'>
  </Button>

  <Menu
    ref='menuRef'
    :model='sortMenus'
    popup>
    <template #itemicon='{item}'>
      <div
        class='pr-2'
        :class='findOrder(item?.code)?.property ? "":"opacity-0"'>
        <i
          v-if='findOrder(item?.code)?.direction === Direction.ASC'
          class='pi pi-sort-alpha-down'></i>
        <i
          v-else
          class='pi pi-sort-alpha-up'></i>
      </div>

    </template>
  </Menu>
</template>

<script lang='ts' setup>
import type Menu from 'primevue/menu';
import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Direction, type Order } from '@/common/model/query';

const { t } = useI18n();
const updateOrder = inject('updateOrder', (orders: Order[]) => void {});
const sortFields = inject<Order[]>('sortFields', [{
  property: 'incomingDate',
  direction: Direction.DESC
}]);
const menuRef = ref<InstanceType<typeof Menu>>();
const sortMenus = computed(() => sortFields.map((field) => ({
  label: t(`document.doc.${field.property}`),
  code: field.property,
  command(event: MenuItemCommandEvent) {
    changeOrder(event.item.code);
  }
} as MenuItem)));

const orders = ref<Order[]>(sortFields.length > 0 ? [sortFields[0]] : []);

function findOrder(field: string | undefined) {
  return orders.value.find((o) => o.property === field);
}

function changeOrder(field: string) {
  const order = orders.value.find((o) => o.property === field);
  if (!order) {
    orders.value = [...orders.value, {
      property: field,
      direction: Direction.ASC
    }];
    return;
  }
  if (order.direction === Direction.ASC) {
    order.direction = Direction.DESC;
    return;
  }
  if (order.direction === Direction.DESC) {
    orders.value = orders.value.filter((o) => o.property !== field);
  }
}

watch(orders, (newOrder) => {
  updateOrder(newOrder);
});

onMounted(() => {
  updateOrder(orders.value);
});
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
</style>