<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    style='width: 50vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click="emits('hide-dialog')"/>
            <div class='align-content-center font-semibold text-2xl'>
              {{
                id ? t('hrm.contract.titleContractAppendixFormUpdate') : t('hrm.contract.titleContractAppendixFormCreate')
              }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <form ref='formRef'>
      <div class='formgrid grid mb-4'>
        <div class='col-12 field mt-2'>
          <label>{{
            t(`hrm.contract.contractForContractAppendix`)
          }}</label>
          <span class='font-bold ml-2'> {{
            selectedContract?.code || contractsData?.find((item: Contract) => item.id === contractAppendix.contractId)?.code
          }}</span>
        </div>

        <div class='col-6 field'>
          <label
            v-required>{{
              t(`hrm.contract.numContractAppendix`)
            }}</label>
          <InputText
            v-model='contractAppendix.numContractAppendix'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='numContractAppendix'/>
          <ValidateErrorMessage :errors='v$.numContractAppendix.$errors'/>
        </div>
        <div class='col-6'></div>
        <div class='col-6 field'>
          <label
            v-required
            class='flex mb-1'>{{
              t(`hrm.contract.signDate`)
            }}
          </label>
          <Calendar
            v-model='contractAppendix.signDate'
            class='w-full'
            date-format='dd/mm/yy'
            icon-display='input'
            show-icon/>
          <ValidateErrorMessage :errors='v$.signDate.$errors'/>
        </div>
        <div class='col-6 field'>
          <label
            class='flex mb-1'>{{
              t(`hrm.contract.effectiveDate`)
            }}
          </label>
          <Calendar
            v-model='contractAppendix.effectiveDate'
            class='w-full'
            date-format='dd/mm/yy'
            icon-display='input'
            show-icon/>
        </div>

        <div class='col-12 field'>
          <label>{{
            t(`hrm.contract.signatory`)
          }}</label>
          <InputText
            v-model='contractAppendix.signatory'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='signatory'/>
        </div>
        <div class='col-12 field'>
          <label>{{
            t(`hrm.contract.content`)
          }}</label>
          <Textarea
            v-model='contractAppendix.content'
            class='w-full'
            rows='3'/>
        </div>

        <div class='col-12 field'>
          <div class='align-items-center flex justify-content-between'>
            <label>{{
              t(`hrm.contract.attachment`)
            }}</label>
            <Button
              class='border-round-sm mb-2 min-w-max'
              icon='pi pi-upload'
              :label='t("common.upload")'
              @click='showModalAttachment = true'/>
          </div>
          <HrmContractAttachFilesTable
            :attachment='contractAppendix.attachments'
            :is-detail='false'
            @show-action-menus='showActionMenus'/>
        </div>

        <div class='col-8 field'>
          <label>{{ t(`hrm.salary.status`) }}</label>
          <div class='align-items-center flex gap-5 my-1'>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='contractAppendix.status'
                input-id='ingredient1'
                name='status'
                :value='true'/>
              <label
                class='ml-2'
                for='ingredient1'>{{ t(`hrm.contract.stillEffect`) }}</label>
            </div>
            <div class='align-items-center flex'>
              <RadioButton
                v-model='contractAppendix.status'
                input-id='ingredient2'
                name='status'
                :value='false'/>
              <label
                class='ml-2'
                for='ingredient2'>{{ t(`hrm.contract.expire`) }}</label>
            </div>
          </div>
        </div>
      </div>
    </form>

    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
      style='width: 100%; left: 0; z-index: 1000'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='onSave'/>
    </div>
  </Sidebar>

  <AddAttachmentModal
    v-model:visible='showModalAttachment'
    :data='fileEdited'
    @close='showModalAttachment = false'
    @update:file='handleFileUpload'/>
  <Menu
    ref='actionMenusRef'
    :contract-appendix='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createContractAppendix, findContractAppendix, updateContractAppendix } from '@/apps/hrm/api/rest/contract';
import type { EmployeeAttachment, } from '@/apps/hrm/model/attachment';
import type { Contract } from '@/apps/hrm/model/contract';
import AddAttachmentModal from '@/apps/hrm/views/contract/dialog/AddAttachmentModal.vue';
import HrmContractAttachFilesTable from '@/apps/hrm/views/contract/list/HrmContractAttachFilesTable.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  },
  selectedContract: {
    type: Object as PropType<any>,
    default: undefined
  },
  contractsData: {
    type: Array as PropType<Contract[]>,
    default: () => []
  },
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
const formRef = ref<HTMLFormElement>();
const contractAppendix = ref<any>({} as any);
const showModalAttachment = ref(false);
const fileEdited = ref({} as EmployeeAttachment);
const actionMenus = ref<MenuItem[]>([]);
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const { moment } = useMoment();

const validateRules = {
  numContractAppendix: {
    required: helpers.withMessage(
      t('hrm.contract.error.requiredNumContractAppendix'),
      required,
    ),
  },
  signDate: {
    required: helpers.withMessage(
      t('hrm.contract.error.requiredSignDate'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, contractAppendix);

if (!props.id) {
  contractAppendix.value.status = true;
  contractAppendix.value.signDate = new Date();
  contractAppendix.value.effectiveDate = new Date();
} else {
  findContractAppendix(props.id).then((res: any) => {
    contractAppendix.value = cloneDeep(res);
    contractAppendix.value.signDate = new Date(res.signDate);
    contractAppendix.value.effectiveDate = new Date(res.effectiveDate);
    contractAppendix.value.attachments = res.files;
  });
}

const handleFileUpload = (data: { name: string; file: File | null }) => {
  if (!contractAppendix.value) {
    return;
  }

  const newAttachments: EmployeeAttachment[] = [
    ...contractAppendix.value.attachments ?? [],
    {
      name: data.name,
      file: data.file ?? undefined
    }
  ];

  contractAppendix.value = {
    ...contractAppendix.value,
    attachments: newAttachments
  };

  showModalAttachment.value = false;
};

const onSave = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && contractAppendix.value) {
        const data = new FormData(formRef.value);

        data.append('signDate', moment(contractAppendix.value.signDate).format(DateTimeFormat.ISO_LOCAL_DATE));
        contractAppendix.value.effectiveDate && data.append('effectiveDate', moment(contractAppendix.value.effectiveDate).format(DateTimeFormat.ISO_LOCAL_DATE));
        contractAppendix.value.content && data.append('content', contractAppendix.value.content);

        if (Array.isArray(contractAppendix.value?.attachments) && contractAppendix.value?.attachments.length > 0) {
          contractAppendix.value?.attachments.forEach((item: any, index: number) => {
            data.append(`attachments[${index}].name`, item.name ?? '');
            if (item.file) {
              data.append(`attachments[${index}].file`, item.file);
              if (contractAppendix.value.id && item.id) {
                data.append(`attachments[${index}].id`, item.id || '');
              }
            }
          });
        }

        if (props.id) {
          data.append('contractId', contractAppendix.value.contractId);
          data.append('employeeId', contractAppendix.value.employeeId);
          return updateContractAppendix(props.id, data).then(() => {
            toastSuccess({ message: t('common.saveSuccess') });
            emits('hide-dialog');
          });
        } else {
          data.append('contractId', props.selectedContract.id);
          data.append('employeeId', props.selectedContract.employeeId);
          return createContractAppendix(data).then(() => {
            toastSuccess({ message: t('common.saveSuccess') });
            emits('hide-dialog');
          });
        }
      }
    });
};

const showActionMenus = (event: Event, index: number) => {
  actionMenus.value = [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => {
        const file = contractAppendix.value.attachments?.[index];
        if (file) {
          fileEdited.value = file;
        }
        showModalAttachment.value = true;
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (contractAppendix.value.attachments && contractAppendix.value.attachments[index]) {
          contractAppendix.value.attachments.splice(index, 1);
        }
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
};
</script>

<style scoped>

</style>