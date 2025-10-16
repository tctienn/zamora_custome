<template>
  <Dialog
    v-if='docType'
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
              for='docTypeCode'>{{
                t("document.docType.code")
              }}</label>
            <InputText
              v-model='docType.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='docType.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !docType.code'
              class='p-error'>{{
                t("document.docType.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='docTypeName'>{{
                t("document.docType.name")
              }}</label>
            <InputText
              v-model='docType.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !docType.name'
              class='p-error'>{{
                t("document.docType.errors.nameEmpty")
              }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col field'>
            <label>{{ t("document.docType.numberOfProcessingDays") }}</label>
            <InputNumber
              v-model='docType.numberOfProcessingDays'
              input-id='integeronly'/>
            <input
              v-model='docType.numberOfProcessingDays'
              hidden
              name='numberOfProcessingDays'/>
          </div>

          <div class='col field'>
            <label>{{ t("document.docType.signDefault") }}</label>
            <InputText
              v-model='docType.signDefault'
              v-trim
              name='signDefault'/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label>{{ t("common.status") }}</label>
            <NamedDropdown
              id='status'
              v-model='docType.status'
              name='status'
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
                v-model='docType.norder'
                input-id='integeronly' />
              <input
                v-model='docType.norder'
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
  getDocTypeById,
  maxNOrderDocType,
  saveDocType,
} from '@/apps/document/api/graphql/doc-type';
import { DocType, type DocTypeInterface } from '@/apps/document/model/docType';
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
  docType: {
    type: Object as PropType<DocTypeInterface>,
    default: {} as DocTypeInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (!props.id) {
  const { onResult } = maxNOrderDocType();
  onResult((res) => {
    docType.value.norder = res.data.maxOrderActiveDocType;
    docType.value.status = true;
  });
}

if (props.id) {
  const { onResult } = getDocTypeById(props.docType?.id || '');
  onResult((res) => {
    docType.value = { ...res.data.getDocTypeById };
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
const docType = ref<DocTypeInterface>(props.docType);
const isCreate = isNull(props.id);

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.docType.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.docType.objectName')),
    name: docType.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveDocTypeMutate,
  onDone: saveDocTypeDone,
  onError: saveDocTypeError,
} = saveDocType();

function submit() {
  submitForm.value = true;
  if (!docType.value.code || !docType.value.name) {
    return;
  }
  assign(docType.value, { id: docType.value['id'] ? docType.value['id'] : null, });
  saveDocTypeMutate({ docType: { ...omit(docType.value) } });
}

saveDocTypeDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.docType.objectName'),
      itemName: docType.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  docType.value = new DocType();
});
saveDocTypeError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.docType.errors.' + errorCode.toString()), });
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
