<template>
  <div>
    <DataTable
      v-model:selection='selectedRow'
      class='overflow-auto w-full'
      row-hover
      selection-mode='single'
      show-gridlines
      striped-rows
      style='max-height: unset'
      :value='props.citys'>
      <Column
        class='text-center'
        frozen
        header='TT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='col text-center'
        field='cityName'
        :header='t(`book-ticket.country.city.name`)'
        style='min-width: 10vw'>
      </Column>
      <div v-if='!isDetail'>
        <Column
          class='col px-0 text-center'
          :header='t(`book-ticket.ticketAgent.contactList.action`)'
          style='width: 15%'>
          <template #body='{data}'>
            <ButtonIcon
              class='text-color'
              icon='more_vert'
              icon-size='1.7'
              rounded
              text
              @click='toggleActionMenu({event : $event, data : data})'/>
          </template>
        </Column>
      </div>
    </DataTable>
    <Menu
      ref='menuAction'
      :model='menuActions'
      :popup='true'>
      <template #item='{ item, props:itemProps }'>
        <div
          v-bind='itemProps'
          class='align-items-center cursor-pointer flex gap-2 px-4 py-2'>
          <AppIcon
            :class="item.icon === 'delete' ? 'text-red-500' : 'text-color'"
            :name='item.icon'
            size='1.5'/>
          <span>{{ item.label }}</span>
        </div>
      </template>
    </Menu>
  </div>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ICity } from '@/apps/book-ticket/model/country';

const props = defineProps({
  citys: {
    type: Array as PropType<ICity[]>,
    required: false,
    default: () => []
  },
  isDetail: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:citys']);
const { t } = useI18n();
const selectedRow = ref<ICity>({} as ICity);
const menuAction = ref();
const handleShowCityModal = inject('handleShowCityModal', (data?: ICity) => void {});
function handleEdit(row :ICity) {
  handleShowCityModal(row);
}

const removeCity = async (row: ICity) => {
  const updatedCity = props.citys.filter(item => item !== row);
  emit('update:citys', updatedCity);
};

function toggleActionMenu({
  event,
  data
}: { event: Event, data: ICity }) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
  
}
const menuActionCondition = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => handleEdit(selectedRow.value)
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => removeCity(selectedRow.value)
  },
];
const menuActions = menuActionCondition;
</script>

<style scoped>

</style>