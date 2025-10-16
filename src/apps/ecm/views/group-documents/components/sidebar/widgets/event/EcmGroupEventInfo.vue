<template>
  <div class='flex flex-column'>
    <EcmGroupWidgetHeader
      :left-button='headerButton'
      :title='t("common.detail")'/>

    <div class='flex flex-column my-3 p-fluid'>
      <div class='field'>
        <label for='name'>{{ t('ecm.group.eventWidget.name') }}</label>

        <InputText
          id='name'
          v-model='event.name'
          :disabled='true'/>
      </div>

      <div class='field'>
        <label for='date'>{{ t('ecm.group.eventWidget.time') }}</label>

        <div class='column-gap-2 flex flex-row'>
          <Calendar
            id='date'
            v-model='event.date'
            class='align-self-start flex-1'
            :disabled='true'
            show-button-bar
            show-icon/>
          <div class='flex flex-1 flex-column row-gap-2'>
            <div class='column-gap-2 flex flex-row'>
              <Calendar
                id='fromAt'
                v-model='event.fromAt'
                class='flex-1'
                :disabled='true'
                :step-minute='15'
                :time-only='true'/>
              <Calendar
                id='toAt'
                v-model='event.toAt'
                class='flex-1'
                :disabled='true'
                :step-minute='15'
                :time-only='true'/>
            </div>

            <div class='column-gap-2 flex flex-row justify-content-center'>
              <Checkbox
                id='allDay'
                v-model='event.isAllDay'
                :binary='true'
                :disabled='true'/>
              <label for='allDay'>{{ t('ecm.group.eventWidget.allDay') }}</label>
            </div>
          </div>
        </div>
      </div>

      <div class='field'>
        <label for='date'>{{ t('ecm.group.eventWidget.participant') }}</label>

        <MultiSelect
          v-model='participants'
          disabled
          display='chip'
          :options='group.users'>
          <template #option='{ option: {id} }'>
            <AppUser
              avatar-size='1.75'
              name-visible
              :user-id='id'/>
            
          </template>

          <template #chip='{ value: {id } }'>
            <AppUser
              avatar-size='1.75'
              name-visible
              :user-id='id'/>
          </template>
        </MultiSelect>
      </div>

      <div class='field'>
        <label for='location'>{{ t('ecm.group.eventWidget.location') }}</label>

        <InputText
          id='location'
          v-model='event.location'
          :disabled='true'/>
      </div>

      <div class='field'>
        <label for='description'>{{ t('common.description') }}</label>

        <Textarea
          id='description'
          v-model='event.description'
          class='resize-none'
          :disabled='true'
          rows='3'/>
      </div>

      <div>
        <AppFileAttachment
          :attachments='attachmentList ?? []'
          :title='t("ecm.group.eventWidget.attachment")'>
        </AppFileAttachment>
      </div>

      <div class='column-gap-3 flex flex-row justify-content-center my-3'>
        <ButtonIcon
          class='w-auto'
          icon='close'
          :label='t("common.back")'
          severity='secondary'
          text
          @click='EventBus.emit("ecm-group-change-event-viewer-type",{
            type: "EcmGroupEventWidget",
            item: {}
          })'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { filter } from 'lodash';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findFileById } from '@/apps/ecm/api/graphql/file-graphql';
import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import AppFileAttachment from '@/common/components/app/upload/AppFileAttachment.vue';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { EcmFile } from '@/common/model/ecm';
import type { Group } from '@/common/model/group';
import type { Event } from '@/common/model/widget/event';

const props = defineProps({
  item: {
    type: Object as PropType<Event>,
    default: {} as Event
  }
});
const { t } = useI18n();
const { moment } = useMoment();

const event = ref<Event>({
  ...props.item,
  date: moment(props.item?.date).toDate()
});

const group = inject('group', ref<Group>({} as Group));

const participants = filter(group.value.users, (user) => event.value.participants.includes(user.id));

const headerButton = {
  icon: 'arrow_back',
  label: t('common.back'),
  command: () => {
    EventBus.emit('ecm-group-change-event-viewer-type', {
      type: 'EcmGroupEventWidget',
      item: {}
    });
  }
};
const attachmentList = ref<EcmFile[]>([]);

if (event.value.attachments) {
  event.value.attachments.map(item => {
    const { onResult: findFileResult } = findFileById(item);
    findFileResult((res) => {
      attachmentList.value.push(res.data.findFileById);
    });
  });
}

</script>

<script lang='ts'>
export default { name: 'EcmGroupEventInfo' };
</script>

<style scoped lang='scss'>
:deep(.p-multiselect) {
  .p-multiselect-label {
    display: flex;

    .p-multiselect-token {
      padding: 0;

      .p-multiselect-token-icon {
        display: none;
      }
    }
  }
}
</style>