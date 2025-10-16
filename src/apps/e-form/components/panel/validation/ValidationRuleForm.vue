<template>
  <div v-if='ruleTypes && ruleTypes.length > 0'>
    <div
      v-for='(rule, index) in modelReactive'
      :key='index'
      class='field flex flex-column gap-1'>
      <div class='align-items-center flex justify-content-between'>
        <div class='align-items-center flex gap-2'>
          <label>Loại:</label>
          <Dropdown
            v-model='rule.type'
            :options='ruleTypes'
            @update:model-value='onChangeRuleType($event, index)'/>
        </div>

        <i
          class='cursor-pointer pi pi-trash text-red-500'
          title='Xóa rule'
          @click='removeRule(index)'/>
      </div>

      <template v-if="rule.type !== 'required'">
        <Dropdown
          v-if='rule.type === "sameAs"'
          v-model='rule.value'
          :option-label='(data:ElementConfig)=>`${data.config.name} (${data.config.label} - ${data.type})`'
          option-value='config.name'
          :options='validElements'
          :placeholder='getPlaceholder(rule.type)'/>
        <AutoComplete
          v-else-if='rule.type === "regex"'
          v-model='rule.value'
          input-class='w-full'
          :option-label='getRegexLabel'
          :placeholder='getPlaceholder(rule.type)'
          :suggestions='filterRegex'
          @complete='searchRegex'
          @item-select='onSelectSuggestion($event.value, index)'/>
        <InputNumber
          v-else-if='numberTypes.includes(rule.type)'
          v-model='rule.value'
          class='w-full'
          :placeholder='getPlaceholder(rule.type)'/>
        <Calendar
          v-else-if='dateTypes.includes(rule.type)'
          class='w-full'
          :model-value='getDateValue(index)'
          :placeholder='getPlaceholder(rule.type)'
          @update:model-value='setDateValue($event, index)'/>
        <InputText
          v-else
          v-model='rule.value'
          class='w-full'
          :placeholder='getPlaceholder(rule.type)'/>
      </template>

      <InputText
        v-model='rule.errorMessage'
        class='w-full'
        placeholder='Thông báo lỗi'/>

    </div>
    <Button
      icon='pi pi-plus'
      label='Thêm validate'
      size='small'
      @click='addRule'></Button>
  </div>
</template>

<script lang='ts' setup>
import { lowerCase } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { computed, inject, type PropType, reactive, ref, watch } from 'vue';

import { type ElementConfig, type ValidationRule, type ValidationRuleType } from '@/apps/e-form/model/form-config';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  modelValue: {
    type: Array as PropType<ValidationRule[]>,
    default: () => [],
  },
  ruleTypes: {
    type: Array as PropType<string[]>,
    default: undefined,
  }
});
const emits = defineEmits<{
  (e: 'update:modelValue', value: ValidationRule[]): void
}>();
const modelReactive = reactive<ValidationRule[]>(props.modelValue);
const { moment } = useMoment();

watch(() => props.modelValue, (value) => {
  Object.assign(modelReactive, value);
}, { deep: true });
watch(modelReactive, () => {
  emits('update:modelValue', modelReactive);
}, { deep: true });
const numberTypes = ['minLength', 'maxLength', 'min', 'max'];
const dateTypes = ['before', 'after'];
const elements = inject('elements', ref<ElementConfig[]>([]));
const validElements = computed(() => elements.value.filter(e => e.config.name));

type RegexSuggestion = {
  label: string;
  value: string;
  errorMessage: string;
}
const regexSuggestions: RegexSuggestion[] = [
  {
    label: 'Email',
    value: '^[-\\w.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    errorMessage: 'Email không hợp lệ'
  },
  {
    label: 'Chỉ chữ cái',
    value: '^[A-Za-zÀ-ỹ\\s]+$',
    errorMessage: 'Chỉ được nhập chữ cái'
  },
  {
    label: 'Chỉ số',
    value: '^\\d+$',
    errorMessage: 'Chỉ được nhập số'
  },
  {
    label: 'Chữ và số',
    value: '^[A-Za-z0-9]+$',
    errorMessage: 'Chỉ được nhập chữ và số'
  },
  {
    label: 'Số điện thoại Việt Nam',
    value: '^(\\+84|0)[35789]\\d{8}$',
    errorMessage: 'Số điện thoại không hợp lệ'
  },
  {
    label: 'URL',
    value: '^(https?:\\/\\/)?([\\w\\d-]+\\.)+[\\w]{2,}(\\/[^\\s]*)?$',
    errorMessage: 'URL không hợp lệ'
  }
];

const filterRegex = ref<RegexSuggestion[]>(regexSuggestions);

function getRegexLabel(data: RegexSuggestion) {
  return `${data.label}: ${data.value}`;
}

function searchRegex(event: AutoCompleteCompleteEvent) {
  const key = event.query || '';
  filterRegex.value = regexSuggestions.filter(rex => rex.label.toLowerCase().includes(lowerCase(key)));
}

function onSelectSuggestion(suggestion: RegexSuggestion, index: number) {
  const currentRule = modelReactive[index];
  currentRule.value = suggestion.value;
  currentRule.errorMessage = suggestion.errorMessage;
}

function addRule() {
  modelReactive.push({
    type: 'required',
    errorMessage: ''
  });
}

function removeRule(index: number) {
  modelReactive.splice(index, 1);
}

function onChangeRuleType(type: ValidationRuleType, index: number) {
  const currentRule = modelReactive[index];
  if (numberTypes.includes(type) && typeof currentRule.value !== 'number'
    || !numberTypes.includes(type) && typeof currentRule.value === 'number'
    || type === 'sameAs') {
    currentRule.value = undefined;
  }
}

function getDateValue(index: number) {
  const currentRule = modelReactive[index];
  if (currentRule.value) {
    return moment(currentRule.value).toDate();
  }
  return undefined;
}

function setDateValue(value: Date | Array<Date> | Array<Date | null> | undefined | null, index: number) {
  const currentRule = modelReactive[index];
  if (value) {
    if (Array.isArray(value)) {
      currentRule.value = value;
    } else {
      currentRule.value = moment(value).format(DateTimeFormat.ISO_LOCAL_DATE_TIME);
    }
  } else {
    currentRule.value = undefined;
  }
}

function getPlaceholder(type: string) {
  switch (type) {
  case 'minLength':
  case 'maxLength':
    return 'Số ký tự';
  case 'min':
  case 'max':
    return 'Giá trị số';
  case 'regex':
    return 'Regex pattern';
  case 'sameAs':
    return 'Tên trường cần giống';
  case 'before':
  case 'after':
    return 'Ngày (dd/mm/yyyy)';
  default:
    return '';
  }
}
</script>

<style scoped>
</style>