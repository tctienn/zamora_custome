<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='headerDialog'
    :modal='true'
    @hide='emits("hide-dialog")'>
    <div
      v-if='!props.isDetail'
      class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='applicationDescription'>{{ t('admin.role.code') }}</label>
        <InputText
          id='applicationIcon'
          v-model='role.code'
          v-code
          :disabled='objectKey > 1'
          maxlength='255'/>
        <ValidateErrorMessage :errors='v$.code.$errors'/>
      </div>
      <div class='field'>
        <label
          v-required
          for='applicationDescription'>{{ t('admin.role.name') }}</label>
        <InputText
          id='applicationIcon'
          v-model='role.name'
          maxlength='255'/>
        <ValidateErrorMessage :errors='v$.name.$errors'/>
      </div>

      <div class='field'>
        <label for='applicationDescription'>{{ t('admin.role.description') }}</label>
        <InputText
          id='applicationIcon'
          v-model='role.description'
          maxlength='255'/>
      </div>

      <div class='formgrid grid'>

        <div class='col field'>
          <label
            for='isActive'>{{ t('common.status') }}</label>
          <NamedDropdown
            id='isActive'
            v-model='role.status'
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
    </div>

    <div
      v-if='props.isDetail'
      class='flex flex-column gap-3'>
      <div><label>{{ t('admin.role.code') }}</label>: <b>{{ role.code }}</b></div>

      <div><label>{{ t('admin.role.name') }}</label>: <b>{{ role.name }}</b></div>

      <div><label>{{ t('admin.role.description') }}</label>: <b>{{ role.description }}</b></div>

      <div><label>{{ t('admin.role.status') }}</label>:
        <b>{{ role.status ? t('common.statuses.active') : t('common.statuses.deactivate') }}</b>
      </div>
    </div>
    <template #footer>
      <DialogFooter v-if='!props.isDetail'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveRolePermissionsGraph, updateRolePermissions } from '@/apps/admin/api/graphql/role-graphql-api';
import type { RoleInterface } from '@/apps/admin/model/role';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG, STATUSES } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<roleFormProps>(), {
  visibleDialog: false,
  item: undefined,
  isDetail: false
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n() || {};
const role = ref<RoleInterface>(props.item);

if (!role.value.code) {
  role.value.status = 'ACTIVE';
}
const {
  mutate: saveRoleMutate,
  onDone: saveRoleOnDone
} = saveRolePermissionsGraph();
const {
  mutate: updateRoleMutate,
  onDone: updateRoleOnDone
} = updateRolePermissions();
const objectKey = Object.keys(props.item).length;
const submit = ref<boolean>(false);

let getStatuses = ref([
  {
    label: t('common.statuses.active'),
    value: 'ACTIVE'
  },
  {
    label: t('common.statuses.deactivate'),
    value: 'DEACTIVATE'
  }
]);

interface roleFormProps {
  visibleDialog: boolean,
  item: RoleInterface,
  isDetail: boolean
}

const userFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    severity: 'danger',
    class: 'border-round-sm',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: objectKey > 1 ? {
    label: t('common.update'),
    icon: 'pi pi-save',
    text: false,
    type: 'button',
    class: 'border-round-sm',
    command: () => updateRole()
  } : {
    icon: 'pi pi-check',
    label: t('common.save'),
    text: false,
    type: 'button',
    class: 'border-round-sm',
    command: () => createRole()
  }
};
provide('dialogFooterButtons', userFormFooterButtons);
const visible = ref(props.visibleDialog);
const headerDialog: string = objectKey == 1 ? t('common.createItem', { item: toLower(t('admin.user.role')) })
  : props.isDetail ? t('common.detailItem', { item: toLower(t('admin.user.role')) })
    : t('common.updateItem', { item: toLower(t('admin.user.role')) });

if (objectKey == 0) {
  role.value.status = STATUSES.ACTIVE;
}

const validateRules = {
  name: { required: helpers.withMessage(t('admin.role.message.nameIsEmpty'), required) },
  code: { required: helpers.withMessage(t('admin.role.message.codeIsEmpty'), required) }
};
const v$ = useVuelidate(validateRules, role.value);

function createRole() {
  submit.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveRoleMutate({ roleInput: role.value });
    }
  });
}

function updateRole() {
  submit.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      updateRoleMutate({ roleInput: role.value });
    }
  });
}

saveRoleOnDone(() => {
  toastSuccess({ message: t('common.result.message.createSuccess') });
  emits('hide-dialog');
  emits('reload');
  submit.value = false;
});

updateRoleOnDone(() => {
  toastSuccess({ message: t('common.result.message.createSuccess') });
  emits('hide-dialog');
  emits('reload');
  submit.value = false;
});

</script>

<script lang='ts'>
export default { name: 'UserForm' };
</script>

<style scoped>

</style>
