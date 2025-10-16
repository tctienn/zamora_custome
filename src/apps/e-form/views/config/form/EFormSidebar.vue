<template>
  <Sidebar
    v-model:visible='visible'
    class='w-30rem'
    header='EForm'
    position='right'
    :show-close-icon='false'>
    <template #header>
      <div class='font-semibold text-xl'>
        {{ t(`e-form.form.${lowerCase(mode)}EForm`) }}
      </div>
      <Button
        icon='pi pi-save'
        :label='t("common.save")'
        @click='save'/>
    </template>
    <form>
      <DynamicEFormElement
        v-model='eForm.code'
        v-code
        :disabled='mode === "EDIT"'
        :error='v$?.$errors?.find((error) => error.$property === "code")?.$message?.toString()'
        :label='t("e-form.form.code")'
        :mode='ElementMode.EDIT'
        name='code'
        required
        :type='ElementType.TEXT'/>
      <DynamicEFormElement
        v-model='eForm.name'
        :error='v$?.$errors?.find((error) => error.$property === "name")?.$message?.toString()'
        :label='t("common.name")'
        :mode='ElementMode.EDIT'
        name='name'
        required
        :type='ElementType.TEXT'/>
      <FormInputWrapper
        :label='t("common.group")'
        :mode='ElementMode.EDIT'
        name='groupId'>
        <TreeSelect
          v-model='selectedGroup'
          class='w-full'
          input-id='groupId'
          :input-props='{name: "groupId"}'
          :options='treeModel'
          selection-mode='single'/>
      </FormInputWrapper>
      <DynamicEFormElement
        v-model='eForm.orderNumber'
        :label='t("common.order")'
        :mode='ElementMode.EDIT'
        name='orderNumber'
        show-buttons
        :type='ElementType.NUMBER'/>
      <DynamicEFormElement
        v-model='eForm.description'
        :label='t("common.description")'
        :mode='ElementMode.EDIT'
        name='description'
        :type='ElementType.AREA'/>

      <DynamicEFormElement
        v-model='eForm.isActive'
        :label='t("common.statuses.active")'
        :mode='ElementMode.EDIT'
        name='isActive'
        :type='ElementType.SWITCH'/>
    </form>

  </Sidebar>
</template>

<script lang='ts' setup>

import type { MutateResult } from '@vue/apollo-composable/dist/useMutation';
import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { lowerCase, omit } from 'lodash';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { createEForm, updateEForm } from '@/apps/e-form/api/graphql/e-form';
import { allEFormGroups } from '@/apps/e-form/api/graphql/e-form-group';
import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode, ElementType } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';
import { convertGroupToTree, type EForm, type EFormGroup } from '@/apps/e-form/model/e-form';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  form: {
    type: Object as PropType<EForm>,
    default: () => ({})
  },
  mode: {
    type: String as PropType<'CREATE' | 'EDIT'>,
    default: 'CREATE'
  }
});
const visible = defineModel('visible', {
  type: Boolean,
  default: true
});

const { t } = useI18n();

const { result } = allEFormGroups();
const eForm = reactive<EForm>({} as EForm);
const groups = computed(() => result?.value?.eFormGroups as EFormGroup[] || []);
const treeModel = ref<TreeNode[]>([]);
const selectedGroup = ref<TreeSelectionKeys>();

watch(() => props.form, (value) => {
  if (value) {
    Object.assign(eForm, value);
    if (value.groupId) {
      selectedGroup.value = { [value.groupId]: true };
    } else {
      selectedGroup.value = {};
    }
  } else {
    Object.assign(eForm, {});
    selectedGroup.value = {};
  }
}, { immediate: true });
watch(groups, (value) => {
  if (value) {
    treeModel.value = convertGroupToTree(value);
  } else {
    treeModel.value = [];
  }
}, { immediate: true });
watch(selectedGroup, (value) => {
  if (value) {
    eForm.groupId = Object.keys(value)[0];
  } else {
    eForm.groupId = undefined;
  }
}, { immediate: true });

const validateRules = {
  name: { required: helpers.withMessage(t('common.validate.required', { item: t('common.name') }), required) },
  code: { required: helpers.withMessage(t('common.validate.required', { item: t('e-form.form.code') }), required) }
};
const v$: Ref<Validation> = useVuelidate(validateRules, eForm);

const needRefresh = inject('needRefresh', ref(false));

function save() {
  v$.value.$validate();
  if (v$.value.$invalid) {
    return;
  }
  let request: MutateResult<any>;
  if (props.mode === 'CREATE') {
    request = createEForm().mutate({ payload: eForm });
  } else {
    request = updateEForm().mutate({ payload: omit(eForm, 'versions') });
  }
  request.then(() => {
    toastSuccess();
    needRefresh.value = true;
    visible.value = false;
  }).catch(() => {
    toastError();
  });
}
</script>

<style scoped>

</style>