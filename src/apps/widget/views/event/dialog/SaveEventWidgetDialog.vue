<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='`${t(`common.${event.id ? "edit" : "create"}`)} ${lowerCase(t("widget.event.objectName"))}`'
    @hide='emits("hide-dialog")'>
    <div class='flex flex-column h-full'>
      <div class='flex flex-column p-fluid'>
        <div class='column-gap-5 field flex'>
          <div
            v-for='(type, index) in eventTypes'
            :key='type'
            class='align-items-center flex'>
            <RadioButton
              v-model='eventType'
              :disabled='!!event.id'
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
          <label
            v-required
            for='name'>{{ t('common.group') }}</label>
          <Dropdown
            v-model='selectedGroup'
            input-class='py-2'
            option-label='name'
            :options='groups'
            :placeholder='t("common.selectGroup")'
            @change='changeGroup'/>
        </div>

        <div class='field'>
          <label
            v-required
            for='name'>{{ t('widget.event.name') }}</label>

          <InputText
            id='name'
            v-model='event.name'
            class='py-2'
            :class='{"p-invalid": v$.name.$errors.length}'/>
        </div>

        <div class='field'>
          <label
            v-required
            for='date'>{{ t('widget.event.time') }}</label>

          <div class='column-gap-2 flex flex-row'>
            <Calendar
              id='date'
              v-model='event.date'
              class='align-self-start flex-1'
              :class='{"p-invalid": v$.date.$errors.length}'
              input-class='py-2'
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
                  id='allDay'
                  v-model='event.isAllDay'
                  :binary='true'/>
                <label for='allDay'>{{ t("widget.event.allDay") }}</label>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if='eventType === EventType[EventType.ORGANIZATION]'
          class='field'>
          <label
            v-required
            for='host'>{{ t('widget.event.host') }}</label>
          <Dropdown
            v-model='event.host'
            display='chip'
            input-class='py-2'
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
                v-if='value'
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
          <label
            v-required
            for='date'>{{ t('widget.event.participant') }}</label>

          <MultiSelect
            v-model='event.participants'
            :class='{"p-invalid": v$.participants.$errors.length}'
            :disabled='!selectedGroup && eventType === EventType[EventType.GROUP]'
            display='chip'
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
          <label
            v-required
            for='location'>{{ t('widget.event.location') }}</label>

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
            class='resize-none'
            rows='3'/>
        </div>

        <!--      <div class='field'>-->
        <!--        <div class='flex flex-row'>-->
        <!--          <div class='align-items-center column-gap-2 flex flex-1 flex-row'>-->
        <!--            <Checkbox-->
        <!--              v-model='isRemind'-->
        <!--              :binary='true'-->
        <!--              input-id='remind'/>-->
        <!--            <label for='remind'>{{ t('widget.event.emailNotify') }}</label>-->
        <!--          </div>-->

        <!--          <div class='column-gap-2 flex flex-1 flex-row'>-->
        <!--            <Dropdown-->
        <!--              v-model='event.remind'-->
        <!--              class='w-full'-->
        <!--              :disabled='!isRemind'/>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--      </div>-->
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import { camelCase, filter, get, lowerCase, omit } from 'lodash';
import { computed, onMounted, type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getActiveUsersGraphql } from '@/apps/widget/api/graphql/user-graphql';
import { saveEventGraphql } from '@/common/api/graphql/event-graphql';
import { getGroupUserInGraphql } from '@/common/api/graphql/group-graphql';
import AppUser from '@/common/components/app/AppUser.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { mapEnum } from '@/common/helpers/utils';
import type { Group } from '@/common/model/group';
import { User } from '@/common/model/User';
import { type Event, EventType } from '@/common/model/widget/event';
import { useUserStore } from '@/common/store/user';

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

const saveEventFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveEvent()
  }
};
provide('dialogFooterButtons', saveEventFooterButtons);

const { moment } = useMoment();
const { user } = useUserStore();
// const isRemind = ref(false);

const visible = ref(props.dialogVisible);
const event = ref<Event>({
  ...props.item,
  date: moment(props.item?.date).toDate()
});

