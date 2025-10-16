<template>
  <Dialog
    v-if='emailTemplate'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='headerDialog'
    @hide='emits("hide-dialog")'>
    <div class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='emailTemplateType'>{{ t('admin.emailTemplate.type') }}</label>
        <Dropdown
          id='emailTemplateType'
          v-model='emailTemplate.templateType'
          option-label='label'
          option-value='value'
          :options='templateTypes'
          :placeholder='t("admin.emailTemplate.type")'/>
        <ValidateErrorMessage :errors='v$.templateType.$errors'/>
      </div>

      <div class='field'>
        <label
          v-required
          for='emailTemplateSubject'>{{ t('admin.emailTemplate.subject') }}</label>
        <InputText
          id='emailTemplateSubject'
          v-model='emailTemplate.subject'
          v-trim
          autofocus
          :placeholder='t("admin.emailTemplate.subject")'/>
        <ValidateErrorMessage :errors='v$.subject.$errors'/>
      </div>

      <div class='field'>
        <label
          v-required
          for='emailTemplateContent'>{{ t('admin.emailTemplate.content') }}</label>
        <AppEditor
          ref='editor'
          v-model='emailTemplate.content'
          editor-style='height: 15rem;'
          :modules='{toolbar: DEFAULT_EDITOR_TOOLBARS}'
          :placeholder='t("admin.emailTemplate.content")'/>
        <ValidateErrorMessage :errors='v$.content.$errors'/>
      </div>

      <div class='field'>
        <label>{{ t('common.parameters') }}</label>
        <div class='flex gap-1'>
          <Button
            v-for='param in parameters'
            :key='param'
            class='p-1 w-auto'
            text
            @click='selectParameter(param)'>
            <span>{{ param }}</span>
          </Button>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='emailTemplateStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='emailTemplate.status'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='emailTemplateStatus'
            option-label='label'
            option-value='value'
            :options='getStatuses()'
            :placeholder='t("common.status")'/>
        </div>
        <div class='col field'>
          <label>{{ t('common.default') }}</label>
          <div class='align-items-center flex h-3rem'>
            <Checkbox
              v-model='emailTemplate.isDefault'
              binary
              input-id='emailTemplateDefault'/>
            <label
              class='ml-2'
              for='emailTemplateDefault'>{{ t('common.setDefault') }}</label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase, get, isEmpty, omit, toLower } from 'lodash';
import { computed, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getEmailTemplateParamsGraphql,
  saveEmailTemplateGraphql
} from '@/apps/admin/api/graphql/email-template-graphql-api';
import type { EmailTemplateInterface, EmailTemplateParam } from '@/apps/admin/model/email-template';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { ACTIVITY_STATUSES, DEFAULT_DIALOG_CONFIG, DEFAULT_EDITOR_TOOLBARS } from '@/common/constants';
import { toastError, toastErrorData, toastSuccess, toastWarn } from '@/common/helpers/custom-toast-service';
import { getStatuses } from '@/common/helpers/utils';

const props = withDefaults(defineProps<EmailTemplateFormProps>(), {
  visibleDialog: false,
  item: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

interface EmailTemplateFormProps {
  visibleDialog: boolean,
  item: EmailTemplateInterface
}

const emailTemplateFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    class: 'border-round-sm',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'pi pi-check',
    class: 'border-round-sm',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveEmailTemplate()
  }
};
provide('dialogFooterButtons', emailTemplateFormFooterButtons);

const visible = ref(props.visibleDialog);
const emailTemplate = ref(props.item);
let emailTemplateParams = ref<EmailTemplateParam[]>([]);

const isCreate = isEmpty(emailTemplate.value['id']);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('admin.emailTemplate.objectName')) })
  : t('common.editItem', { item: toLower(t('admin.emailTemplate.objectName')) });

if (isCreate) {
  emailTemplate.value.status = ACTIVITY_STATUSES.ACTIVE;
}

const parameters = computed(() => emailTemplateParams.value.find(item => {
  return item.type === emailTemplate.value.templateType;
})?.params);
const templateTypes = computed(() => emailTemplateParams.value.map(item => ({
  label: t(`admin.emailTemplate.types.${camelCase(item.type)}`),
  value: item.type
})));

const { onResult: getEmailTemplateParamsResult } = getEmailTemplateParamsGraphql();
getEmailTemplateParamsResult((response) => {
  emailTemplateParams.value = get(response, 'data.emailTemplateParams', []);
});

const validateRules = {
  templateType: { required: helpers.withMessage(t('admin.emailTemplate.typeNotSelected'), required) },
  subject: { required: helpers.withMessage(t('admin.emailTemplate.subjectEmpty'), required) },
  content: { required: helpers.withMessage(t('admin.emailTemplate.contentEmpty'), required) },
};

const v$ = useVuelidate(validateRules, emailTemplate);
const editor = ref();

function selectParameter(param: string) {
  const cursorSelection = editor.value.getQuill().getSelection();
  if (cursorSelection) {
    editor.value.getQuill().insertText(cursorSelection, `\${${param}}`);
    emailTemplate.value.content = editor.value.getQuill().getText();
  } else {
    toastWarn({ message: t('admin.emailTemplate.editorNotFocus') });
  }
}

const {
  mutate: saveEmailTemplateMutate,
  onDone: saveEmailTemplateDone,
  onError: saveEmailTemplateError
} = saveEmailTemplateGraphql();

function saveEmailTemplate() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {

      saveEmailTemplateMutate({
        id: emailTemplate.value.id,
        emailTemplateInput: omit(emailTemplate.value, ['id', 'ordinalNumber'])
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveEmailTemplateDone(() => {
  toastSuccess({ message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, { itemType: t('admin.emailTemplate.objectName') }) });
  emits('reload');
  emits('hide-dialog');
});

saveEmailTemplateError((error) => {
  toastErrorData({ error });
});
</script>

<script lang='ts'>
export default { name: 'EmailTemplateTemplate' };
</script>

<style scoped lang='scss'>
:deep(.p-editor-container) {
  .p-editor-toolbar {
    display: none;
  }
}
</style>