<template>
  <div>
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <div class='col-12 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`hrm.category.code`) + ' ' + t(`hrm.category.${selectedCategory}`)
            }}</label>
          <InputText
            v-model='category.code'
            v-code
            :autofocus='isCreate'
            class='p-component p-inputtext w-full'
            :disabled='!isCreate'
            maxlength='255'
            name='code'/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>
        <div class='col-12 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`hrm.category.name`) + ' ' + t(`hrm.category.${selectedCategory}`)
            }}</label>
          <InputText
            v-model='category.name'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='name'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col-3 field'>
          <label class='font-bold'>{{
            t(`hrm.category.startTime`)
          }}</label>
          <Calendar
            v-model='category.startTime'
            class='w-full'
            hour-format='24'
            icon-display='input'
            name='startTime'
            show-icon
            show-time
            time-only/>
        </div>
        <div class='col-3 field'>
          <label class='font-bold'>{{
            t(`hrm.category.endTime`)
          }}</label>
          <Calendar
            v-model='category.endTime'
            class='w-full'
            hour-format='24'
            icon-display='input'
            name='endTime'
            show-icon
            show-time
            time-only/>
          <span
            v-if='!isValidEndTime'
            class='text-red-500 text-sm'>
            {{ t('hrm.category.endTimeMustBeGreater') }}
          </span>
        </div>

        <div class='col-3 field'>
          <label class='font-bold'>{{
            t(`hrm.category.breakTimeStart`)
          }}</label>
          <Calendar
            v-model='category.breakTimeStart'
            class='w-full'
            hour-format='24'
            icon-display='input'
            name='breakTimeStart'
            show-icon
            show-time
            time-only/>
        </div>
        <div class='col-3 field'>
          <label class='font-bold'>{{
            t(`hrm.category.breakTimeEnd`)
          }}</label>
          <Calendar
            v-model='category.breakTimeEnd'
            class='w-full'
            hour-format='24'
            icon-display='input'
            name='breakTimeEnd'
            show-icon
            show-time
            time-only/>
          <span
            v-if='!isValidBreakEndTime'
            class='text-red-500 text-sm'>
            {{ t('hrm.category.breakEndTimeMustBeGreater') }}
          </span>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.totalHours') }}</label>
          <div>
            <InputNumber
              v-model='category.totalHours'
              class='w-full'
              input-id='integeronly'
              :max-fraction-digits='2'/>
            <input
              v-model='category.totalHours'
              hidden
              name='totalHours'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.workingDay') }}</label>
          <div>
            <InputNumber
              v-model='category.workingDay'
              class='w-full'
              input-id='integeronly'
              :max-fraction-digits='2'
              :min='0'/>
            <input
              v-model='category.workingDay'
              hidden
              name='workingDay'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.minutesConsideredLate') }}</label>
          <div>
            <InputNumber
              v-model='category.minutesConsideredLate'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.minutesConsideredLate'
              hidden
              name='minutesConsideredLate'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('common.status') }}</label>
          <NamedDropdown
            id='status'
            v-model='category.status'
            name='status'
            option-label='label'
            option-value='value'
            :options='getStatuses'/>
        </div>

        <div class='col-4 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`meeting.meetingRoom.norder`)
            }}</label>
          <div>
            <InputNumber
              v-model='category.orderNumber'
              input-id='integeronly'/>
            <ValidateErrorMessage :errors='v$.orderNumber.$errors'/>
            <input
              v-model='category.orderNumber'
              hidden
              name='orderNumber'/>
          </div>
        </div>

      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='submitForm'
          @click='submitAndClose'/>
        <Button
          v-if='isCreate'
          icon='pi pi-save'
          :label="t('common.saveAndContinue')"
          :loading='submitForm'
          @click='submitAndContinue'/>
      </div>
    </form>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, isNull, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { createCategory, getCategory, getMaxOrderNumber, updateCategory, } from '@/apps/hrm/api/graphql/category';
import { CategoryList } from '@/apps/hrm/constants/category';
import { removeFields } from '@/apps/hrm/helpers/utils';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  code: {
    type: String,
    default: null,
  },
  selectedCategory: {
    type: String,
    required: true,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const categoryItem = computed(() =>
  CategoryList.find((item) => item.type === props.selectedCategory),
);

const isCreate = isNull(props.code);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredName'),
      required,
    ),
  },
  code: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredCode'),
      required,
    ),
  },
  orderNumber: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredOrderNumber'),
      required,
    ),
  },
};

const form = ref<HTMLFormElement>();
const category = ref<any>({});
const submitForm = ref(false);
const v$ = useVuelidate(validateRules, category);

const setDefaultForm = () => {
  v$.value.$reset();
  category.value = {};
  getMaxOrderNumber(props.selectedCategory).onResult((res) => {
    category.value.orderNumber = res.data.getMaxOrderNumber;
  });
  category.value.status = true;
  if (categoryItem.value?.hasSetDefaultValue) {
    category.value.isDefaultValue = false;
  }
};

