<template>
  <Dialog
    v-if='position'
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
              for='positionCode'>{{
                t("document.partyPosition.code")
              }}</label>
            <InputText
              v-model='position.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='position.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !position.code'
              class='p-error'>{{
                t("document.partyPosition.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='positionName'>{{
                t("document.partyPosition.name")
              }}</label>
            <InputText
              v-model='position.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !position.name'
              class='p-error'>{{
                t("document.partyPosition.errors.nameEmpty")
              }}</small>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label for='isActive'>{{ t("common.status") }}</label>
            <NamedDropdown
              id='isActive'
              v-model='position.status'
              :filter='true'
              name='isActive'
              option-label='label'
              option-value='value'
              :options='getStatuses'/>
          </div>
          <div class='col field'></div>
        </div>

        <div class='field'>
          <label for='positionDescription'>{{ t("common.description") }}</label>
          <Textarea
            id='positionDescription'
            v-model='position.description'
            v-trim
            name='description'
            rows='3'/>
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

import { Position } from '@/apps/admin/model/position';
import { savePartyPosition } from '@/apps/document/api/graphql/party-position';
import type { PartyPositionInterface } from '@/apps/document/model/partyPositon/partyPosition';
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
  isSidebar: {
    type: Boolean,
    default: true,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object as PropType<PartyPositionInterface>,
    default: {} as PartyPositionInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

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
const position = ref<PartyPositionInterface>(props.position);
const isCreate = isNull(props.position.id);
isNull(position.value['id']) ? position.value.status = true : '';

const headerDialog = isNull(position.value['id'])
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.partyPosition.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.partyPosition.objectName')),
    name: position.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: savePositionMutate,
  onDone: savePositionDone,
  onError: savePositionError,
} = savePartyPosition();

function submit() {
  submitForm.value = true;
  if (!position.value.code || !position.value.name) {
    return;
  }
  assign(position.value, { id: position.value['id'] ? position.value['id'] : null, });
  savePositionMutate({ partyPosition: { ...omit(position.value) } });
}

savePositionDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.partyPosition.objectName'),
      itemName: position.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  position.value = new Position();
});
savePositionError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.partyPosition.errors.' + errorCode.toString()), });
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
