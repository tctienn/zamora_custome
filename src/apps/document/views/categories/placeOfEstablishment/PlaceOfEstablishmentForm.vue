<template>
  <Dialog
    v-if='placeOfEstablishment'
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
              for='code'>{{
                t("document.placeOfEstablishment.code")
              }}</label>
            <InputText
              v-model='placeOfEstablishment.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='placeOfEstablishment.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !placeOfEstablishment.code'
              class='p-error'>{{ t("document.placeOfEstablishment.errors.codeEmpty") }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='name'>{{
                t("document.placeOfEstablishment.name")
              }}</label>
            <InputText
              v-model='placeOfEstablishment.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !placeOfEstablishment.name'
              class='p-error'>{{ t("document.placeOfEstablishment.errors.nameEmpty") }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col-6 field'>
            <label for='isActive'>{{ t("common.status") }}</label>
            <NamedDropdown
              id='isActive'
              v-model='placeOfEstablishment.status'
              name='isActive'
              option-label='label'
              option-value='value'
              :options='getStatuses'/>
          </div>
          <div class='align-items-center col-6 field flex gap-2 mt-4'>
            <InputSwitch
              v-model='placeOfEstablishment.isDefault'
              name='isDefault'/>
            <label class='m-0'>
              {{ t("document.placeOfEstablishment.isDefault") }}
            </label>
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
  getPlaceOfEstablishmentById,
  savePlaceOfEstablishment,
} from '@/apps/document/api/graphql/place-of-establishment';
import {
  PlaceOfEstablishment,
  type PlaceOfEstablishmentInterface,
} from '@/apps/document/model/placeOfEstablishment';
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
  placeOfEstablishment: {
    type: Object as PropType<PlaceOfEstablishmentInterface>,
    default: {} as PlaceOfEstablishmentInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);
const placeOfEstablishment = ref<PlaceOfEstablishmentInterface>(
  props.placeOfEstablishment,
);

if (props.id) {
  const { onResult } = getPlaceOfEstablishmentById(
    props.placeOfEstablishment?.id || '',
  );
  onResult((res) => {
    placeOfEstablishment.value = { ...res.data.getPlaceOfEstablishmentById };
  });
} else {
  placeOfEstablishment.value = {
    ...placeOfEstablishment.value,
    status: true,
    isDefault: false,
  };
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
const isCreate = isNull(props.id);
isNull(placeOfEstablishment.value['id'])
  ? placeOfEstablishment.value.status = true
  : '';

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.placeOfEstablishment.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.placeOfEstablishment.objectName')),
    name: placeOfEstablishment.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: savePlaceOfEstablishmentMutate,
  onDone: savePlaceOfEstablishmentDone,
  onError: savePlaceOfEstablishmentError,
} = savePlaceOfEstablishment();

function submit() {
  submitForm.value = true;
  if (!placeOfEstablishment.value.code || !placeOfEstablishment.value.name) {
    return;
  }
  assign(placeOfEstablishment.value, {
    id: placeOfEstablishment.value['id']
      ? placeOfEstablishment.value['id']
      : null,
  });
  savePlaceOfEstablishmentMutate({ placeOfEstablishment: { ...omit(placeOfEstablishment.value) }, });
}

savePlaceOfEstablishmentDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.placeOfEstablishment.objectName'),
      itemName: placeOfEstablishment.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  placeOfEstablishment.value = new PlaceOfEstablishment();
});
savePlaceOfEstablishmentError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({
          message: t(
            'document.placeOfEstablishment.errors.' + errorCode.toString(),
          ),
        });
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
