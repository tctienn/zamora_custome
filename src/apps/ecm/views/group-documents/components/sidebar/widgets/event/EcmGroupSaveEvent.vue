<template>
  <div class='flex flex-column h-full overflow-hidden'>
    <EcmGroupWidgetHeader
      :left-button='headerButton'
      :title='t("ecm.group.eventWidget.create")'/>

    <div class='flex flex-column my-3 p-fluid'>
      <div class='field'>
        <label
          v-required
          for='name'>{{ t('ecm.group.eventWidget.name') }}</label>

        <InputText
          id='name'
          v-model='event.name'
          class='py-2'
          :class='{"p-invalid": v$.name.$errors.length}'/>
      </div>

      <div class='field'>
        <label
          v-required
          for='date'>{{ t('ecm.group.eventWidget.time') }}</label>

        <div class='column-gap-2 flex flex-row'>
          <Calendar
            v-model='event.date'
            class='align-self-start flex-1'
            :class='{"p-invalid": v$.date.$errors.length}'
            input-class='py-2'
            input-id='date'
            show-button-bar/>
          <div class='flex flex-1 flex-column row-gap-2'>
            <div class='column-gap-2 flex flex-row'>
              <Calendar
                id='fromAt'
                ref='fromAtCalendar'
                v-model='event.fromAt'
                class='flex-1'
                :class='{"p-invalid": v$.fromAt.$errors.length}'
                input-class='py-2'
                :step-minute='15'
                :time-only='true'
                @focus='onFocus("from")'/>
              <Calendar
                id='toAt'
                ref='toAtCalendar'
                v-model='event.toAt'
                class='flex-1'
                input-class='py-2'
                :step-minute='15'
                :time-only='true'
                @focus='onFocus("to")'/>
            </div>

            <div class='column-gap-2 flex flex-row justify-content-center'>
              <Checkbox
                v-model='event.isAllDay'
                :binary='true'
                input-id='allDay'/>
              <label for='allDay'>{{ t('ecm.group.eventWidget.allDay') }}</label>
            </div>
          </div>
        </div>
      </div>

      <div class='field'>
        <label
          v-required
          for='participants'>{{ t('ecm.group.eventWidget.participant') }}</label>

        <MultiSelect
          v-model='event.participants'
          class='text-sm'
          :class='{"p-invalid": v$.participants.$errors.length}'
          display='chip'
          input-id='participants'
          option-value='id'
          :options='group.users'>
          <template #option='{ option: {id} }'>
            <AppUser
              avatar-size='1.75'
              name-visible
              :user-id='id'/>
          </template>

          <template #chip='{ value }'>
            <AppUser
              avatar-size='1.75'
              name-visible
              :user-id='value'/>
          </template>
        </MultiSelect>
      </div>

      <div class='field'>
        <label
          v-required
          for='location'>{{ t('ecm.group.eventWidget.location') }}</label>

        <InputText
          id='location'
          v-model='event.location'
          class='py-2'
          :class='{"p-invalid": v$.location.$errors.length}'/>
      </div>

      <div class='field'>
        <label for='description'>{{ t('common.description') }}</label>

        <Textarea
          id='description'
          v-model='event.description'
          auto-resize
          class='py-2 resize-none'
          rows='3'/>
      </div>
      <div>
        <AppFileAttachment
          :attachments='attachmentList ?? []'
          editable
          :title=' t("ecm.group.eventWidget.attachment")'
          @update-files='updateAttachments'>
        </AppFileAttachment>
      </div>

      <!--      <div class='field'>-->
      <!--        <div class='flex flex-row'>-->
      <!--          <div class='align-items-center column-gap-2 flex flex-1 flex-row'>-->
      <!--            <Checkbox-->
      <!--              v-model='isRemind'-->
      <!--              :binary='true'-->
      <!--              input-id='remind'/>-->
      <!--            <label for='remind'>{{ t('ecm.group.eventWidget.emailNotify') }}</label>-->
      <!--          </div>-->

      <!--          <div class='column-gap-2 flex flex-1 flex-row'>-->
      <!--            <Dropdown-->
      <!--              v-model='event.remind'-->
      <!--              class='w-full'-->
      <!--              :disabled='!isRemind'/>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->

      <div class='column-gap-3 flex flex-row justify-content-center my-3'>
        <ButtonIcon
          class='w-auto'
          icon='close'
          :label='t("common.back")'
          severity='secondary'
          text
          @click='EventBus.emit("ecm-group-change-event-viewer-type",{type: "EcmGroupEventWidget"})'/>
        <ButtonIcon
          class='w-auto'
          icon='check'
          :label='t("common.save")'
          @click='saveEvent'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import { saveEventGraphql } from '@/common/api/graphql/event-graphql';
