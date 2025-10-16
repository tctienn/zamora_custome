<template>
  <Dialog
    v-if='object'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>

    <div class='p-fluid'>
      <div class='formgrid grid'>
        <div class='col-6 field'>
          <label
            v-required
            for='objectName'>{{ t('admin.objectTemplate.name') }}</label>
          <InputText
            id='objectName'
            v-model='object.name'
            v-trim
            :autofocus='isCreate'
            :disabled='true'
            :placeholder='t("admin.objectTemplate.name")'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col-6 field'>
          <label
            v-required
            for='objectStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='object.status'
            :disabled='true'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='objectStatus'
            option-label='label'
            option-value='value'
            :options='getStatuses()'
            :placeholder='t("common.status")'/>
        </div>
      </div>

      <div class='field'>
        <label for='objectDescription'>{{ t('common.description') }}</label>
        <Textarea
          id='objectDescription'
          v-model='object.description'
          v-trim
          :disabled='true'
          :placeholder='t("common.description")'
          rows='3'/>
      </div>
    </div>
    <div class='flex flex-row gap-2 justify-content-center py-1'>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { isEmpty, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveObjectGraphql } from '@/apps/admin/api/graphql/object-graphql-api';
import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import type { ObjectInterface } from '@/apps/admin/model/object';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getStatuses } from '@/common/helpers/utils';

const props = withDefaults(defineProps<ObjectFormProps>(), {
  visibleDialog: false,
  item: undefined,
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

interface ObjectFormProps {
  visibleDialog: boolean,
  item: ObjectInterface,
}

const objectFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'pi pi-check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveObject()
  }
};
provide('dialogFooterButtons', objectFormFooterButtons);

const visible = ref(props.visibleDialog);
const object = ref(props.item);
const isCreate = isEmpty(object.value['id']);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('admin.objectTemplate.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.objectTemplate.objectName')),
    name: object.value.name
  });

const validateRules = {
  className: { required: helpers.withMessage(t('object.codeEmpty'), required) },
  name: { required: helpers.withMessage(t('object.nameEmpty'), required) },
};

const v$ = useVuelidate(validateRules, object);

const {
  mutate: saveObjectMutate,
  onDone: saveObjectDone,
  onError: saveObjectError
} = saveObjectGraphql();

function saveObject() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveObjectMutate({
        id: object.value.id,
        objectTemplateInput: omit(object.value, ['id', 'ordinalNumber', 'properties'])
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveObjectDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('admin.objectTemplate.objectName'),
      itemName: object.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
});

saveObjectError((error) => {
  toastErrorData({ error });
});

</script>

<script lang='ts'>
export default { name: 'ObjectForm' };
</script>