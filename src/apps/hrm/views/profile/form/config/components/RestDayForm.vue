<template>
  <Dialog
    v-if='restDay'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-6 field'>
            <label
              v-required
              for='restDayName'>{{
                t('document.restDay.name')
              }}</label>
            <InputText
              v-model='restDay.restDayName'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !restDay.restDayName'
              class='p-error'>{{
                t('document.restDay.errors.nameEmpty')
              }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='year'>{{
                t('document.restDay.year')
              }}</label>
            <InputNumber
              v-model='restDay.year'
              input-id='integeronly'
              :use-grouping='false'/>
            <input
              v-model='restDay.year'
              hidden
              name='year'/>
            <small
              v-if='submitForm && !restDay.year'
              class='p-error'>{{
                t('document.restDay.errors.yearEmpty')
              }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='fromDate'>{{
                t('document.restDay.fromDate')
              }}</label>
            <NamedInputCalendar
              v-model='restDay.fromDate'
              class='w-full'
              icon-display='input'
              name='fromDate'
              :select-other-months='true'
              show-icon/>
            <small
              v-if='submitForm && !restDay.fromDate'
              class='p-error'>{{
                t('document.restDay.errors.fromDateEmpty')
              }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='toDate'>{{
                t('document.restDay.toDate')
              }}</label>
            <NamedInputCalendar
              v-model='restDay.toDate'
              class='w-full'
              icon-display='input'
              name='toDate'
              :select-other-months='true'
              show-icon/>
            <small
              v-if='submitForm && !restDay.toDate'
              class='p-error'>{{
                t('document.restDay.errors.toDateEmpty')
              }}</small>
          </div>

          <div class='col-12 field'>
            <label>{{ t('document.restDay.note') }}</label>
            <Textarea
              id='note'
              v-model='restDay.note'
              class='w-full'
              name='note'
              rows='3'/>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { isNull } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { RestDay, type RestDayInterface } from '@/apps/document/model/restDay';
import { getRestDayById, saveRestDay } from '@/apps/hrm/api/graphql/rest-day';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  restDay: {
    type: Object as PropType<RestDayInterface>,
    default: {} as RestDayInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);
const restDay = ref<RestDayInterface>(props.restDay);
if (props.id) {
  const { onResult } = getRestDayById(props.id || '');
  onResult((res) => {
    restDay.value = { ...res.data.getRestDayById };
  });
} else {
  restDay.value = new RestDay();
}

const { t } = useI18n();

let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);
const isCreate = isNull(props.id);
const { moment } = useMoment();

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.restDay.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.restDay.objectName')),
    name: restDay.value.restDayName,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveRestDayMutate,
  onDone: saveRestDayDone,
  onError: saveRestDayError,
} = saveRestDay();

function submit() {
  submitForm.value = true;
  if (
    !restDay.value.restDayName
    || !restDay.value.year
    || !restDay.value.fromDate
    || !restDay.value.toDate
  ) {
    return;
  }
  const {
    fromDate,
    toDate,
    ...rest
  } = restDay.value;
  const formattedRestDay = {
    ...rest,
    id: props.id || null,
    fromDate: moment(fromDate).format(DateTimeFormat.ISO_LOCAL_DATE),
    toDate: moment(toDate).format(DateTimeFormat.ISO_LOCAL_DATE),
  };
  saveRestDayMutate({ restDay: formattedRestDay });
}

saveRestDayDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.restDay.objectName'),
      itemName: restDay.value.restDayName,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  restDay.value = new RestDay();
});
saveRestDayError(() => {
});
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}
</style>
