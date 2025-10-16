<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='(id ? t("hrm.salary.updatePayslipInfo") : t("hrm.salary.createPayslipInfo")) + (isGroup ? t("hrm.salary.group"): t("hrm.salary.kpi"))'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <div class='col-12 field'>
          <label
            v-required
            class='font-bold'>{{
              isGroup ? t(`hrm.salary.codePayslipInfo`) : t(`hrm.salary.codeRowPayslipInfo`)
            }}</label>
          <InputText
            v-model='payslipInfo.code'
            :autofocus='isCreate'
            class='p-component p-inputtext w-full'
            :disabled='!isCreate'
            maxlength='255'
            name='code'/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>
        <div class='col-12 field'>
          <label
            v-required
            class='font-bold'>{{
              isGroup ? t(`hrm.salary.namePayslipInfo`) : t(`hrm.salary.nameRowPayslipInfo`)
            }}</label>
          <InputText
            v-model='payslipInfo.name'
            class='p-component p-inputtext w-full'
            maxlength='255'
            name='name'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col-8 field'>
          <label class='font-bold'>{{ t('hrm.category.parentCode') }}</label>
          <TreeSelect
            v-model='parentCode'
            class='mt-1 w-full'
            :empty-message="t('common.selectEmpty')"
            :filter='true'
            input-id='organizationParent'
            :options='payslipInfos'
            style='height: 40px'>
            <template
              #value='{ value }: { value: TreeNode[]; placeholder: String }'>
              <div class='flex justify-content-between'>
                <span>{{
                  value.length > 0
                    ? value[0].label
                    : ''
                }}</span>
              </div>
            </template>
          </TreeSelect>
        </div>

        <div class='col-6 field'>
          <label class='font-bold'>{{ t('common.status') }}</label>
          <NamedDropdown
            id='status'
            v-model='payslipInfo.status'
            name='status'
            option-label='label'
            option-value='value'
            :options='getStatuses'/>
        </div>

        <div class='col-4 field'>
          <label
            v-required
            class='font-bold'>{{
              t(`meeting.meetingRoom.norder`)
            }}</label>
          <div>
            <InputNumber
              v-model='payslipInfo.orderNum'
              input-id='integeronly'/>
            <ValidateErrorMessage :errors='v$.orderNum.$errors'/>
            <input
              v-model='payslipInfo.orderNum'
              hidden
              name='orderNum'/>
          </div>
        </div>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, get, isNull } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllPayslipInfo,
  getMaxOrderNumPayslipInfo,
  getPayslipInfo,
  savePayslipInfo
} from '@/apps/hrm/api/graphql/salary';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  selectedParentCode: {
    type: String,
    default: null,
  },
  selectedPayslip: {
    type: Object as PropType<any>,
    required: true,
  },
  isGroup: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(['hide-dialog']);
const isCreate = isNull(props.id);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const parentCode = ref();
const isGroup = ref(props.isGroup);
const payslipInfo = ref<any>({} as any);

if (props.id) {
  getPayslipInfo(props.id).onResult((res) => {
    payslipInfo.value = cloneDeep(res.data.getPayslipInfo);
    parentCode.value = { [payslipInfo.value.parentId]: true };
    isGroup.value = payslipInfo.value.isGroup;
  });
} else {
  getMaxOrderNumPayslipInfo(props.selectedParentCode, props.selectedPayslip.code).onResult(res => {
    payslipInfo.value.orderNum = res.data.getMaxOrderNumPayslipInfo;
  });
  payslipInfo.value.status = true;
  parentCode.value = { [props.selectedParentCode]: true };
}

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredName'),
      required,
    ),
  },
  code: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredCode'),
      required,
    ),
  },
  orderNum: {
    required: helpers.withMessage(
      t('hrm.category.error.requiredOrderNumber'),
      required,
    ),
  },
};
const v$ = useVuelidate(validateRules, payslipInfo);

const { onResult } = getAllPayslipInfo(props.selectedPayslip.code);

const payslipInfos = ref([]);

onResult((response) => {
  const data = get(response, 'data.getAllPayslipInfo', []);
  payslipInfos.value = listToTree(
    data.map((professionalSkill: any) => ({
      key: professionalSkill.id,
      label: professionalSkill.name,
      data: professionalSkill.id,
      parentId: professionalSkill.parentId,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

const {
  mutate,
  onDone
} = savePayslipInfo();

const submit = () => {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && payslipInfo.value) {
        if (Object.keys(parentCode.value)[0] === 'null') {
          payslipInfo.value.parentId = null;
        } else {
          payslipInfo.value.parentId = Object.keys(parentCode.value)[0];
        }

        mutate({
          payslipInfo: {
            ...payslipInfo.value,
            payslipCode: props.selectedPayslip.code,
            payslipName: props.selectedPayslip.name,
            isGroup: isGroup.value
          }
        });
      }
    });
};

onDone(() => {
  toastSuccess({ message: t('common.saveSuccess') });
  emits('hide-dialog');
});

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
</script>

<style scoped>

</style>