<template>
  <Dialog
    v-if='property'
    v-model:visible='visible'
    class='w-8'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <div
      v-disabled='{disabled: isView}'
      class='p-fluid'>
      <div class='formgrid grid'>
        <div class='col-6 field'>
          <label
            v-required
            for='propertyFieldName'>{{ t('admin.objectTemplate.property.fieldName') }}</label>
          <InputText
            id='propertyFieldName'
            v-model='property.fieldName'
            v-trim
            autofocus
            :disabled='!isCreate'
            :placeholder='t("admin.objectTemplate.property.fieldName")'/>
          <ValidateErrorMessage :errors='v$.fieldName.$errors'/>
        </div>

        <div class='col-6 field'>
          <label
            v-required
            for='propertyName'>{{ t('admin.objectTemplate.property.name') }}</label>
          <InputText
            id='propertyName'
            v-model='property.name'
            v-trim
            :autofocus='isCreate'
            :placeholder='t("admin.objectTemplate.property.name")'/>
          <ValidateErrorMessage :errors='v$.name.$errors'/>
        </div>

        <div class='col-6 field'>
          <label
            v-required
            for='propertyDataType'>{{ t('admin.objectTemplate.property.dataType') }}</label>
          <Dropdown
            v-model='property.dataType'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='propertyDataType'
            option-label='label'
            option-value='value'
            :options='dataTypes'
            :placeholder='t("admin.objectTemplate.property.dataType")'/>
          <ValidateErrorMessage :errors='v$.dataType.$errors'/>
        </div>

        <div
          v-if='isCheckOrRadioSelected'
          class='col-6 field'>
          <label
            v-required
            for='propertyDataType'>{{ t('admin.objectTemplate.property.selectedValueType') }}</label>
          <Dropdown
            v-model='selectedValueType'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='selectedValueType'
            option-label='label'
            option-value='value'
            :options='selectValueTypes'
            :placeholder='t("admin.objectTemplate.property.selectedValueType")'/>
          <ValidateErrorMessage :errors='v$.dataType.$errors'/>
        </div>

        <div
          v-if='isShowReference'
          class='col-6 field'>
          <label
            v-required
            for='propertyReferenceData'>{{ t('admin.objectTemplate.property.referenceData') }}</label>
          <Dropdown
            v-model='property.referenceData'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='propertyReferenceData'
            option-label='name'
            option-value='code'
            :options='categoryGroups'
            :placeholder='t("admin.objectTemplate.property.referenceData")'
            @change='handleCategoryGroupsSelected'/>
        </div>

        <div class='col-6 field'>
          <label
            v-required
            for='propertyType'>{{ t('admin.objectTemplate.property.type.title') }}</label>
          <Dropdown
            id='propertyType'
            v-model='property.type'
            :disabled='true'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            option-label='label'
            option-value='value'
            :options='propertyType'/>
        </div>

        <div
          v-if='isShowReference'
          class='col-6 field'>
          <label
            v-required
            for='propertyDefaultValue'>{{ t('admin.objectTemplate.property.defaultValue') }}</label>
          <Dropdown
            v-if='isShowReference'
            id='propertyDefaultValue'
            v-model='property.defaultValue'
            :filter='true'
            input-id='defaultValue'
            option-label='name'
            option-value='code'
            :options='categories'
            :placeholder='t("admin.objectTemplate.property.defaultValue")'/>
          <InputText
            v-else
            id='propertyDefaultValue'
            v-model='property.defaultValue'
            v-trim
            :placeholder='t("admin.objectTemplate.property.defaultValue")'/>
        </div>

        <div
          v-if='isCheckOrRadioSelected && !isShowReference'
          class='col-6 field max-w-50'>
          <label for='listValue'>{{ t('admin.objectTemplate.listValue') }}</label>
          <Chips
            id='listValue'
            v-model='property.listValue'
            separator=','/>
        </div>

        <div class='col-6 field'>
          <label
            v-required
            for='propertyStatus'>{{ t('common.status') }}</label>
          <Dropdown
            v-model='property.status'
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-id='propertyStatus'
            option-label='label'
            option-value='value'
            :options='getStatuses()'
            :placeholder='t("common.status")'/>
        </div>

        <div class='col-6 field'>
          <label for='order'>{{ t('common.order') }}</label>
          <InputNumber
            id='order'
            v-model='property.order'
            :min='0'/>
        </div>
      </div>

      <div class='col field'>
        <div class='align-items-center flex'>
          <Checkbox
            v-model='property.required'
            binary
            input-id='required'/>
          <label
            class='ml-2'
            for='required'>{{ t('admin.objectTemplate.property.required') }}</label>
        </div>
      </div>

      <div class='field'>
        <label for='propertyDescription'>{{ t('common.description') }}</label>
        <Textarea
          id='propertyDescription'
          v-model='property.description'
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
import { get, isEmpty, omit, toLower } from 'lodash';
import { computed, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCategoriesByGroupGraphql } from '@/apps/admin/api/graphql/category-graphql-api';
import { getAllCategoryGroupGraphql } from '@/apps/admin/api/graphql/category-group-graphql-api';
import { updateObjectPropertyGraphql } from '@/apps/admin/api/graphql/object-graphql-api';
import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { DataType, Property, PropertyType, ValueType } from '@/apps/admin/model/object/Property';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getStatuses, mapEnumString } from '@/common/helpers/utils';

