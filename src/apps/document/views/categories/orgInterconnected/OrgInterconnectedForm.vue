<template>
  <Dialog
    v-if='orgInterconnected'
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
              for='orgInterconnectedCode'>{{
                t("document.orgInterconnected.code")
              }}</label>
            <InputText
              v-model='orgInterconnected.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='orgInterconnected.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !orgInterconnected.code'
              class='p-error'>{{ t("document.orgInterconnected.errors.codeEmpty") }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='orgOutIdentify'>{{
                t("document.orgInterconnected.identify")
              }}</label>
            <InputText
              v-model='orgInterconnected.identify'
              v-code />
            <InputText
              v-model='orgInterconnected.identify'
              hidden
              name='orgOutIdentify'/>
            <small
              v-if='submitForm && !orgInterconnected.identify'
              class='p-error'>{{ t("document.orgOut.errors.codeEmpty") }}</small>
          </div>
        </div>
        <div class='formgrid grid'>
          <div class='col-6 field'>
            <label
              v-required
              for='orgInterconnectedName'>{{
                t("document.orgInterconnected.name")
              }}</label>
            <InputText
              v-model='orgInterconnected.name'
              v-trim
              name='name' />
            <small
              v-if='submitForm && !orgInterconnected.name'
              class='p-error'>{{ t("document.orgInterconnected.errors.nameEmpty") }}</small>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label for='address'>{{
              t("document.orgInterconnected.address")
            }}</label>
            <InputText
              v-model='orgInterconnected.address'
              v-trim
              name='address'/>
          </div>

          <div class='col field'>
            <label for='email'>{{
              t("document.orgInterconnected.email")
            }}</label>
            <InputText
              v-model='orgInterconnected.email'
              v-trim
              name='email' />
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col field'>
            <label for='phone'>{{
              t("document.orgInterconnected.phone")
            }}</label>
            <InputText
              v-model='orgInterconnected.phone'
              v-trim
              name='phone' />
          </div>

          <div class='col field'>
            <label for='fax'>Fax</label>
            <InputText
              v-model='orgInterconnected.fax'
              v-trim
              name='fax'
              placeholder='Fax'/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col-6 field'>
            <label for='domainName'>{{
              t("document.orgInterconnected.domainName")
            }}</label>
            <InputText
              v-model='orgInterconnected.domainName'
              v-trim
              name='domainName'/>
          </div>
        </div>

        <div class='formgrid grid'>
          <div class='col-6 field'>
            <div class='align-items-center flex gap-2 my-2'>
              <InputSwitch
                v-model='orgInterconnected.lock'
                name='lock' />
              <label>{{ t("document.orgInterconnected.lock") }}</label>
            </div>
          </div>
        </div>
        <div class='formgrid grid'>
          <div
            v-if='!isDetail'
            class='col-6 field'>
            <label>{{ t(`meeting.meetingRoom.norder`) }}</label>
            <div>
              <InputNumber
                v-model='orgInterconnected.norder'
                input-id='integeronly'/>
              <input
                v-model='orgInterconnected.norder'
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
  getOrgInterconnectedById,
  maxNOrderOrgInterconnected,
  saveOrgInterconnected,
} from '@/apps/document/api/graphql/org-interconnected';
import {
  OrgInterconnected,
  type OrgInterconnectedInterface,
} from '@/apps/document/model/orgInterconnected';
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
  orgInterconnected: {
    type: Object as PropType<OrgInterconnectedInterface>,
    default: {} as OrgInterconnectedInterface,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (!props.id) {
  const { onResult } = maxNOrderOrgInterconnected();
  onResult((res) => {
    orgInterconnected.value.norder = res.data.maxOrderActiveOrgInterconnected;
  });
}

if (props.id) {
  const { onResult } = getOrgInterconnectedById(
    props.orgInterconnected?.id || '',
  );
  onResult((res) => {
    orgInterconnected.value = { ...res.data.getOrgInterconnectedById };
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
const orgInterconnected = ref<OrgInterconnectedInterface>(
  props.orgInterconnected,
);
const isCreate = isNull(props.id);

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.orgInterconnected.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.orgInterconnected.objectName')),
    name: orgInterconnected.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveOrgInterconnectedMutate,
  onDone: saveOrgInterconnectedDone,
  onError: saveOrgInterconnectedError,
} = saveOrgInterconnected();

function submit() {
  submitForm.value = true;
  if (!orgInterconnected.value.code || !orgInterconnected.value.name) {
    return;
  }
  assign(orgInterconnected.value, { id: orgInterconnected.value['id'] ? orgInterconnected.value['id'] : null, });
  saveOrgInterconnectedMutate({ orgInterconnected: { ...omit(orgInterconnected.value) }, });
}

saveOrgInterconnectedDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.orgInterconnected.objectName'),
      itemName: orgInterconnected.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  orgInterconnected.value = new OrgInterconnected();
});
saveOrgInterconnectedError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({
          message: t(
            'document.orgInterconnected.errors.' + errorCode.toString(),
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