import AppUser from '@/common/components/app/AppUser.vue';
import AppFileAttachment from '@/common/components/app/upload/AppFileAttachment.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { EcmFile } from '@/common/model/ecm';
import type { Group } from '@/common/model/group';
import { type Event, EventType } from '@/common/model/widget/event';

const props = defineProps({
  item: {
    type: Object as PropType<Event>,
    default: {} as Event
  }
});
const { t } = useI18n();
const { moment } = useMoment();
// const isRemind = ref(false);

const event = ref<Event>(props.item);

const group = inject('group', ref<Group>({} as Group));

const headerButton = {
  icon: 'arrow_back',
  label: t('common.back'),
  command: () => {
    EventBus.emit('ecm-group-change-event-viewer-type', { type: 'EcmGroupEventWidget' });
  }
};
const validateRules = {
  name: { required },
  date: { required },
  fromAt: { required },
  participants: { required },
  location: { required }
};
const v$ = useVuelidate(validateRules, event);

const fromAtCalendar = ref();
const toAtCalendar = ref();

function onFocus(type: string) {
  // if (!event.value.fromAt && type === 'from') {
  //   event.value.fromAt = `${ padStart(fromAtCalendar.value.currentHour, 2, '0') }:${ padStart(fromAtCalendar.value.currentMinute, 2, '0') }`;
  // }
  // if (!event.value.toAt && type === 'to') {
  //   event.value.toAt = `${ padStart(toAtCalendar.value.currentHour, 2, '0') }:${ padStart(toAtCalendar.value.currentMinute, 2, '0') }`;
  // }
}

watch(() => event.value.isAllDay, () => {
  if (event.value.isAllDay) {
    event.value.fromAt = new Date('08:00');
    event.value.toAt = new Date('18:00');
  } else {
    event.value.fromAt = null;
    event.value.toAt = null;
  }
});

const hourMinuteRegex = /((\d[0-2]?)|(0\d)):[0-5]\d$/;

const files = ref<FileList>();

function updateAttachments(attachmentList: EcmFile[], fileUploads: FileList) {
  files.value = fileUploads;
}

const attachmentList = ref<EcmFile[]>([]);

function saveEvent() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const {
        mutate: saveEventMutate,
        onDone: saveEventDone,
        onError: saveEventError
      } = saveEventGraphql();
      const {
        date,
        fromAt,
        toAt,
        participants
      } = event.value;

      saveEventMutate({
        event: {
          ...event.value,
          ...{
            subjectId: group.value.id,
            type: EventType[EventType.GROUP],
            date: moment(date).format('YYYY-MM-DD'),
            fromAt: moment(fromAt).format('HH:mm'),
            toAt: moment(toAt).format('HH:mm'),
          }
        },
        attachments: files.value
      });

      saveEventDone(() => {
        toastSuccess({});
        event.value = {} as Event;
        files.value = {} as FileList;
        attachmentList.value = [];
        v$.value.$reset();
        EventBus.emit('updateListFileFolder');
      });

      saveEventError((error) => {
        toastError({ message: error.message });
      });
    }
  });
}
</script>

<script lang='ts'>
export default { name: 'EcmGroupSaveEvent' };
</script>

<style scoped lang='scss'>
:deep(.p-multiselect) {
  .p-multiselect-label {
    display: flex;

    .p-multiselect-token {
      padding: 0 0.5rem 0 0;
    }
  }
}
</style>
