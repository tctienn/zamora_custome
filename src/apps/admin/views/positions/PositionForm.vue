<template>
  <Dialog
    v-if='position'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <form
      ref='form'
      v-disabled='{disabled: isDetail}'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='positionCode'>{{ t('admin.position.code') }}</label>
            <InputText
              v-model='position.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'
              :placeholder='t("admin.position.code")'/>
            <InputText
              v-model='position.code'
              hidden
              name='code'
              :placeholder='t("admin.position.code")'/>
            <small
              v-if='submitForm && !position.code'
              class='p-error'>{{ t('admin.position.errors.codeEmpty') }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='positionName'>{{ t('admin.position.name') }}</label>
            <InputText
              v-model='position.name'
              v-trim
              :autofocus='!isCreate'
              name='name'
              :placeholder='t("admin.position.name")'/>
            <small
              v-if='submitForm && !position.name'
              class='p-error'>{{ t('admin.position.errors.nameEmpty') }}</small>
          </div>
        </div>

        <div class='formgrid grid'>

          <div class='col field'>
            <label
              for='isActive'>{{ t('common.status') }}</label>
            <NamedDropdown
              id='isActive'
              v-model='position.status'
              :filter='true'
              name='isActive'
              option-label='label'
              option-value='value'
              :options='getStatuses'
              :placeholder='t("common.status")'/>
          </div>
          <div class='col field'>
          </div>
        </div>

        <div class='field'>
          <label for='positionDescription'>{{ t('common.description') }}</label>
          <Textarea
            id='positionDescription'
            v-model='position.description'
            v-trim
            name='description'
            :placeholder='t("common.description")'
            rows='3'/>
        </div>
      </div>
    </form>
    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { assign, isNull, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { savePositionGraphql } from '@/apps/admin/api/graphql/position/position-graphql';
import type { PositionInterface } from '@/apps/admin/model/position';
import { Position } from '@/apps/admin/model/position';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<IPositionFormProp>(), {
  visibleDialog: false,
  item: undefined,
  isDetail: false,
  positions: () => [],
});

const emits = defineEmits(['hide-dialog', 'reload']);

interface IPositionFormProp {
  visibleDialog: boolean,
  item: PositionInterface,
  isDetail: boolean,
  positions: PositionInterface[]
}

const { t } = useI18n();

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: true
  },
  {
    label: t('common.statuses.deactivate'),
    value: false
  }
]);

let form = ref();
const submitForm = ref(false);

const positionFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    class: 'border-round-sm',
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'pi pi-check',
    label: t('common.save'),
    text: false,
    class: 'border-round-sm',
    type: 'submit',
    command: () => submit()
  }
};
provide('dialogFooterButtons', positionFormFooterButtons);

const visible = ref(props.visibleDialog);
const position = ref<PositionInterface>(props.item);
const isCreate = isNull(position.value['id']);
isNull(position.value['id']) ? position.value.status = true : '';

const headerDialog = isNull(position.value['id'])
  ? t('common.createItem', { item: toLower(t('admin.position.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.position.objectName')),
    name: position.value.name
  });

const {
  mutate: savePositionMutate,
  onDone: savePositionDone,
  onError: savePositionError
} = savePositionGraphql();

function submit() {
  submitForm.value = true;
  if (!position.value.code || !position.value.name) {
    return;
  }
  assign(position.value, { id: position.value['id'] ? position.value['id'] : null });
  savePositionMutate({ positionInput: { ...omit(position.value, ['ordinalNumber']) } });
}

savePositionDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('admin.position.objectName'),
      itemName: position.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
  position.value = new Position();
});
savePositionError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        errorCode,
        errorType
      } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('admin.position.errors.' + errorCode.toString()) });
      }
    });
  }
});
</script>

<script lang='ts'>
export default { name: 'PositionForm' };
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}
</style>