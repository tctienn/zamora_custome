<template>
  <div>
    <h4 class='mb-2'>{{ t('hrm.contract.salary.bonus.title') }}</h4>
    <ul>
      <li
        v-for='(bonus, index) in bonuses'
        :key='index'>
        {{ bonus.type }}: {{ bonus.amount }}
      </li>
    </ul>
  </div>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SalaryBonus } from '@/apps/hrm/model/contract';

defineProps(
  {
    bonuses: {
      type: Array as PropType<SalaryBonus[]>,
      default: () => []
    }
  }
);
const { t } = useI18n();
</script>
