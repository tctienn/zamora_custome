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

        <div class='col-6 field'>
          <label class='font-bold'>{{
            t(`hrm.category.applicableDate`)
          }}</label>
          <Calendar
            v-model='category.applicableDate'
            class='w-full'
            icon-display='input'
            name='applicableDate'
            show-icon/>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t(`hrm.category.expiryDate`) }}</label>
          <Calendar
            v-model='category.expiryDate'
            class='w-full'
            icon-display='input'
            name='expiryDate'
            show-icon/>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.region') }} 1</label>
          <div>
            <InputNumber
              v-model='category.region1'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.region1'
              hidden
              name='region1'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.region') }} 2</label>
          <div>
            <InputNumber
              v-model='category.region2'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.region2'
              hidden
              name='region2'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.region') }} 3</label>
          <div>
            <InputNumber
              v-model='category.region3'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.region3'
              hidden
              name='region3'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.region') }} 4</label>
          <div>
            <InputNumber
              v-model='category.region4'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.region4'
              hidden
              name='region4'/>
          </div>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('hrm.category.basicSalary') }}</label>
          <div>
            <InputNumber
              v-model='category.basicSalary'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='category.basicSalary'
              hidden
              name='basicSalary'/>
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

        <div
          v-if='categoryItem?.hasSetDefaultValue'
          class='align-items-center col-6 field flex gap-3 mt-2'>
          <div class='font-bold'>{{ t(`hrm.category.default`) }}</div>
          <InputSwitch
            v-model='category.isDefaultValue'
            name='isDefaultValue'/>
        </div>

        <div
          v-if='categoryItem?.hasDescriptionField'
          class='col-12 field'>
          <label class='font-bold'>{{ t(`hrm.category.description`) }}</label>
          <Textarea
            v-model='category.description'
            class='w-full'
            cols='30'
            rows='5'/>
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

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, isNull, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
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
const categoryItem = computed(() =>
  CategoryList.find((item) => item.type === props.selectedCategory),
);

const isCreate = isNull(props.code);

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const category = ref<any>({});
const submitForm = ref(false);

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

const v$ = useVuelidate(validateRules, category);

const setDefaultForm = () => {
  v$.value.$reset();
  category.value = {};
  getMaxOrderNumber(props.selectedCategory).onResult((res) => {
    category.value.orderNumber = res.data.getMaxOrderNumber;
  });
  category.value.status = true;
};

if (props.code) {
  getCategory(props.selectedCategory, props.code).onResult((res) => {
    category.value = cloneDeep(res.data.getCategory);
    category.value.applicableDate = new Date(category.value.applicableDate);
    category.value.expiryDate = new Date(category.value.expiryDate);
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
                applicableDate: category.value.expiryDate ? moment(category.value.applicableDate).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null,
                expiryDate: category.value.expiryDate ? moment(category.value.expiryDate).format(
                  DateTimeFormat.ISO_LOCAL_DATE_TIME,
                ) : null
              })
            },
          });
        } else {
          updateCategoryMutate({
            userDeptRole: userDeptRole.value,
            type: props.selectedCategory,
            code: props.code,
            payload: removeFields({
              ...category.value,
              applicableDate: category.value.expiryDate ? moment(category.value.applicableDate).format(
                DateTimeFormat.ISO_LOCAL_DATE_TIME,
              ) : null,
              expiryDate: category.value.expiryDate ? moment(category.value.expiryDate).format(
                DateTimeFormat.ISO_LOCAL_DATE_TIME,
              ) : null
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
    value: true,
  },
  {
    label: t('common.statuses.deactivate'),
    value: false,
  },
]);
</script>

<style scoped></style>
