<template>
  <Dialog
    v-if='emailConfiguration'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='headerDialog'
    @hide='emits("hide-dialog")'>
    <div class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='emailConfigurationName'>{{ t('admin.emailConfiguration.name') }}</label>
        <InputText
          id='emailConfigurationName'
          v-model='emailConfiguration.name'
          v-trim
          autofocus
          :placeholder='t("admin.emailConfiguration.name")'/>
        <ValidateErrorMessage :errors='v$.name.$errors'/>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='emailConfigurationServer'>{{ t('admin.emailConfiguration.server') }}</label>
          <InputText
            id='emailConfigurationServer'
            v-model='emailConfiguration.server'
            v-trim
            :placeholder='t("admin.emailConfiguration.server")'/>
          <ValidateErrorMessage :errors='v$.server.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='emailConfigurationServerType'>{{ t('admin.emailConfiguration.protocol') }}</label>
          <Dropdown
            v-model='emailConfiguration.protocol'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='emailConfigurationServerType'
            option-label='label'
            option-value='value'
            :options='getServerTypes()'
            :placeholder='t("admin.emailConfiguration.protocol")'/>
          <ValidateErrorMessage :errors='v$.protocol.$errors'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='emailConfigurationPort'>{{ t('admin.emailConfiguration.port') }}</label>
          <InputNumber
            id='emailConfigurationPort'
            v-model='emailConfiguration.port'
            :placeholder='t("admin.emailConfiguration.port")'/>
          <ValidateErrorMessage :errors='v$.port.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='emailConfigurationStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='emailConfiguration.status'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='emailConfigurationStatus'
            option-label='label'
            option-value='value'
            :options='getStatuses()'
            :placeholder='t("common.status")'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='emailConfigurationAccount'>{{ t('admin.emailConfiguration.account') }}</label>
          <InputText
            id='emailConfigurationAccount'
            v-model='emailConfiguration.account'
            v-trim
            autocomplete='off'
            :placeholder='t("admin.emailConfiguration.account")'/>
          <ValidateErrorMessage :errors='v$.account.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required='isCreate'
            for='emailConfigurationPassword'>{{ t('admin.emailConfiguration.password') }}</label>
          <Password
            v-model='emailConfiguration.password'
            v-trim
            input-id='emailConfigurationPassword'
            :input-props='{"autocomplete": "new-password"}'
            :placeholder='t("admin.emailConfiguration.password")'
            :toggle-mask='true'/>
          <ValidateErrorMessage :errors='v$.password.$errors'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field max-w-50'>
          <label
            v-required
            for='emailConfigurationTemplateTypes'>{{ t('admin.emailTemplate.type') }}</label>
          <MultiSelect
            id='emailConfigurationTemplateTypes'
            v-model='emailConfiguration.templateTypes'
            display='chip'
            option-label='label'
            option-value='value'
            :options='templateTypes'
            :placeholder='t("admin.emailTemplate.type")'/>
          <ValidateErrorMessage :errors='v$.templateTypes.$errors'/>
        </div>

        <div class='col field'></div>
      </div>

      <div class='field'>
        <label for='emailConfigurationDescription'>{{ t('common.description') }}</label>
        <Textarea
          id='emailConfigurationDescription'
          v-model='emailConfiguration.description'
          v-trim
          :placeholder='t("common.description")'
          rows='3'/>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { email, helpers, required, requiredIf } from '@vuelidate/validators';
import { camelCase, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveEmailConfigurationGraphql } from '@/apps/admin/api/graphql/email-configuration-graphql-api';
import { getAllTemplate } from '@/apps/admin/api/graphql/email-template-graphql-api';
import type { EmailConfigurationInterface } from '@/apps/admin/model/email-configuration';
import type { EmailTemplateInterface } from '@/apps/admin/model/email-template';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG, EMAIL_SERVER_PROTOCOLS } from '@/common/constants';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getStatuses } from '@/common/helpers/utils';

const props = withDefaults(defineProps<EmailConfigurationFormProps>(), {
  visibleDialog: false,
  item: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { onResult: getAllTemplateResult } = getAllTemplate();

const { t } = useI18n();

interface EmailConfigurationFormProps {
  visibleDialog: boolean,
  item: EmailConfigurationInterface
}

const emailConfigurationFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    type: 'button',
    class: 'border-round-sm',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'pi pi-check',
    label: t('common.save'),
    text: false,
    type: 'button',
    class: 'border-round-sm',
    command: () => saveEmailConfiguration()
  }
};
provide('dialogFooterButtons', emailConfigurationFormFooterButtons);

const visible = ref(props.visibleDialog);
const emailConfiguration = ref(props.item);
// const isCreate = isEmpty(emailConfiguration.value['id']);
const isCreate = true;
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('admin.emailConfiguration.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.emailConfiguration.objectName')),
    name: emailConfiguration.value.name
  });

const templateTypes = ref<EmailTemplateInterface[]>([]);
getAllTemplateResult((res) => {
  templateTypes.value = res.data.getAllTemplate.map((type: EmailTemplateInterface) => ({
    label: t(`admin.emailTemplate.types.${camelCase(type.templateType)}`),
    value: type.templateType
  }));
});

const validateRules = {
  name: { required: helpers.withMessage(t('admin.emailConfiguration.nameEmpty'), required) },
  server: { required: helpers.withMessage(t('admin.emailConfiguration.serverEmpty'), required) },
  protocol: { required: helpers.withMessage(t('admin.emailConfiguration.protocolNotSelected'), required) },
  port: { required: helpers.withMessage(t('admin.emailConfiguration.portEmpty'), required) },
  account: {
    required: helpers.withMessage(t('admin.emailConfiguration.accountEmpty'), required),
    email: helpers.withMessage(t('common.invalidEmail'), email)
  },
  password: { required: helpers.withMessage(t('admin.emailConfiguration.passwordEmpty'), requiredIf(isCreate)) },
  templateTypes: { required: helpers.withMessage(t('emailTemplate.typeNotSelected'), required) },
};

const v$ = useVuelidate(validateRules, emailConfiguration);

const {
  mutate: saveEmailConfigurationMutate,
  onDone: saveEmailConfigurationDone,
  onError: saveEmailConfigurationError
} = saveEmailConfigurationGraphql();

function saveEmailConfiguration() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveEmailConfigurationMutate({
        id: emailConfiguration.value.id,
        emailConfigurationInput: omit(emailConfiguration.value, ['id', 'ordinalNumber'])
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveEmailConfigurationDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('admin.emailConfiguration.objectName'),
      itemName: emailConfiguration.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
});

saveEmailConfigurationError((error) => {
  toastErrorData({ error });
});

const getServerTypes = () => {
  return Object.keys(EMAIL_SERVER_PROTOCOLS).map((key) => {
    const type = EMAIL_SERVER_PROTOCOLS[key as keyof typeof EMAIL_SERVER_PROTOCOLS];
    return {
      label: t(`admin.emailConfiguration.protocols.${camelCase(type)}`),
      value: type
    };
  });
};
</script>

<script lang='ts'>
export default { name: 'EmailConfigurationForm' };
</script>