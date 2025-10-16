<template>
  <Dialog
    v-if='category'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isDetail}'
      class='p-fluid'>
      <div class='field'>
        <label
          v-required
          for='categoryGroup'>{{ t('admin.categoryGroup.objectName') }}</label>
        <TreeSelect
          v-model='selectedCategoryGroup'
          :empty-message='t("common.selectEmpty")'
          :filter='true'
          input-id='categoryGroup'
          :options='categoryGroups'
          :placeholder='t("admin.categoryGroup.objectName")'
          show-clear/>
        <ValidateErrorMessage :errors='v$.groupCode.$errors'/>
      </div>

      <div class='formgrid grid'>
        <div class='col field'>
          <label
            v-required
            for='categoryCode'>{{ t('admin.category.code') }}</label>
          <InputText
            id='categoryCode'
            v-model='category.code'
            v-code
            :autofocus='!isCreate'
            :disabled='!isCreate'
            :placeholder='t("admin.category.name")'/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryName'>{{ t('admin.category.name') }}</label>
          <InputText
            id='categoryName'
            v-model='category.name'
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
            v-model='category.order'
            :placeholder='t("common.ordinalNumber")'/>
        </div>

        <div class='col field'>
          <label
            v-required
            for='categoryStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='category.status'
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
              v-model='category.isDefault'
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
          v-model='category.description'
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

<script lang='ts' setup>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { assign, isEmpty, omit, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createCategoryGraphql } from '@/apps/admin/api/graphql/category-graphql-api';
import { getAllCategoryGroupByAppGraph } from '@/apps/admin/api/graphql/category-group-graphql-api';
import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import type { CategoryGroupInterface, CategoryInterface } from '@/apps/admin/model/category';
import { Category } from '@/apps/admin/model/category';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getStatuses, listToTree } from '@/common/helpers/utils';

const props = withDefaults(defineProps<CategoryFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined,
  allCategoryGroup: () => []
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { onResult: getAllCategoryGroupByAppOnResult } = getAllCategoryGroupByAppGraph('work-service');

const { t } = useI18n();

interface CategoryFormProps {
  visibleDialog: boolean,
  item: CategoryInterface,
  isDetail: boolean,
  allCategoryGroup: CategoryGroupInterface[]
}

const categoryFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: props.isDetail ? null : {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveCategory()
  }
};
provide('dialogFooterButtons', categoryFormFooterButtons);

const visible = ref(props.visibleDialog);
const category = ref(props.item);
const isCreate = isEmpty(category.value['code']);
const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('admin.category.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.category.objectName')),
    name: category.value.name
  });

const validateRules = {
  code: { required: helpers.withMessage(t('admin.category.codeEmpty'), required) },
  name: { required: helpers.withMessage(t('admin.category.nameEmpty'), required) },
  groupCode: { required: helpers.withMessage(t('admin.category.categoryGroupNotSelected'), required) }
};

const v$ = useVuelidate(validateRules, category);

const categoryGroups = ref([]);
const selectedCategoryGroup = ref();

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

getAllCategoryGroupByAppOnResult((res) => {
  // console.log('res', res.data.getCategoryGroupByApp);

  categoryGroups.value = listToTree(res.data.getCategoryGroupByApp.map((categoryGroup: CategoryGroupInterface) => ({
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
});

selectedCategoryGroup.value = isCreate ? null : { [category.value.groupCode as string]: true };

const {
  mutate: saveCategoryMutate,
  onDone: saveCategoryDone,
  onError: saveCategoryError
} = createCategoryGraphql();

function saveCategory() {
  assign(category.value, { groupCode: selectedCategoryGroup.value ? Object.keys(selectedCategoryGroup.value)[0] : null });
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      saveCategoryMutate({ categoryInput: omit(category.value, ['id', 'ordinalNumber', 'groupName', 'isGlobal']) });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

saveCategoryDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('admin.category.objectName'),
      itemName: category.value.name
    })
  });
  emits('reload');
  emits('hide-dialog');
  category.value = new Category();
});

saveCategoryError((error: any) => {
  toastErrorData({ error });
});
</script>

<script lang='ts'>
export default { name: 'CategoryForm' };
</script>