<template>
  <Dialog
    v-if='receivingMethod'
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
              for='receivingMethodCode'>{{
                t("document.receivingMethod.code")
              }}</label>
            <InputText
              v-model='receivingMethod.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='receivingMethod.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !receivingMethod.code'
              class='p-error'>{{
                t("document.receivingMethod.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='receivingMethodName'>{{
                t("document.receivingMethod.name")
              }}</label>
            <InputText
              v-model='receivingMethod.name'
              v-trim
              name='name' />
            <small
              v-if='submitForm && !receivingMethod.name'
              class='p-error'>{{
                t("document.receivingMethod.errors.nameEmpty")
              }}</small>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label for='status'>{{ t("common.status") }}</label>
            <NamedDropdown
              id='status'
              v-model='receivingMethod.status'
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
                v-model='receivingMethod.norder'
                input-id='integeronly'/>
              <input
                v-model='receivingMethod.norder'
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
  getReceivingMethodById,
  maxNOrderReceivingMethod,
  saveReceivingMethod,
} from '@/apps/document/api/graphql/receiving-method';
import {
  ReceivingMethod,
  type ReceivingMethodInterface,
} from '@/apps/document/model/receivingMethod';
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
  receivingMethod: {
    type: Object as PropType<ReceivingMethodInterface>,
    default: {} as ReceivingMethodInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (!props.id) {
  const { onResult } = maxNOrderReceivingMethod();
  onResult((res) => {
    receivingMethod.value.norder = res.data.maxOrderActiveReceivingMethod;
    receivingMethod.value.status = true;
  });
}

if (props.id) {
  const { onResult } = getReceivingMethodById(props.receivingMethod?.id || '');
  onResult((res) => {
    receivingMethod.value = { ...res.data.getReceivingMethodById };
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
const receivingMethod = ref<ReceivingMethodInterface>(props.receivingMethod);
const isCreate = isNull(props.id);

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.receivingMethod.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.receivingMethod.objectName')),
    name: receivingMethod.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveReceivingMethodMutate,
  onDone: saveReceivingMethodDone,
  onError: saveReceivingMethodError,
} = saveReceivingMethod();

function submit() {
  submitForm.value = true;
  if (!receivingMethod.value.code || !receivingMethod.value.name) {
    return;
  }
  assign(receivingMethod.value, { id: receivingMethod.value['id'] ? receivingMethod.value['id'] : null, });
  saveReceivingMethodMutate({ receivingMethod: { ...omit(receivingMethod.value) }, });
}

saveReceivingMethodDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.receivingMethod.objectName'),
      itemName: receivingMethod.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  receivingMethod.value = new ReceivingMethod();
});
saveReceivingMethodError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.receivingMethod.errors.' + errorCode.toString()), });
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
