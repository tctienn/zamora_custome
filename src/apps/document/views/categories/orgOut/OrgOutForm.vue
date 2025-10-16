<template>
  <Dialog
    v-if='orgOut'
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
              for='orgOutCode'>{{
                t("document.orgOut.code")
              }}</label>
            <InputText
              v-model='orgOut.orgOutCode'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='orgOut.orgOutCode'
              hidden
              name='code' />
            <small
              v-if='submitForm && !orgOut.orgOutCode'
              class='p-error'>{{
                t("document.orgOut.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='orgOutIdentify'>{{
                t("document.orgOut.identify")
              }}</label>
            <InputText
              v-model='orgOut.orgOutIdentify'
              v-code />
            <InputText
              v-model='orgOut.orgOutIdentify'
              hidden
              name='orgOutIdentify'/>
            <small
              v-if='submitForm && !orgOut.orgOutIdentify'
              class='p-error'>{{ t("document.orgOut.errors.codeEmpty") }}</small>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='orgOutName'>{{
                t("document.orgOut.name")
              }}</label>
            <InputText
              v-model='orgOut.orgOutName'
              v-trim
              name='name' />
            <small
              v-if='submitForm && !orgOut.orgOutName'
              class='p-error'>{{
                t("document.orgOut.errors.nameEmpty")
              }}</small>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label for='address'>{{ t("document.orgOut.address") }}</label>
            <InputText
              v-model='orgOut.address'
              v-trim
              name='address' />
          </div>

          <div class='col field'>
            <label for='email'>{{ t("document.orgOut.email") }}</label>
            <InputText
              v-model='orgOut.email'
              v-trim
              name='email' />
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <div class='align-items-center flex gap-2 my-2'>
              <InputSwitch
                v-model='orgOut.isSendToEsb'
                name='isSendToEsb' />
              <label>{{ t("document.orgOut.isSendToEsb") }}</label>
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

import { getOrgOutById, saveOrgOut } from '@/apps/document/api/graphql/org-out';
import { OrgOut, type OrgOutInterface } from '@/apps/document/model/orgOut';
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
  orgOut: {
    type: Object as PropType<OrgOutInterface>,
    default: {} as OrgOutInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (!props.id) {
}

if (props.id) {
  const { onResult } = getOrgOutById(props.orgOut?.id || '');
  onResult((res) => {
    orgOut.value = { ...res.data.getOrgOutById };
  });
}

const { t } = useI18n();

let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);
const orgOut = ref<OrgOutInterface>(props.orgOut);
const isCreate = isNull(props.id);

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.orgOut.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.orgOut.objectName')),
    name: orgOut.value.orgOutName,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveOrgOutMutate,
  onDone: saveOrgOutDone,
  onError: saveOrgOutError,
} = saveOrgOut();

function submit() {
  submitForm.value = true;
  if (!orgOut.value.orgOutCode || !orgOut.value.orgOutName) {
    return;
  }
  assign(orgOut.value, { id: orgOut.value['id'] ? orgOut.value['id'] : null });
  saveOrgOutMutate({ orgOut: { ...omit(orgOut.value) } });
}

saveOrgOutDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.orgOut.objectName'),
      itemName: orgOut.value.orgOutName,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  orgOut.value = new OrgOut();
});
saveOrgOutError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.orgOut.errors.' + errorCode.toString()), });
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
