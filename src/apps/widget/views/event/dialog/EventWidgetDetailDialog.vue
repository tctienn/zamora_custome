<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='`${t("common.detail")} ${lowerCase(t("widget.event.objectName"))}`'
    @hide='emits("hide-dialog")'>
    <div class='flex flex-column h-full overflow-hidden'>
      <div class='flex flex-column p-fluid'>
        <div class='column-gap-5 field flex'>
          <div
            v-for='(type, index) in eventTypes'
            :key='type'
            class='align-items-center flex'>
            <RadioButton
              v-model='eventType'
              disabled
              :input-id='`ingredient_${index}}`'
              :value='type'/>
            <label
              class='ml-2'
              :for='`ingredient_${index}}`'>{{ t(`widget.event.${camelCase(type)}`) }}</label>
          </div>
        </div>

        <div
          v-if='eventType === EventType[EventType.GROUP]'
          class='field'>
          <label for='name'>{{ t('common.group') }}</label>
          <Dropdown
            v-model='group'
            disabled
            input-class='py-2'
            option-label='name'
            :options='[group]'
            :placeholder='t("common.selectGroup")'/>
        </div>

        <div class='field'>
          <label for='name'>{{ t('widget.event.name') }}</label>

          <InputText
            id='name'
            v-model='event.name'
            class='py-2'
            disabled/>
        </div>

        <div class='field'>
          <label for='date'>{{ t('widget.event.time') }}</label>

          <div class='column-gap-2 flex flex-row'>
            <Calendar
              id='date'
              v-model='event.date'
              class='align-self-start flex-1'
              disabled
              input-class='py-2'
              show-button-bar/>
            <div class='flex flex-1 flex-column row-gap-2'>
              <div class='column-gap-2 flex flex-row'>
                <Calendar
                  id='fromAt'
                  v-model='event.fromAt'
                  class='flex-1'
                  disabled
                  input-class='py-2'
                  :step-minute='15'
                  :time-only='true'/>
                <Calendar
                  id='toAt'
                  v-model='event.toAt'
                  class='flex-1'
                  disabled
                  input-class='py-2'
                  :step-minute='15'
                  :time-only='true'/>
              </div>

              <div class='column-gap-2 flex flex-row justify-content-center'>
                <Checkbox
                  id='allDay'
                  v-model='event.isAllDay'
                  :binary='true'
                  disabled/>
                <label for='allDay'>{{ t("widget.event.allDay") }}</label>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if='eventType === EventType[EventType.ORGANIZATION]'
          class='field'>
          <label for='host'>{{ t('widget.event.host') }}</label>
          <Dropdown
            v-model='event.host'
            disabled
            display='chip'
            input-id='host'
            option-label='fullName'
            option-value='id'
            :options='users'>
            <template #option='{ option: { id } }'>
              <AppUser
                avatar-size='1.75'
                info-visible
                name-visible
                :user-id='id' />
            </template>

            <template #value='{value}'>
              <AppUser
                avatar-size='1.75'
                info-in-one-line
                info-visible
                name-visible
                :user-id='value as string'/>
              
            </template>
          </Dropdown>
        </div>

        <div
          v-if='isGroupOrganization'
          class='field'>
          <label for='date'>{{ t('widget.event.participant') }}</label>

          <MultiSelect
            disabled
            display='chip'
            :model-value='event.participants'
            option-value='id'
            :options='users'>
            <template #option='{ option: { id } }'>
              <AppUser
                avatar-size='1.75'
                info-visible
                name-visible
                :user-id='id'/>
            </template>

            <template #chip='{value}'>
              <AppUser
                avatar-size='1.75'
                name-visible
                :user-id='value as string'/>
            </template>
          </MultiSelect>
        </div>

        <div class='field'>
          <label for='location'>{{ t('widget.event.location') }}</label>

          <InputText
            id='location'
            v-model='event.location'
            class='py-2'
            disabled/>
        </div>

        <div class='field'>
          <label for='description'>{{ t('common.description') }}</label>

          <Textarea
            id='description'
            v-model='event.description'
            class='resize-none'
            disabled
            rows='3'/>
        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { camelCase, filter, get, lowerCase } from 'lodash';
import { computed, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getGroupGraphql } from '@/apps/widget/api/graphql/group-graphql';
import { getActiveUsersGraphql } from '@/apps/widget/api/graphql/user-graphql';
import AppUser from '@/common/components/app/AppUser.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { mapEnum } from '@/common/helpers/utils';
import type { Group } from '@/common/model/group';
import { User } from '@/common/model/User';
import { type Event, EventType } from '@/common/model/widget/event';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<Event>,
    default: {} as Event
  }
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();

const eventDetailFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};
provide('dialogFooterButtons', eventDetailFooterButtons);

const { moment } = useMoment();

const visible = ref(props.dialogVisible);
const event = ref<Event>({
  ...props.item,
  ...{ date: moment(props.item?.date).toDate() }
});

const eventType = ref(event.value?.type ?? EventType[EventType.PERSONAL]);
const users = ref<User[]>([]);
const group = ref<Group>({} as Group);
const eventTypes = filter(mapEnum(EventType), (type) => type !== EventType[EventType.SYSTEM]);

const isGroupOrganization = computed(() => [EventType[EventType.GROUP], EventType[EventType.ORGANIZATION]].includes(eventType.value));

if (event.value.subjectId && event.value.type === EventType[EventType.GROUP]) {
  const { onResult: getGroupResult } = getGroupGraphql(event.value.subjectId);
  getGroupResult((response) => {
    group.value = get(response, 'data.getUserGroup', {} as Group);
    users.value = group.value.users;
  });
}

if (event.value.type === EventType[EventType.ORGANIZATION]) {
  const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

  getActiveUsersResult((response) => {
    users.value = get(response, 'data.getAllUserStatusActive', []);
  });
}

</script>

<script lang='ts'>
export default { name: 'EventWidgetDetailDialog' };
</script>

<style scoped lang='scss'>
:deep(.p-multiselect) {
  .p-multiselect-label {
    display: flex;

    .p-multiselect-token {
      padding: 0 0.75rem 0 0;
      margin-top: 0.125rem;
      margin-bottom: 0.125rem;

      .p-multiselect-token-icon {
        display: none;
      }
    }
  }
}

:deep(.p-dropdown-label) {
  padding: 0.5rem 0.75rem;
}
</style>