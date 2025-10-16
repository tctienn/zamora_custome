<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="
      isDetail
        ? t('book-ticket.ticketAgent.titleForm')
        : t(`book-ticket.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('book-ticket.ticketAgent.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'
        @submit.prevent='submit'>
        <div class='formgrid grid mb-4'>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.agencyCode`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.code'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
            <div v-else>
              {{ ticketAgent.code }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.agencyName`)
            }}<span
              v-if='!isDetail'
              class='ml-2 text-red-500'>*</span></label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>
            <div
              v-else
              class='mb-2'>
              {{ ticketAgent.name }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.address`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.address'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='address'/>
            </div>
            <div v-else>
              {{ ticketAgent.address }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.taxCode`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.taxCode'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='taxCode'/>
            </div>
            <div
              v-else
              class='mb-2'>
              {{ ticketAgent.taxCode }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.phone`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.phone'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='phone'/>
            </div>
            <div v-else>
              {{ ticketAgent.phone }}
            </div>
          </div>
          <div class='col-6 field'>
            <label>{{
              t(`book-ticket.ticketAgent.email`)
            }}</label>
            <div v-if='!isDetail'>
              <InputText
                v-model='ticketAgent.email'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='email'/>
              <ValidateErrorMessage :errors='v$.email.$errors'/>
            </div>
            <div
              v-else
              class='mb-2'>
              {{ ticketAgent.email }}
            </div>
          </div>

          <div class='col-12 field'>
            <label>{{ t('book-ticket.ticketAgent.note') }}</label>
            <div v-if='!isDetail'>
              <Textarea
                v-model='ticketAgent.note'
                class='w-full'
                cols='30'
                rows='3'/>
            </div>
            <div v-else>
              {{ ticketAgent.note }}
            </div>
          </div>

          <div class='col-12 field'>
            <div class='align-content-center align-items-center flex justify-content-between mb-2 vertical-align-middle'>
              <label
                class='font-semibold text-xl uppercase'
                for='attach'>{{ t('book-ticket.ticketAgent.contactPoint') }}</label>
              <div v-if='!isDetail'>
                <ButtonIcon
                  icon='add_circle'
                  icon-size='1.5'
                  rounded
                  text
                  @click='handleShowTicketAgentModal'/>
              </div>
            </div>
            <TicketAgentContactList
              v-model:ticket-agent-contacts='ticketAgentContacts'
              class='mt-2'
              :is-detail = 'isDetail'/>
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
            type='submit'/>
        </div>
      </form>
      <TicketAgentContactForm
        v-if='showFormTicketAgentContact'
        v-model:visible-dialog='showFormTicketAgentContact'
        :ticket-agent-contact = 'ticketAgentContact'
        @submit='handleSubmitTicketAgentContact' />
    </div>
  </component>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { email, helpers, required } from '@vuelidate/validators';
import { get, omit } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import { getTicketAgentById, saveTicketAgent } from '../../api/graphql/ticket-agent';
import type { ITicketAgent, ITicketAgentContact } from '../../model/ticketAgent';
import TicketAgentContactForm from './component/TicketAgentContactForm.vue';
import TicketAgentContactList from './component/TicketAgentContactList.vue';

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
const ticketAgent = ref<ITicketAgent>({} as ITicketAgent);
const ticketAgentContacts = ref<ITicketAgentContact[]>([]);
const ticketAgentContact = ref<ITicketAgentContact>({} as ITicketAgentContact);
const showFormTicketAgentContact = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('book-ticket.ticketAgent.required.code'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('book-ticket.ticketAgent.required.name'),
      required,
    ),
  },
  email: { email: helpers.withMessage(t('book-ticket.ticketAgent.validator.invalidEmail'), email) },
};
const v$ = useVuelidate(validateRules, ticketAgent);

if (props.id) {
  const { onResult: getTicketAgentByIdOnResult } = getTicketAgentById(props.id);
  getTicketAgentByIdOnResult((res) => {
    const value = get(res, 'data.getDetailTicketById');
    ticketAgent.value = { ...value };
    if(value.ticketAgentContact){
      ticketAgentContacts.value = value.ticketAgentContact.map((contact :ITicketAgentContact) =>
        omit(contact, ['ticketAgentContactId'])
      );
    }
  });
}

const handleShowTicketAgentModal = (data?: ITicketAgentContact)=>{
  if(data) {
    ticketAgentContact.value = data;
  }
  showFormTicketAgentContact.value = true;
};

provide('handleShowTicketAgentModal', handleShowTicketAgentModal);

const handleSubmitTicketAgentContact = (data: ITicketAgentContact) => {
  const index = ticketAgentContacts.value.findIndex(item => item === ticketAgentContact.value);
  if (index !== -1) {
    ticketAgentContacts.value[index] = data;
  } else {
    ticketAgentContacts.value.push(data);
  }
  showFormTicketAgentContact.value = false;
};

const {
  mutate,
  onDone,
  onError,
} = saveTicketAgent();

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && ticketAgent.value) {
        isSubmitting.value = true;
        ticketAgent.value.ticketAgentContact = ticketAgentContacts.value;
        const payload = omit(ticketAgent.value, ['status', 'createdBy', 'createdTime']);
        mutate({ input: { ...payload }, });
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