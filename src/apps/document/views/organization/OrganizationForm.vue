<template>
  <Dialog
    v-model:visible='visibleDialog'
    :header="
      props.organizationProp.id
        ? t('document.partyPosition.updateOrganization')
        : t('document.partyPosition.createOrganization')
    "
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('close-dialog')">
    <div>
      <div class='grid'>
        <div class='col-6'>
          <label
            v-required
            class='font-bold'>{{
              t("document.partyPosition.codeOrganization")
            }}</label>
          <InputText
            id='code'
            v-model='organization.code'
            class='mt-1 p-component p-inputtext w-full'
            :disabled='organization.id != null'
            name='code'/>

          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>
      </div>
      <div class='grid'>
        <div class='col-12'>
          <label
            v-required
            class='font-bold'>{{
              t("document.partyPosition.nameOrganization")
            }}</label>
          <InputText
            id='name'
            v-model='organization.name'
            class='mt-1 p-component p-inputtext w-full'
            name='name'/>

          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>
      </div>

      <div class='grid pt-0'>
        <div class='col-6'>
          <label class='font-bold'>{{
            t("document.partyPosition.parent")
          }}</label>
          <TreeSelect
            v-model='organization.parentId'
            class='mt-1 w-full'
            :empty-message="t('common.selectEmpty')"
            :filter='true'
            input-id='organizationParent'
            :options='organizations'
            :placeholder="t('admin.organization.parent')">
            <template
              #value='{ value }: { value: TreeNode[]; placeholder: String }'>
              <div class='flex justify-content-between'>
                <span>{{
                  value.length > 0
                    ? value[0].label
                    : t("admin.user.chooseOrganization")
                }}</span>
              </div>
            </template>
          </TreeSelect>
        </div>
        <div class='col-6'>
          <label class='font-bold'>{{
            t("document.partyPosition.statusField")
          }}</label>
          <Dropdown
            v-model='organization.isActive'
            class='mt-1 w-full'
            :filter='true'
            option-label='label'
            option-value='value'
            :options='statusOption'
            :placeholder="t('common.selectStatus')"
            show-clear/>
        </div>
      </div>

      <div class='grid pt-0'>
        <div class='col-6'>
          <label class='font-bold'>{{ t("STT") }}</label>
          <InputNumber
            v-model='organization.norder'
            class='mt-1 w-full'/>
        </div>
        <div class='col-6'>
          <InputText
            id='id'
            v-model='organization.id'
            class='mt-1 p-component p-inputtext w-full'
            hidden
            name='id'/>
        </div>
      </div>

      <div class='grid pt-0'>
        <div class='col field'>
          <label class='font-bold'>{{
            t("document.partyPosition.description")
          }}</label>
          <Textarea
            id='description'
            v-model='organization.description'
            class='w-full'
            name='description'
            rows='5'/>
        </div>
      </div>
    </div>
    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { pick } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getByTypeGraphql,
  saveOrganizationGraphql,
} from '@/apps/document/api/graphql/organization';
import type { OrganizationInterface } from '@/apps/document/model/organization';
import { OrganizationType } from '@/apps/document/model/organization';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  organizationProp: {
    type: Object as PropType<OrganizationInterface>,
    default: {} as OrganizationInterface,
  },
  organizationType: {
    type: String,
    default: OrganizationType.PARTY,
  },
});

const emits = defineEmits(['close-dialog']);

const { t } = useI18n();

const visibleDialog = defineModel('visibleDialog', {
  type: Boolean,
  default: false,
});

const organization = ref({
  ...props.organizationProp,
  parentId: { [props.organizationProp.parentId]: true },
});

if (!props.organizationProp.id) {
  organization.value.norder = 0;
  organization.value.isActive = true;
}

const {
  mutate: saveMutation,
  onDone: saveOnDone,
  onError: saveOnError,
} = saveOrganizationGraphql();

const statusOption = [
  {
    label: t('document.partyPosition.status.active'),
    value: true,
  },
  {
    label: t('document.partyPosition.status.deactivate'),
    value: false,
  },
];

const organizations = ref([]);
const { onResult: getOrganizationResult, refetch: getOrganizationRefetch } =
    getByTypeGraphql(props.organizationType);
getOrganizationResult((res) => {
  organizations.value = res.data.getByType;
  organizations.value = listToTree(
    organizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.id,
      parentId: organization.parentId,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

const categoryFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => {
      emits('close-dialog');
    },
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => {
      saveOrganization();
    },
  },
};

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('document.partyPosition.message.codeNotEmpty'),
      required,
    ),
  },
  name: {
    required: helpers.withMessage(
      t('document.partyPosition.message.nameNotEmpty'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, organization);

function saveOrganization() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveMutation({
        organizationInput: pick(
          {
            ...organization.value,
            type: props.organizationType,
            parentId: organization.value.parentId
              ? Object.keys(organization.value.parentId)[0]
              : '',
          },
          'parentId',
          'name',
          'id',
          'code',
          'description',
          'isActive',
          'norder',
          'type',
        ),
      });
    }
  });
}

saveOnDone(() => {
  toastSuccess({
    message: props.organizationProp.id
      ? t('document.partyPosition.message.updateSuccess')
      : t('document.partyPosition.message.createSuccess'),
  });
  emits('close-dialog');
});

saveOnError((err) => {
  toastError({
    message: t(
      'document.partyPosition.message.'
        + err.graphQLErrors[0].extensions.errorCode,
    ),
  });
});

provide('dialogFooterButtons', categoryFormFooterButtons);

watch(
  () => props.organizationProp,
  (value) => {
    organization.value = {
      ...value,
      parentId: { [value.parentId]: true },
    };
  },
);

watch(
  () => props.organizationType,
  (value) => {
    getOrganizationRefetch({ organizationType: value });
  },
);
</script>

<script lang="ts">
export default { name: 'OrganizationForm' };
</script>

<style scoped></style>
