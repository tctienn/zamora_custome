<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t(`book-ticket.common.${ticketAgentContact ? 'update' : 'create'}`) +
      ' ' +
      t('book-ticket.ticketAgent.contactPoint')
    "
    style='max-height: 70vh'
    @hide='handleClose'>
    <form @submit.prevent='handleSubmit'>
      <div class='formgrid grid mb-4'>
        <div class='col-12 field'>
          <label
            v-required>
            {{ t('book-ticket.ticketAgent.contactList.name') }}
          </label>
          <div>
            <InputText
              v-model='ticketAgentContactLocal.ticketAgentContactName'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='ticketAgentContactName'/>
            <ValidateErrorMessage :errors='vi$.ticketAgentContactName.$errors'/>
          </div>
        </div>
        <div class='col-12 field'>
          <label>
            {{ t('book-ticket.ticketAgent.contactList.email') }}
          </label>
          <div>
            <InputText
              v-model='ticketAgentContactLocal.ticketAgentContactEmail'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='ticketAgentContactEmail'/>
            <ValidateErrorMessage :errors='vi$.ticketAgentContactEmail.$errors'/>
          </div>
        </div>
        <div class='col-12 field'>
          <label>
            {{ t('book-ticket.ticketAgent.contactList.phone') }}
          </label>
          <div>
            <InputText
              v-model='ticketAgentContactLocal.ticketAgentContactPhone'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='ticketAgentContactPhone'/>
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
          @click='handleClose'/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { email, helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ITicketAgentContact } from '@/apps/book-ticket/model/ticketAgent';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  ticketAgentContact: {
    type: Object as PropType<ITicketAgentContact>,
    default: () => ({})
  }
});
const emits = defineEmits(['update:visibleDialog', 'submit']);
const { t } = useI18n();

const visibleForm = computed({
  get: () => props.visibleDialog,
  set: (val) => emits('update:visibleDialog', val),
});

const ticketAgentContactLocal = ref<ITicketAgentContact>({} as ITicketAgentContact);
watch(
  () => props.ticketAgentContact,
  (newVal) => {
    ticketAgentContactLocal.value = cloneDeep(newVal);
  },
  { immediate: true }
);

const rules = {
  ticketAgentContactName: { required: helpers.withMessage(t('book-ticket.ticketAgent.required.contactName'), required), }, 
  ticketAgentContactEmail: { email: helpers.withMessage(t('book-ticket.ticketAgent.validator.invalidEmail'), email) },
};
const vi$ = useVuelidate(rules, ticketAgentContactLocal);

const handleSubmit = async () => {
  const isValid = await vi$.value.$validate();
  if (!isValid) {
    return;
  }
  emits('submit', ticketAgentContactLocal.value);
  handleClose();
};

const handleClose = () => {
  emits('update:visibleDialog', false);
  vi$.value.$reset();
};
</script>