const props = withDefaults(defineProps<PropertyFormProps>(), {
  visibleDialog: false,
  item: () => new Property(),
  isView: false,
  objectId: '',
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

const categories = ref();
const categoryGroups = ref();
const isView = ref(props.isView);
const selectedValueType = ref(ValueType.TEXT);

interface PropertyFormProps {
  visibleDialog: boolean,
  item: Property,
  isView: boolean,
  objectId: string,
}

const propertyFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: true,
    type: 'button',
    command: () => updateObjectProperty()
  }
};
provide('dialogFooterButtons', propertyFormFooterButtons);

const visible = ref(props.visibleDialog);
const property = ref(props.item);
const isCreate = isEmpty(property.value['fieldName']);
const isGlobal = property.value.type === PropertyType.GLOBAL;
const isShowReference = computed(() => property.value.dataType === DataType.CATEGORY
    || selectedValueType.value === ValueType.CATEGORY);
const isCheckOrRadioSelected = computed(() => property.value.dataType === DataType.CHECK_BOX
    || property.value.dataType === DataType.RADIO_BOX || property.value.dataType === DataType.MULTI_SELECT);

const propertyType = mapEnumString(PropertyType).map((type) => ({
  label: type,
  value: type
}));

const dataTypes = mapEnumString(DataType).map((type) => ({
  label: type,
  value: type
}));

const selectValueTypes = mapEnumString(ValueType).map((type) => ({
  label: t(`admin.objectTemplate.property.${type}`),
  value: type,
}));

const headerDialog = isCreate
  ? t('common.createItem', { item: toLower(t('admin.objectTemplate.property.objectName')) })
  : t('common.editItemName', {
    item: toLower(t('admin.objectTemplate.property.objectName')),
    name: property.value.name
  });

const validateRules = {
  fieldName: { required: helpers.withMessage(t('property.codeEmpty'), required) },
  name: { required: helpers.withMessage(t('property.nameEmpty'), required) },
  dataType: { required: helpers.withMessage(t('property.dataTypeNotSelected'), required) },
  type: { required: helpers.withMessage(t('property.typeNotSelected'), required) },
};

const v$ = useVuelidate(validateRules, property);

const {
  mutate: updateObjectPropertyMutate,
  onDone: updateObjectPropertyDone,
  onError: updateObjectPropertyError
} = updateObjectPropertyGraphql();

function updateObjectProperty() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      updateObjectPropertyMutate({
        objectId: props.objectId,
        propertyFieldName: isCreate ? null : property.value.fieldName,
        propertyInput: omit(property.value, ['ordinalNumber'])
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

updateObjectPropertyDone((response) => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('admin.objectTemplate.property.objectName'),
      itemName: property.value.name
    })
  });
  emits('reload', get(response, 'data.updateObjectProperty', []));
  emits('hide-dialog');
});

updateObjectPropertyError((error) => {
});

const {
  onResult: getAllCategoryGroupOnResult,
  onError: getAllCategoryGroupOnError
} = getAllCategoryGroupGraphql();

getAllCategoryGroupOnResult((res) => {
  categoryGroups.value = res.data.allCategoryGroup;
});

getAllCategoryGroupOnError(res => {
});

const {
  load: getCategoriesByGroupGraphqlLoad,
  onResult: getCategoriesByGroupGraphqlOnResult,
  onError: getCategoriesByGroupGraphqlOnError
} = getCategoriesByGroupGraphql();

getCategoriesByGroupGraphqlOnResult((res) => {
  categories.value = res.data.groupCategories;
});

getCategoriesByGroupGraphqlOnError((res) => {
});

function handleCategoryGroupsSelected() {
  getCategoriesByGroupGraphqlLoad(undefined, { groupCode: property.value.referenceData });
}

if (props.item.referenceData) {
  handleCategoryGroupsSelected();
}

const objectPropertyFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: false,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: !isGlobal && {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => updateObjectProperty()
  }
};
provide('dialogFooterButtons', objectPropertyFormFooterButtons);

watch(() => property.value.dataType, () => {
  property.value.referenceData = '';
  property.value.defaultValue = '';
});

</script>

<script lang='ts'>
export default { name: 'PropertyForm' };
</script>
