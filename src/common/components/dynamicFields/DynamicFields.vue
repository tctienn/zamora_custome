<template>
  <div
    v-for='(item,index) in fields'
    :key='index'
    :class='customClass'>
    <div>
      <div>
        <span v-if='item.dataType !== DataType.FILE'>
          <label
            v-if='item.required'
            v-required
            class='w-6'
            :for='item.fieldName'>{{ item.name }}</label>
          <label
            v-else
            class='w-6'
            :for='item.fieldName'>{{ item.name }}</label>
        </span>
        <div v-if='item.dataType === DataType.STRING'>
          <InputText
            :id='item.fieldName'
            v-model='dynamicValue[item.fieldName]'
            v-trim
            class='w-full'
            :disabled='action === ACTION.VIEW'
            @update:model-value='updateDynamicData(item.fieldName)'/>
        </div>
        <div v-if='["INT", "FLOAT"].includes(item.dataType!)'>
          <InputNumber
            :id='item.fieldName'
            v-model='dynamicValue[item.fieldName]'
            class='w-full'
            :disabled='action === ACTION.VIEW'
            :input-id='item.fieldName'
            :min-fraction-digits='item.dataType === DataType.INT ? 0 : 2'
            @update:model-value='updateDynamicData(item.fieldName)'/>
        </div>
        <div v-else-if='["DATETIME", "DATE"].includes(item.dataType!)'>
          <Calendar
            :id='item.fieldName'
            v-model='dynamicValue[item.fieldName]'
            class='w-full'
            :disabled='action === ACTION.VIEW'
            :select-other-months='true'
            show-icon
            :show-time='item.dataType === DataType.DATETIME'
            @update:model-value='updateDynamicData(item.fieldName)'/>
        </div>
        <div v-else-if='item.dataType === DataType.CATEGORY'>
          <Dropdown
            :id='item.fieldName'
            v-model='dynamicValue[item.fieldName]'
            class='w-full'
            :disabled='action === ACTION.VIEW'
            filter
            option-label='name'
            option-value='code'
            :options='categories ? categories[item.referenceData ? item.referenceData : ""] : []'
            @update:model-value='updateDynamicData(item.fieldName)'/>
        </div>
        <div v-else-if='item.dataType === DataType.MULTI_SELECT'>
          <div
            v-if='item.referenceData?.length !== 0'
            class='flex gap-4'>
            <MultiSelect
              :id='item.fieldName'
              v-model='dynamicValue[item.fieldName]'
              class='w-full'
              :disabled='action === ACTION.VIEW'
              filter
              option-label='name'
              option-value='code'
              :options='categories ? categories[item.referenceData ? item.referenceData : ""] : []'
              @update:model-value='updateDynamicData(item.fieldName)'/>
          </div>
          <div v-else>
            <MultiSelect
              :id='item.fieldName'
              v-model='dynamicValue[item.fieldName]'
              class='w-full'
              :disabled='action === ACTION.VIEW'
              filter
              :options='item.listValue'
              @update:model-value='updateDynamicData(item.fieldName)'/>
          </div>
        </div>
        <div v-else-if='item.dataType === DataType.CHECK_BOX'>
          <div
            v-if='item.referenceData?.length !== 0'
            class='flex gap-4'>
            <div
              v-for='val in categories ? categories[item.referenceData ? item.referenceData : ""] : []'
              :key='val.code'>
              <Checkbox
                v-model='dynamicValue[item.fieldName]'
                :disabled='action === ACTION.VIEW'
                :input-id='val.code'
                :name='item.fieldName'
                :value='val.code'
                @update:model-value='updateDynamicData(item.fieldName)'/>
              <label
                class='ml-2'
                :for='val.code'> {{ val.name }} </label>
            </div>
            <ValidateErrorMessage
              v-if='v$[item.fieldName]'
              :errors='v$[item.fieldName].$errors'/>
          </div>
          <div v-else>
            <div class='flex gap-4'>
              <div
                v-for='val in item.listValue'
                :key='val'>
                <Checkbox
                  v-model='dynamicValue[item.fieldName]'
                  :disabled='action === ACTION.VIEW'
                  :input-id='val'
                  :name='item.fieldName'
                  :value='val'
                  @update:model-value='updateDynamicData(item.fieldName)'/>
                <label
                  class='ml-2'
                  :for='val'> {{ val }} </label>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if='item.dataType === DataType.RADIO_BOX'>
          <div v-if='item.referenceData?.length !== 0'>
            <div class='flex gap-4'>
              <div
                v-for='val in categories ? categories[item.referenceData ? item.referenceData : ""] : []'
                :key='val.code'>
                <RadioButton
                  v-model='dynamicValue[item.fieldName]'
                  :disabled='action === ACTION.VIEW'
                  :input-id='val.code'
                  :value='val.code'
                  @update:model-value='updateDynamicData(item.fieldName)'/>
                <label
                  class='ml-2'
                  :for='val.code'> {{ val.name }} </label>
              </div>
            </div>
            <ValidateErrorMessage
              v-if='v$[item.fieldName]'
              :errors='v$[item.fieldName].$errors'/>
          </div>
          <div v-else>
            <div class='flex gap-4'>
              <div
                v-for='val in item.listValue'
                :key='val'
                class=''>
                <RadioButton
                  v-model='dynamicValue[item.fieldName]'
                  :disabled='action === ACTION.VIEW'
                  :input-id='val'
                  :value='val'
                  @update:model-value='updateDynamicData(item.fieldName)'/>
                <label
                  class='ml-2'
                  :for='val'> {{ val }} </label>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if='item.dataType === DataType.FILE'>
          <UploadAttachment
            :attachments='dynamicValue[item.fieldName] as Attachment[]'
            :disabled='action === ACTION.VIEW'
            :title='item.name'
            @click='updateFileField(item.fieldName)'
            @update-files='updateAttachments'/>
        </div>
      </div>
      <ValidateErrorMessage
        v-if='v$[item.fieldName]'
        :errors='v$[item.fieldName].$errors'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { groupBy } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllCategoryByListGroupCodePublicGraphql } from '@/apps/admin/api/graphql/category-graphql-api';
