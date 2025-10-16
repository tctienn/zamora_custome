<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='openDialog'
    :header="t('ecm.capacity.configCapacityTitlle')"
    @hide='emits("hide-dialog")'>
    <div
      class='p-fluid'>
      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='categoryCode'>{{ t('ecm.capacity.typeConfig') }}</label>
          <Dropdown
            v-model='configForm.type'
            :empty-message='t("common.select")'
            name='type'
            option-label='name'
            option-value='code'
            :options='typeConfigs'
            :placeholder="t('common.select')"
            @change='chooseType(configForm.type)'/>
          <ValidateErrorMessage :errors='v$.type.$errors'/>
          <InputText
            v-model='configForm.id'
            hidden/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryName'>{{ t('ecm.capacity.object') }}</label>
          <Dropdown
            v-model='configForm.objectId'
            :empty-message='t("common.select")'
            name='objectId'
            option-label='label'
            option-value='value'
            :options='objectIds'
            :placeholder="t('common.select')"/>
          <ValidateErrorMessage :errors='v$.objectId.$errors'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='categoryGroup'>{{ t('ecm.capacity.capacity') }}</label>
          <InputNumber
            id='capacity'
            v-model='configForm.capacity'
            :placeholder='t("MB/GB/TB")'/>
          <ValidateErrorMessage :errors='v$.capacity.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryName'>{{ t('ecm.capacity.unit') }}</label>
          <Dropdown
            v-model='configForm.unit'
            :empty-message='t("common.select")'
            name='unit'
            option-label='name'
            option-value='code'
            :options='unit'
            :placeholder="t('common.select')"
            style='width: 100%'/>
          <ValidateErrorMessage :errors='v$.unit.$errors'/>
        </div>
      </div>
    </div>
    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserStatusActive } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllGroup } from '@/apps/admin/api/graphql/user-group-graphql-api';
import type { UserInterface } from '@/apps/admin/model/User';
import type { Group } from '@/apps/chat/model/group';
import { saveCapacity } from '@/apps/ecm/api/graphql/capacity-graphql-api';
import type { CapacityConfig } from '@/apps/ecm/model/capacity';
import { typeConfigCapacity, unitCapacity } from '@/apps/ecm/model/capacity';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<CapacityFormProps>(), {
  visibleDialog: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog', 'reload']);
const {
  onResult: getUserResult,
  refetch: getUserRefetch
} = getAllUserStatusActive();
const {
  onResult: getGroupResult,
  refetch: getGroupRefetch
} = getAllGroup();
const {
  mutate: saveCapacityMutate,
  onDone: saveCapacityDone,
  onError: saveCapacityError
} = saveCapacity();
const configForm = ref(props.item || {} as CapacityConfig);
const { t } = useI18n() || {};
const objectIds = ref([]);
const unit = ref();
const typeConfigs = ref();

unit.value = Object.values(unitCapacity).map((u: string) => ({
  code: u,
  name: u
}));

typeConfigs.value = Object.values(typeConfigCapacity).map((t) => ({
  code: t,
  name: t
}));

interface CapacityFormProps {
  visibleDialog: boolean,
  item: CapacityConfig
}

const validateRules = {
  type: { required: helpers.withMessage(t('ecm.capacity.error.typeEmpty'), required) },
  objectId: { required: helpers.withMessage(t('ecm.capacity.error.objectIdEmpty'), required) },
  capacity: { required: helpers.withMessage(t('ecm.capacity.error.capacityEmpty'), required) },
  unit: { required: helpers.withMessage(t('ecm.capacity.error.unitEmpty'), required) }
};
const v$ = useVuelidate(validateRules, configForm);

if (props.item.id) {
  if (props.item.type == 'PERSON') {
    getListUser();
  } else {
    getListGroup();
  }
} else {
  getListUser();
  getListGroup();
}

const openDialog = ref(props.visibleDialog);

const emailTemplateFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => save()
  }
};
provide('dialogFooterButtons', emailTemplateFormFooterButtons);

function getListUser() {
  getUserResult((res) => {
    objectIds.value = res.data.getAllUserStatusActive.map((user: UserInterface) => ({
      label: user.username + ' - ' + user.email,
      value: user.id
    }));
  });
}

function getListGroup() {
  getGroupResult((res) => {
    objectIds.value = res.data.getAllGroup.map((group: Group) => ({
      label: group.name,
      value: group.id
    }));
  });
}

function chooseType(type: string) {
  if (type == 'PERSON') {
    getUserRefetch();
  } else {
    getGroupRefetch();
  }
}

function save() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveCapacityMutate({
        capacityInput: {
          id: configForm.value.id,
          type: configForm.value.type,
          unit: configForm.value.unit,
          capacity: configForm.value.capacity,
          objectId: configForm.value.objectId
        }
      });
    }
  });
}

saveCapacityDone(() => {
  toastSuccess({ message: t('ecm.capacity.configSuccess') });
  emits('hide-dialog');
});

saveCapacityError((err) => {
  toastError({ message: t('ecm.capacity.error.' + err.graphQLErrors[0].extensions.errorCode) });
});
</script>

<script lang='ts'>
export default { name: 'CapacityForm' };
</script>

<style scoped>

</style>