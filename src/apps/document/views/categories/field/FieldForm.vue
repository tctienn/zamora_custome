<template>
  <Dialog
    v-if='field'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='fieldCode'>{{
                t("document.field.code")
              }}</label>
            <InputText
              v-model='field.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='field.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !field.code'
              class='p-error'>{{
                t("document.field.errors.codeEmpty")
              }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='fieldName'>{{
                t("document.field.name")
              }}</label>
            <InputText
              v-model='field.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !field.name'
              class='p-error'>{{
                t("document.field.errors.nameEmpty")
              }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col field'>
            <label for='isActive'>{{ t("common.status") }}</label>
            <NamedDropdown
              id='isActive'
              v-model='field.status'
              name='isActive'
              option-label='label'
              option-value='value'
              :options='getStatuses'/>
          </div>
          <div
            v-if='!isDetail'
            class='col field'>
            <label>{{ t(`meeting.meetingRoom.norder`) }}</label>
            <div>
              <InputNumber
                v-model='field.norder'
                input-id='integeronly' />
              <input
                v-model='field.norder'
                hidden
                name='norder' />
            </div>
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
          type='submit'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { assign, isNull, omit } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getFieldById,
  maxNOrderField,
  saveField,
} from '@/apps/document/api/graphql/field';
import { Field, type FieldInterface } from '@/apps/document/model/field';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';

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
  field: {
    type: Object as PropType<FieldInterface>,
    default: {} as FieldInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (!props.id) {
  const { onResult } = maxNOrderField();
  onResult((res) => {
    field.value.norder = res.data.maxOrderActiveField;
    field.value.status = true;
  });
}

if (props.id) {
  const { onResult } = getFieldById(props.field?.id || '');
  onResult((res) => {
    field.value = { ...res.data.getFieldById };
  });
}

const { t } = useI18n();

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

let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);
const field = ref<FieldInterface>(props.field);
const isCreate = isNull(props.id);
isNull(field.value['id']) ? field.value.status = true : '';

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.field.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.field.objectName')),
    name: field.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveFieldMutate,
  onDone: saveFieldDone,
  onError: saveFieldError,
} = saveField();

function submit() {
  submitForm.value = true;
  if (!field.value.code || !field.value.name) {
    return;
  }
  assign(field.value, { id: field.value['id'] ? field.value['id'] : null });
  saveFieldMutate({ field: { ...omit(field.value) } });
}

saveFieldDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.field.objectName'),
      itemName: field.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  field.value = new Field();
});
saveFieldError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.field.errors.' + errorCode.toString()), });
      }
    });
  }
});
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}
</style>
