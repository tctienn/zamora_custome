<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="
      isDetail
        ? t('book-ticket.workContent.titleForm')
        : t(`book-ticket.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('book-ticket.workContent.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'>
        <div class='formgrid grid mb-4'>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.workContent.code`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='workContent.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
            <div v-else>
              {{ workContent.code }}
            </div>
          </div>
          <div class='col-12 field'>
            <label>{{
              t(`book-ticket.workContent.content`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='workContent.content'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='content'/>
              <ValidateErrorMessage :errors='v$.content.$errors'/>
            </div>
            <div v-else>
              {{ workContent.content }}
            </div>
          </div>

          <div class='col-6 field'>
            <label>{{ t('book-ticket.workContent.timeFrom') }}</label>
            <div v-if='!isDetail'>
              <NamedInputCalendar
                v-model='workContent.timeFrom'
                format='DD/MM/YYYY'
                name='timeFrom'
                :select-other-months='true'
                show-icon/>
            </div>
            <div v-else>
              {{
                moment(workContent.timeFrom)
                  .format("dddd, HH:mm DD/MM/YYYY")
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{ t('book-ticket.workContent.timeTo') }}</label>
            <div v-if='!isDetail'>
              <NamedInputCalendar
                v-model='workContent.timeTo'
                format='DD/MM/YYYY'
                name='timeTo'
                :select-other-months='true'
                show-icon/>
            </div>
            <div v-else>
              {{
                moment(workContent.timeTo)
                  .format("dddd, HH:mm DD/MM/YYYY")
                  .replace(/^\w/, (c) => c.toUpperCase())
              }}
            </div>
          </div>

          <div class='col-12 field'>
            <label>{{ t('book-ticket.workContent.openTicketRegistration') }}</label>
            <div v-if='!isDetail'>
              <ToggleButton
                v-model='workContent.openTicketRegistration'
                class='w-full'
                off-icon='pi pi-times'
                off-label='Đóng'
                on-icon='pi pi-check'
                on-label='Mở'/>
            </div>
            <div v-else>
              {{ workContent.openTicketRegistration ? 'Mở' : 'Đóng' }}
            </div>
          </div>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            icon='pi pi-save'
            :label="t('common.save')"
            :loading='isSubmitting'
            @click='submit'/>
        </div>
      </form>
    </div>
  </component>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import moment from 'moment';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import { getWorkContentById, saveWorkContent } from '../../api/graphql/work-content';
import type { IWorkContent } from '../../model/workContent';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isSidebar: {
    type: Boolean,
    default: true,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleForm = ref<boolean>(props.visibleDialog);
const workContent = ref<IWorkContent>({} as IWorkContent);

const isSubmitting = ref<boolean>(false);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('book-ticket.workContent.required.code'),
      required,
    ),
  },
  content: {
    required: helpers.withMessage(
      t('book-ticket.workContent.required.content'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, workContent);

if (props.id) {
  const { onResult: getWorkContentByIdOnResult } = getWorkContentById(props.id);
  getWorkContentByIdOnResult((res) => {
    const value = get(res, 'data.getDetailWorkContentById');
    workContent.value = { 
      ...value,
      timeFrom: value.timeFrom ? new Date(value.timeFrom) : undefined,
      timeTo: value.timeTo ? new Date(value.timeTo) : undefined,
    };
  });
}

const {
  mutate,
  onDone,
  onError,
} = saveWorkContent();

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && workContent.value) {
        isSubmitting.value = true;
        mutate({
          input: {
            ...workContent.value,
            timeFrom: workContent.value.timeFrom
              ? moment(workContent.value.timeFrom).format('YYYY-MM-DD')
              : null,
            timeTo: workContent.value.timeTo
              ? moment(workContent.value.timeTo).format('YYYY-MM-DD')
              : null, 
          }, 
        });
      }
    });
};

onDone(() => {
  toastSuccess({ message: props.id ? t('book-ticket.common.updateSuccess') : t('book-ticket.common.createSuccess') });
  emits('hide-dialog');
  isSubmitting.value = false;
});

onError((err) => {
  toastError({ message: t('book-ticket.common.submitError', { err: err }) });
  isSubmitting.value = false;
});

</script>

<style scoped>

</style>