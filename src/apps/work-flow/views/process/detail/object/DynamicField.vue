<template>
  <div
    class='flex gap-2'>
    <label class='font-semibold white-space-nowrap'>{{ getTranslateField(field) }}:</label>
    <div class='word-break-break-word'>{{ getValue(field, value) }}</div>
  </div>
</template>

<script setup lang='ts'>

import { camelCase } from 'lodash';
import { useI18n } from 'vue-i18n';

import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  field: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Object, Array],
    required: true
  }
});

const {
  t,
  messages,
  locale
} = useI18n();
const { moment } = useMoment();

function getTranslateField(field: string): string {
  const key = findFirstKey(field, messages.value[locale.value]);
  return key ? t(key) : field;
}

function getValue(field: string, value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.map(v => getValue(field, v)).join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? t('common.yes') : t('common.no');
  }
  if (field.toLowerCase().includes('time')) {
    return moment(value).format('HH:mm:ss DD/MM/YYYY');
  }
  if (field.toLowerCase().includes('date')) {
    return moment(value).format('DD/MM/YYYY');
  }
  if (field === 'status') {
    return t(`work-flow.status.${ camelCase(value) }`);
  }
  return value.toString();
}

function findFirstKey(suffix: string, messages: any, prefix = '') {
  for (const key in messages) {
    const value = messages[key];
    const fullKey = prefix ? `${ prefix }.${ key }` : key;

    if (key === suffix && typeof value !== 'object') {
      return fullKey;
    }

    if (typeof messages[key] === 'object') {
      const found: any = findFirstKey(suffix, value, fullKey);
      if (found) {
        return found;
      }
    }
  }

  return null;
}
</script>

<style scoped>

</style>