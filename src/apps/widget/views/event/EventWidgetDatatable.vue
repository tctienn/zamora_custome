<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :total-records='events.length'
    :value='events'>

    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <span class='font-bold text-primary text-white text-xl'>{{ t('widget.event.tableTitle') }} (
          {{
            moment(fromDate).format('DD/MM/YYYY')
          }}
          -
          {{
            moment(toDate).format('DD/MM/YYYY')
          }}
          )</span>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('widget.event.objectName')) })
      }}</span>
    </template>

    <Column
      field='ordinalNumber'
      header='#'>
    </Column>

    <Column
      field='name'
      :header='t("widget.event.name")'>
    </Column>

    <Column
      field='type'
      :header='t("common.type")'>
      <template #body='{data: {type}}'>
        {{ t(`widget.event.${camelCase(type)}`) }}
      </template>
    </Column>

    <Column
      field='type'
      :header='t("common.status")'>
      <template #body='{data: {isApproved, type}}'>
        {{ isApproved && type === EventType[EventType.ORGANIZATION] ? t('common.approved') : '-' }}
      </template>
    </Column>

    <Column
      field='host'
      :header='t("widget.event.host")'>
      <template #body='{data: {host}}'>
        <template v-if='host'>
          <AppUser
            avatar-size='2'
            info-visible
            name-visible
            overlay-visible
            :user-id='host'/>

        </template>
        <template v-else>-</template>
      </template>
    </Column>

    <Column
      field='participants'
      :header='t("widget.event.participant")'>
      <template #body='{data: {participants}}'>
        <div
          v-if='participants["length"]'
          class='flex flex-row'>
          <AppGroupAvatar
            avatar-size='2'
            :user-ids='participants as string[]'/>
        </div>
        <template v-else>-</template>
      </template>
    </Column>

    <Column
      field='date'
      :header='t("common.date")'>
      <template #body='{data: {date}}'>
        {{ moment(date).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      field='time'
      :header='t("common.time")'>
      <template #body='{data: {fromAt, toAt}}'>
        {{ fromAt }}
        <template v-if='toAt'>
          - {{ toAt }}
        </template>
      </template>
    </Column>

    <Column
      field='actions'
      :header='t("common.action")'>
      <template #body='{data}'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='list'
          rounded
          text
          @click='menuAction.toggle($event); event = data;'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { camelCase, toLower } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { EventType } from '@/common/model/widget/event';

defineProps({
  events: {
    type: Array as PropType<Event[]>,
    default: () => []
  },
  fromDate: {
    type: String,
    default: ''
  },
  toDate: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['event-detail', 'edit-event', 'delete-event']);
const { t } = useI18n();
const { moment } = useMoment();

const event = ref<Event>({} as Event);

const menuAction = ref();
const menuActions = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    command: () => {
      emits('event-detail', event.value);
    }
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      emits('edit-event', event.value);
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      emits('delete-event', event.value);
    }
  }
];
</script>

<script lang='ts'>
export default { name: 'EventWidgetDatatable' };
</script>