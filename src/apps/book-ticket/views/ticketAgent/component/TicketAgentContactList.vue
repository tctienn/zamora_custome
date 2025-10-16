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
      :value='props.ticketAgentContacts'>
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
        field='ticketAgentContactName'
        :header='t(`book-ticket.ticketAgent.contactList.name`)'
        style='min-width: 10vw'>
      </Column>
      <Column
        class='text-center'
        field='ticketAgentContactEmail'
        :header='t(`book-ticket.ticketAgent.contactList.email`)'
        style='min-width: 10vw'>
      </Column>
      <Column
        class='text-center'
        field='ticketAgentContactPhone'
        :header='t(`book-ticket.ticketAgent.contactList.phone`)'
        style='min-width: 10vw'>
        <!-- <template #body='{ data: { attachmentInfo } }'>
          {{ formatFileSize(attachmentInfo.size) }}
        </template> -->
      </Column>
      <div v-if='!isDetail'>
        <Column
          class='col px-0 text-center'
          :header='t(`book-ticket.ticketAgent.contactList.action`)'
          style='min-width: 4rem'>
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

import type { ITicketAgentContact } from '@/apps/book-ticket/model/ticketAgent';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  ticketAgentContacts: {
    type: Array as PropType<ITicketAgentContact[]>,
    required: false,
    default: () => []
  },
  isDetail: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:ticket-agent-contacts']);
const { t } = useI18n();
const selectedRow = ref<ITicketAgentContact>({} as ITicketAgentContact);
const menuAction = ref();
const handleShowTicketAgentModal = inject('handleShowTicketAgentModal', (data?: ITicketAgentContact) => void {});
function handleEdit(row :ITicketAgentContact) {
  handleShowTicketAgentModal(row);
}

const removeTicketAgentContact = async (row: ITicketAgentContact) => {
  const updatedTicketAgentContact = props.ticketAgentContacts.filter(item => item !== row);
  emit('update:ticket-agent-contacts', updatedTicketAgentContact);
};

function toggleActionMenu({
  event,
  data
}: { event: Event, data: ITicketAgentContact }) {
  menuAction.value.toggle(event);
  selectedRow.value = data;
  
}
const menuActionCondition = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => handleEdit(selectedRow.value.ticketAgentContactId ? selectedRow.value : selectedRow.value)
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => removeTicketAgentContact(selectedRow.value)
  },
];
const menuActions = menuActionCondition;
</script>

<style scoped>

</style>