import type { CategoryInterface } from '@/apps/admin/model/category';
import type { CategoriesDropInterface } from '@/apps/admin/model/category/CategoryDrop';
import { DataType, Property } from '@/apps/admin/model/object/Property';
import UploadAttachment from '@/common/components/app/upload/UploadAttachment.vue';
import type { Attachment } from '@/common/model';
import { ACTION } from '@/common/model/other-info';

const props = withDefaults(defineProps<DynamicFieldsProps>(), {
  fields: () => [],
  dynamicDataProps: () => ({} as { [key: string]: any }),
  action: '',
  customClass: '',
});
const emits = defineEmits(['update-dynamic-data', 'update-file']);

const { t } = useI18n();

interface DynamicFieldsProps {
  fields: Property[],
  dynamicDataProps: { [key: string]: any },
  action: string,
  customClass: string,
}

const dynamicValue = ref(props.dynamicDataProps);
const categories = ref<{ [key: string]: CategoriesDropInterface[] }>({} as {
  [key: string]: CategoriesDropInterface[]
});
const fileFieldEditing = ref();
const categoryFields = ref<string[]>(props.fields.filter(field => field.dataType === DataType.CATEGORY
    || field.dataType === DataType.MULTI_SELECT
    || field.dataType === DataType.CHECK_BOX
    || field.dataType === DataType.RADIO_BOX).map(item => item.referenceData || ''));

const validateRules = ref<{ [key: string]: object }>({} as { [key: string]: object });
props.fields.filter(f => f.required && f.dataType !== DataType.FILE).map(i => {
  validateRules.value[i.fieldName] = { required: helpers.withMessage(t('common.validate.required', { item: i.name }), required), };
});
const v$ = useVuelidate(validateRules, dynamicValue);

const {
  refetch: getAllCategoryByListGroupCodePublicRefetch,
  onResult: getAllCategoryByListGroupCodePublicOnResult,
  onError: getAllCategoryByListGroupCodePublicOnError
} = getAllCategoryByListGroupCodePublicGraphql(categoryFields.value);
getAllCategoryByListGroupCodePublicOnResult(res => {
  categories.value = groupBy(res.data.getAllCategoryByListGroupCodePublic as CategoryInterface[], 'groupCode');
});

watch(() => props.dynamicDataProps, (newValue) => {
  dynamicValue.value = newValue;
}, { deep: true });

watch(() => props.fields, (newFields) => {
  categoryFields.value = newFields.filter(field => field.dataType === DataType.CATEGORY
      || field.dataType === DataType.MULTI_SELECT
      || field.dataType === DataType.CHECK_BOX
      || field.dataType === DataType.RADIO_BOX).map(item => item.referenceData || '');
  getAllCategoryByListGroupCodePublicRefetch({ groupCode: categoryFields.value });
});

function updateDynamicData(fieldName: string) {
  const type = props.fields.find(i => i.fieldName === fieldName)?.dataType;
  emits('update-dynamic-data', fieldName, dynamicValue.value[fieldName], type);
}

function updateAttachments(attachments: Attachment[], fileUploads: FileList, filesRemove: string[]) {
  if (attachments[0] && !attachments[0].objectId) {
    attachments[0].objectId = fileFieldEditing.value;
  }
  emits('update-file', attachments, fileUploads, filesRemove);
}

function updateFileField(fieldName: string) {
  fileFieldEditing.value = fieldName;
}
</script>

<script lang='ts'>
export default { name: 'DynamicFields' };
</script>

<style scoped>

</style>
