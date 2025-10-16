<template>
  <Dialog
    v-if='privateCategory'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visibleDialog'
    :header='headerDialog'
    @hide='emits("hide-dialog")'>
    <div class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='categoryGroup'>{{ t('admin.category.objectName') }}</label>
        <TreeSelect
          v-model='privateSelectedCategoryGroup'
          :empty-message='t("common.selectEmpty")'
          :filter='true'
          input-id='categoryGroup'
          :options='categoryGroups'
          :placeholder='t("admin.category.objectName")'/>
        <!--        <ValidateErrorMessage-->
        <!--          v-if='!$props.categoryGroup'-->
        <!--          :errors='v$.groupCode.$errors'/>-->
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='categoryCode'>{{ t('admin.category.code') }}</label>
          <InputText
            id='categoryCode'
            v-model='privateCategory.code'
            v-code
            :autofocus='!isCreate'
            :disabled='!isCreate'
            :placeholder='t("admin.category.code")'/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryName'>{{ t('admin.category.name') }}</label>
          <InputText
            id='categoryName'
            v-model='privateCategory.name'
            v-trim
            :placeholder='t("admin.category.name")'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label for='categoryOrder'>{{ t('common.ordinalNumber') }}</label>
          <InputNumber
            id='categoryOrder'
            v-model='privateCategory.order'
            :placeholder='t("common.ordinalNumber")'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='privateCategory.status'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='categoryStatus'
            option-label='label'
            option-value='value'
            :options='getStatuses()'
            :placeholder='t("common.status")'/>
        </div>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <div class='align-items-center flex'>
            <Checkbox
              v-model='privateCategory.isDefault'
              binary
              input-id='categoryDefault'/>
            <label
              class='ml-2'
              for='categoryDefault'>{{ t('common.setDefault') }}</label>
          </div>
        </div>
      </div>

      <div class='field'>
        <label for='categoryDescription'>{{ t('common.description') }}</label>
        <Textarea
          id='categoryDescription'
          v-model='privateCategory.description'
          v-trim
          :placeholder='t("common.description")'
          rows='3'/>
      </div>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { omit, toLower } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createCategoryGraphql, updateCategoryGraphql } from '@/apps/admin/api/graphql/category-graphql-api';
import { Category, type CategoryGroupInterface, type CategoryInterface } from '@/apps/admin/model/category';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { ACTIVITY_STATUSES, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getStatuses, listToTree } from '@/common/helpers/utils';

const props = withDefaults(defineProps<CategoryFormProps>(), {
  category: undefined,
  allCategories: () => [],
  allCategoryGroup: () => [],
  selectedCategoryGroup: undefined,
});
const emits = defineEmits(['hide-dialog', 'reload']);

const visibleDialog = defineModel<boolean>('visibleDialog', { default: false });
const isCreate = defineModel<boolean>('isCreate', { default: false });

const { t } = useI18n();

interface CategoryFormProps {
  category: CategoryInterface,
  allCategories: CategoryInterface[],
  allCategoryGroup: CategoryGroupInterface[],
  selectedCategoryGroup: CategoryGroupInterface,

}

const categoryFormFooterButtons = {
  closeButton: {
    icon: 'pi pi-times',
    label: t('common.close'),
    severity: 'danger',
    class: 'border-round-sm',
    type: 'button',
    command: () => {
      emits('hide-dialog');
    }
  },
  actionButton: {
    icon: 'pi pi-check',
    label: t('common.save'),
    text: false,
    class: 'border-round-sm',
    type: 'button',
    command: () => saveCategory()
  }
};
provide('dialogFooterButtons', categoryFormFooterButtons);

const privateCategory = ref(isCreate.value ? {} as CategoryInterface : props.category);
privateCategory.value.order = isCreate.value ? props.allCategories.length + 1 : privateCategory.value.order;
privateCategory.value.status = isCreate.value ? ACTIVITY_STATUSES.ACTIVE : privateCategory.value.status;
const headerDialog = isCreate.value
  ? t('common.createItem', { item: toLower(t('admin.category.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.category.objectName')),
    name: privateCategory.value.name
  });

const validateRules = {
  code: { required: helpers.withMessage(t('admin.category.codeEmpty'), required) },
  name: { required: helpers.withMessage(t('admin.category.nameEmpty'), required) },
  groupCode: { required: helpers.withMessage(t('admin.category.categoryGroupNotSelected'), required) }
};

const v$ = useVuelidate(validateRules, privateCategory);

const categoryGroups = ref([]);
const privateSelectedCategoryGroup = ref<TreeNode>(props.selectedCategoryGroup);
const indexKey = isCreate.value ? props.selectedCategoryGroup.code : props.selectedCategoryGroup.parentCode;

privateSelectedCategoryGroup.value[indexKey as string] = true;

categoryGroups.value = listToTree(props.allCategoryGroup.map((categoryGroup: CategoryGroupInterface) => ({
  key: categoryGroup.code,
  label: categoryGroup.name,
  data: categoryGroup.code,
  parentCode: categoryGroup.parentCode,
  children: []
})), {
  id: 'key',
  parentId: 'parentCode',
  children: 'children'
});

const {
  mutate: createCategoryMutate,
  onDone: createCategoryDone,
  onError: createCategoryError
} = createCategoryGraphql();

const {
  mutate: updateCategoryMutate,
  onDone: updateCategoryDone,
  onError: updateCategoryError
} = updateCategoryGraphql();

function saveCategory() {

  privateCategory.value.groupCode = privateSelectedCategoryGroup.value.code;
  privateCategory.value.isDefault = privateCategory.value.isDefault || false;
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      if (isCreate.value) {
        createCategoryMutate({ categoryInput: omit(privateCategory.value, ['id', 'ordinalNumber', 'groupName', 'isGlobal']) });
      } else {
        updateCategoryMutate({ categoryInput: omit(privateCategory.value, ['id', 'ordinalNumber', 'groupName', 'isGlobal']) });
      }
    }
  });

}

createCategoryDone(() => {
  toastSuccess({
    message: t('common.result.message.created', {
      itemType: t('admin.category.objectName'),
      itemName: privateCategory.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
});

createCategoryError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        errorCode,
        errorType
      } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('admin.category.errors.' + errorCode.toString()) });
      }
    });
  }
});

updateCategoryDone(() => {
  toastSuccess({
    message: t('common.result.message.updated', {
      itemType: t('admin.category.objectName'),
      itemName: privateCategory.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
  privateCategory.value = new Category();
});

updateCategoryError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        errorCode,
        errorType
      } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('admin.category.errors.' + errorCode.toString()) });
      }
    });
  }
});
</script>

<script lang='ts'>
export default { name: 'CategoryForm' };
</script>