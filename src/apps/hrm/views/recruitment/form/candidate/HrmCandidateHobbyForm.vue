<template>
  <div class='formgrid grid'>
    <div class='col-12'><p class='font-bold'>{{ t('hrm.candidate.hobby.title')}}</p></div>
    <FormInputDropdown
      v-model='candidateValue.hobbyCode'
      class='col-12'
      is-multi-select
      :label="t('')"
      name='hobbyCode'
      option-label='value'
      option-value='id'
      :options='hoppys'/>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { Candidate } from '@/apps/hrm/model/candidate';
const { t } = useI18n();

const hoppys = ref([]);
const candidateValue = defineModel('candidate', {
  type: Object as PropType<Candidate>,
  default: {} as Candidate, 
});

onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.FORTE, hoppys, {
    labelProp: 'name',
    idProp: 'code'
  });
});
</script>