const eventType = ref(event.value?.type ?? EventType[EventType.PERSONAL]);
const groups = ref<Group[]>([]);
const users = ref<User[]>([]);
const selectedGroup = ref<Group>();
const eventTypes = filter(mapEnum(EventType), (type) => type !== EventType[EventType.SYSTEM]);

const isGroupOrganization = computed(() => [EventType[EventType.GROUP], EventType[EventType.ORGANIZATION]].includes(eventType.value));

function loadGroup() {
  const { onResult: getGroupUserInResult } = getGroupUserInGraphql();
  getGroupUserInResult((response) => {
    groups.value = get(response, 'data.groupUserIn', []);
    loadSelectedGroupAndUsers();
  });
}

function loadSelectedGroupAndUsers() {
  if (event.value.id && event.value.type === EventType[EventType.GROUP]) {
    selectedGroup.value = groups.value.find(g => g.id === event.value.subjectId);
    users.value = selectedGroup.value?.users || [];
  }
}

const validateRules = {
  name: { required },
  date: { required },
  fromAt: { required },
  participants: { required: requiredIf(isGroupOrganization.value) },
  location: { required }
};
const v$ = useVuelidate(validateRules, event);

const fromAtCalendar = ref();
const toAtCalendar = ref();

function onFocus(type: string) {
  // if (!event.value.fromAt && type === 'from') {
  //   event.value.fromAt = `${padStart(fromAtCalendar.value.currentHour, 2, '0')}:${padStart(fromAtCalendar.value.currentMinute, 2, '0')}`;
  // }
  // if (!event.value.toAt && type === 'to') {
  //   event.value.toAt = `${padStart(toAtCalendar.value.currentHour, 2, '0')}:${padStart(toAtCalendar.value.currentMinute, 2, '0')}`;
  // }
}

onMounted(() => {
  if (event.value.id && event.value.type === EventType[EventType.ORGANIZATION]) {
    loadAllUser();
  }
  loadGroup();
});

function loadAllUser() {
  const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

  getActiveUsersResult((response) => {
    users.value = get(response, 'data.getAllUserStatusActive', []);
  });
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

watch(() => eventType.value, () => {
  if (eventType.value === EventType[EventType.ORGANIZATION]) {
    loadAllUser();
  }
  event.value.participants = [];
  event.value.host = '';
});

function changeGroup() {
  users.value = selectedGroup.value?.users || [];
  event.value.participants = [];
}

const hourMinuteRegex = /((\d[0-2]?)|(0\d)):[0-5]\d$/;

function saveEvent() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const { mutate: saveEventMutate, onDone: saveEventDone, onError: saveEventError } = saveEventGraphql();
      const { date, fromAt, toAt, participatingDepartments, participants } = event.value;

      const isPersonal = eventType.value === EventType[EventType.PERSONAL];
      const isGroup = eventType.value === EventType[EventType.GROUP];
      const isOrganization = eventType.value === EventType[EventType.ORGANIZATION];

      const subjectGroupId = isGroup ? selectedGroup.value?.id : '';
      const toAtFormat = moment(toAt).format('HH:mm');

      saveEventMutate({
        event: {
          ...omit(event.value, 'subjectName'),
          ...{
            subjectId: isPersonal ? user.id : subjectGroupId,
            type: eventType.value,
            date: moment(date).format('YYYY-MM-DD'),
            fromAt: moment(fromAt).format('HH:mm'),
            toAt: !toAt ? null : toAtFormat,
            participatingDepartments: isOrganization ? participatingDepartments : [],
          }
        }
      });

      saveEventDone(() => {
        toastSuccess({});
        event.value = {} as Event;
        v$.value.$reset();
        emits('hide-dialog');
        emits('reload');
      });

      saveEventError((error) => {
        toastError({ message: error.message });
      });
    }
  });
}
</script>

<script lang='ts'>
export default { name: 'SaveEventWidgetDialog' };
</script>

<style scoped lang='scss'>
:deep(.p-multiselect) {

  .p-multiselect-label {
    display: flex;
    padding: .5rem;

    .p-multiselect-token {
      padding: 0 0.5rem 0 0;
    }
  }
}
</style>