if (props.code) {
  getCategory(props.selectedCategory, props.code).onResult((res) => {
    category.value = cloneDeep(res.data.getCategory);
    category.value.startTime = new Date(`1970-01-01T${res.data.getCategory.startTime}`);
    category.value.endTime = new Date(`1970-01-01T${res.data.getCategory.endTime}`);
    category.value.breakTimeStart = res.data.getCategory.breakTimeStart && new Date(`1970-01-01T${res.data.getCategory.breakTimeStart}`);
    category.value.breakTimeEnd = res.data.getCategory.breakTimeEnd && new Date(`1970-01-01T${res.data.getCategory.breakTimeEnd}`);
  });
} else {
  setDefaultForm();
}

const {
  mutate: createCategoryMutate,
  onDone: createCategoryDone,
  onError: createCategoryError
} =
  createCategory();

const {
  mutate: updateCategoryMutate,
  onDone: updateCategoryDone
} =
  updateCategory();
const { moment } = useMoment();

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

function submit() {
  if (!isValidBreakEndTime.value || !isValidEndTime.value) {
    return;
  }
  submitForm.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && category.value) {
        if (isCreate) {
          createCategoryMutate({
            userDeptRole: userDeptRole.value,
            type: props.selectedCategory,
            payload: {
              ...omit({
                ...category.value,
                startTime: category.value.startTime ? moment(category.value.startTime).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null,
                endTime: category.value.endTime ? moment(category.value.endTime).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null,
                breakTimeStart: category.value.breakTimeStart ? moment(category.value.breakTimeStart).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null,
                breakTimeEnd: category.value.breakTimeEnd ? moment(category.value.breakTimeEnd).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null,
              })
            },
          });
        } else {
          updateCategoryMutate({
            userDeptRole: userDeptRole.value,
            type: props.selectedCategory,
            code: props.code,
            payload: removeFields({
              ...omit({
                ...category.value,
                startTime: category.value.startTime
                  ? moment(category.value.startTime).format('HH:mm:ss')
                  : null,
                endTime: category.value.endTime
                  ? moment(category.value.endTime).format('HH:mm:ss')
                  : null,
                breakTimeStart: category.value.breakTimeStart
                  ? moment(category.value.breakTimeStart).format('HH:mm:ss')
                  : null,
                breakTimeEnd: category.value.breakTimeEnd
                  ? moment(category.value.breakTimeEnd).format('HH:mm:ss')
                  : null,
              })
            } || {}, [
              'createdBy',
              'createdTime',
              'isDefault',
              'isDeleted',
              'lastModifiedBy',
              'lastModifiedTime',
            ]),
          });
        }
      }
    })
    .then(() => submitForm.value = false);
}

const isClose = ref(true);

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

createCategoryDone(() => {
  toastSuccess({
    message: t('common.result.message.created', {
      itemType: t(`hrm.category.${props.selectedCategory}`),
      itemName: category.value.name,
    }),
  });
  !isClose.value
    ? setDefaultForm() : emits('hide-dialog');
  submitForm.value = false;
});

updateCategoryDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t(`hrm.category.${props.selectedCategory}`),
      itemName: category.value.name,
    }),
  });
  emits('hide-dialog');
  submitForm.value = false;
});

createCategoryError((err) => {
  toastError({ message: err.graphQLErrors[0]?.message as string || err.toString() });
});

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: true
  },
  {
    label: t('common.statuses.deactivate'),
    value: false,
  },
]);

watchEffect(() => {
  const {
    startTime,
    endTime,
    breakTimeStart,
    breakTimeEnd
  } = category.value;

  if (startTime && endTime && breakTimeStart && breakTimeEnd) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const breakStart = new Date(breakTimeStart).getTime();
    const breakEnd = new Date(breakTimeEnd).getTime();

    const isBreakInWorkTime = breakStart >= start && breakEnd <= end;

    if (start < end && breakStart < breakEnd && isBreakInWorkTime) {
      const workDuration = (end - start) / (1000 * 60 * 60);
      const breakDuration = (breakEnd - breakStart) / (1000 * 60 * 60);
      const total = workDuration - breakDuration;
      category.value.totalHours = parseFloat(total.toFixed(1));
    } else {
      category.value.totalHours = 0;
    }
  } else {
    category.value.totalHours = 0;
  }
});

watchEffect(() => {
  const { totalHours } = category.value;

  if (totalHours) {
    category.value.workingDay = parseFloat((totalHours / 8).toFixed(2));
  }
});

const isValidEndTime = computed(() => {
  if (category.value.startTime && category.value.endTime) {
    return new Date(category.value.endTime) > new Date(category.value.startTime);
  }
  return true;
});

const isValidBreakEndTime = computed(() => {
  if (category.value.breakTimeStart && category.value.breakTimeEnd) {
    return new Date(category.value.breakTimeEnd) > new Date(category.value.breakTimeStart);
  }
  return true;
});

</script>

<style scoped></style>
