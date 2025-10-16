<template>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isDetail}'
      class='p-fluid'>
      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required>{{ t('work.configStatus.statusName') }}</label>
          <InputText
            v-model='config.name'
            v-trim/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col field'>
          <label v-required>{{ t('work.configStatus.statusType') }}</label>
          <Dropdown
            v-model='config.type'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            option-label='label'
            option-value='value'
            :options='getConfigWorkStatuses()'
            :placeholder='t("common.status")'/>
          <ValidateErrorMessage :errors='v$.type.$errors'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label>{{ t('work.configStatus.description') }}</label>
          <Textarea
            v-model='config.description'
            v-trim
            :placeholder='t("common.description")'
            rows='3'/>
        </div>
      </div>

      <div
        class='formgrid grid'>
        <div class='col field'>
          <label>{{ t('work.configStatus.orderNo') }}</label>
          <InputNumber
            v-model='config.orderNo'
            v-trim
            :min='0'/>
        </div>
        <div class='col field'>
          <label>{{ t('work.configStatus.color') }}</label>
          <ColorPicker
            v-model='config.color'
            class='ml-2'
            format='hex'
            input-id='cp-hex'/>
        </div>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { isEmpty, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { addOrUpdateConfigStatusGraphql } from '@/apps/work/api/graphql/config-work-status-api';
import type { TaskStatus } from '@/apps/work/model/configWorkStatus';
import { ConfigWorkStatus } from '@/apps/work/model/configWorkStatus';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getConfigWorkStatuses } from '@/common/helpers/utils';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);
const {
  mutate: saveMutate,
  onDone: saveOnDone
} = addOrUpdateConfigStatusGraphql();
const { t } = useI18n();

interface ConfigFormProps {
  visibleDialog: boolean,
  item: TaskStatus,
  isDetail: boolean,
}

const configStatusFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveConfigStatus()
  }
};
provide('dialogFooterButtons', configStatusFormFooterButtons);

const visible = ref(props.visibleDialog);
const config = ref(props.item);
const isCreate = isEmpty(config.value['id']);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('work.configStatus.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('work.configStatus.objectName')),
    name: config.value.name
  });

const validateRules = {
  type: { required: helpers.withMessage(t('work.configStatus.message.typeEmpty'), required) },
  name: { required: helpers.withMessage(t('work.configStatus.message.nameEmpty'), required) }
};

const v$ = useVuelidate(validateRules, config);

function saveConfigStatus() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveMutate({ statusInput: omit(config.value, 'ordinalNumber') });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveOnDone(() => {
  toastSuccess({
    message: t(`common.result.message.${ isCreate ? 'created' : 'updated' }`, {
      itemType: t('work.configStatus.objectName'),
      itemName: config.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
  config.value = new ConfigWorkStatus();
});

</script>

<script lang='ts'>
export default { name: 'ConfigWorkStatusForm' };
</script>