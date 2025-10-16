<template>
  <Dialog
    v-model:visible='visible'
    class='fix-h-dialog w-8'
    header='Tìm kiếm nâng cao'
    modal
    @hide='setAdvancedSearch(false)'>
    <AdvancedSearch
      ref='advancedSearchRef'
      :nodes='nodeData'/>

    <template #footer>
      <Button
        class='border-round-sm'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click='setAdvancedSearch(false)'/>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        :label="t('common.confirm')"
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, inject, type PropType, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { useSearchAdvancedEmployee } from '@/apps/hrm/api/graphql/employee';
import AdvancedSearch from '@/apps/hrm/components/AdvanceSearch.vue';
import { getAdvancedSearchTree } from '@/apps/hrm/constants/advanceSearch';
import type { EmployeeFilterSuperAdvanceInput } from '@/apps/hrm/model/employee';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  pageable: {
    type: Object as PropType<Pageable>,
    default: () => ({
      page: 0,
      size: 10,
      sort: []
    })
  }
});

const emit = defineEmits(['submit-advanced-search']);
const { setAdvancedSearch, setIsUsingAdvancedSearch } = useGlobalSearchStore();
const { isUsingAdvancedSearch } = storeToRefs(useGlobalSearchStore());
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});

// Inject organization control functions
const setOrganizationId = inject('setOrganizationId') as (id: string) => void;

const { t } = useI18n();
const pageAble = ref<Pageable>({
  page: 0,
  size: 10,
  sort: []
});

const nodeData = computed(() => getAdvancedSearchTree(t));

watchEffect(() => {
  pageAble.value = props.pageable;
});

const advancedSearchRef = ref();
const advancedSearchData = ref<EmployeeFilterSuperAdvanceInput>({});
const {
  load: loadSearch,
  result,
  loading,
} = useSearchAdvancedEmployee();

const { moment } = useMoment();

const convertDateFieldsToFormat = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const convertedData = { ...data };
  
  // List of date field keys that need to be converted
  const dateFields = [
    'dateOfBirth',
    'startDate', 
    'issueDate',
    'signedDate',
    'effectiveFromDate',
    'effectiveToDate',
    'joinedFrom'
  ];
  
  // Convert date fields recursively
  const convertObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => convertObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (dateFields.includes(key) && value && typeof value === 'object' && 'value' in value && value.value) {
          // This is a date field with nested structure { operator: '...', value: 'date' }
          result[key] = {
            ...value,
            value: moment(value.value).format('YYYY-MM-DD')
          };
        } else if (typeof value === 'object') {
          result[key] = convertObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
    
    return obj;
  };
  
  return convertObject(convertedData);
};

function submit() {
  const isValid = advancedSearchRef.value?.$refs?.builderRef?.validateAllFields?.();
  if (!isValid) {
    return;
  }

  // Clear organization selection when submitting advanced search
  if (setOrganizationId) {
    setOrganizationId('');
  }

  const searchData = advancedSearchRef.value?.getFormData?.();
  setIsUsingAdvancedSearch(true);
  if (searchData) {
    // Convert date fields to YYYY-MM-DD format before sending to API
    const convertedSearchData = convertDateFieldsToFormat(searchData);
    console.log('Converted searchData:', convertedSearchData);
    advancedSearchData.value = convertedSearchData as EmployeeFilterSuperAdvanceInput;
    loadSearch(undefined, {
      filter: convertedSearchData,
      pageable: pageAble.value
    });
  }
  advancedSearchRef.value?.persistState?.();
  setAdvancedSearch(false);
}

watch(result, (res) => {
  if (res && isUsingAdvancedSearch.value) {
    const data = res.searchSuperAdvanceEmployee;
    if (data) {
      const count = data.totalCount;
      emit('submit-advanced-search', data, loading.value, count);
    }
  }
});

</script>

<style scoped>
:deep(.p-dialog.p-component .p-dialog-content) {
  height: 80dvh;
}

:deep(.p-dialog.p-component .p-dialog-header) {
  padding: 10px 12px;
}
</style>
