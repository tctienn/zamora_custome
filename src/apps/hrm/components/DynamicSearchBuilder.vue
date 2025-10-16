<template>
  <div class='flex flex-column gap-1'>
    <div
      v-for='field in fields'
      :key='field.key'
      class='border-300 border-bottom-1 flex flex-column gap-2 p-3 pt-1'>
      <div class='align-items-center flex justify-content-between'>
        <label class='font-bold'>{{ field.label }}</label>
        <Button
          class='hover:bg-red-100 p-1 w-2rem'
          icon='pi pi-trash'
          severity='danger'
          text
          @click='removeField(field.key)'/>
      </div>
      <div class='align-items-center flex gap-2'>
        <Dropdown
          v-model='model[field.key].operator'
          class='w-4'
          option-label='label'
          option-value='value'
          :options='getOperators(field.dataType)'/>
        <div
          v-if="field.dataType === 'boolean'"
          class='align-items-center flex gap-2 ml-3'>
          <Checkbox
            v-model='model[field.key].value'
            :binary='true'
            class='dynamic-checkbox'/>
          <label class='font-bold'>Giá trị </label>
        </div>
        <component
          :is='getInputComponent(field.dataType)'
          v-else
          v-model='model[field.key].value'
          class='w-8'
          :input-id='field.dataType'
          v-bind="field.dataType === 'number-date' ? { min: 0, max: 9999, useGrouping: false } : {}"
          :option-label='field.optionsLabel ? field.optionsLabel : undefined'
          :option-value='field.optionsValue ? field.optionsValue : undefined'
          :options='field.options || []'/>
      </div>
      <small
        v-if='errors[field.key]'
        class='text-red-500'>{{ errors[field.key] }}</small>

    </div>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { RoleType } from '@/apps/document/model/permission';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { RecruitmentForm } from '@/apps/hrm/model/employee';

type Field = {
  key: string;
  label: string;
  dataType: string;
  options?: any[];
  [key: string]: any;
};

const props = defineProps({
  fields: {
    type: Array as PropType<Field[]>,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(['update:modelValue', 'removeField']);
const { t } = useI18n();
const errors = reactive<Record<string, string>>({});

const model = reactive<Record<string, {
  operator: string;
  value: any,
  optionsLabel?: string,
  optionsValue?: string
}>>({});

const ethnicities = ref([]);
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const nationalities = ref([]);
const religions = ref([]);
const allHobbies = ref<string[]>([]);
const culturalLevels = ref([]);
const educationLevels = ref([]);
const stateManagements = ref([]);
const specializedJobs = ref([]);
const politicalTheories = ref([]);
const trainingForms = ref([]);
const foreignLanguageLevels = ref([]);
const itLevels = ref([]);
const majors = ref([]);
const recruitmentFormOptions = ref<{ label: any; value: string; }[]>([]);
const jobPositions = ref([]);
const contractTypes = ref([]);
const genderOption = ref([
  {
    label: 'Nam',
    value: 'MALE'
  },
  {
    label: 'Nữ',
    value: 'FEMALE'
  },
  {
    label: 'Khác',
    value: 'OTHER'
  },
]);

const signatoryData = computed(() =>
  allUsers.value
    .filter(user => user.roles?.includes(RoleType.LANH_DAO))
    .map(user => ({
      name: user.fullName,
      id: user.id,
    }))
);

// Hàm khởi tạo model từng field, chỉ cập nhật khi khác giá trị
const initializeModel = () => {
  props.fields.forEach((field) => {
    const defaultOperator = getOperators(field.dataType)?.[0]?.value ?? '';
    const existing = props.modelValue?.[field.key] || model[field.key];

    if (!model[field.key]) {
      model[field.key] = {
        operator: existing?.operator || defaultOperator,
        value: existing?.value ?? '',
      };
    }

    const newValue = (() => {
      if (field.dataType === 'boolean') {
        return existing?.value ?? false;
      }
      if (field.dataType === 'multiselect') {
        return existing?.value || [];
      }
      if (field.dataType === 'date') {
        return existing?.value || null;
      }
      return existing?.value || '';
    })();

    if (JSON.stringify(model[field.key].value) !== JSON.stringify(newValue)) {
      model[field.key].value = newValue;
    }

    if (JSON.stringify(model[field.key].operator) !== JSON.stringify(existing?.operator || defaultOperator)) {
      model[field.key].operator = existing?.operator || defaultOperator;
    }

    // Gán options riêng nếu cần
    if (field.key === 'profile.ethnicity') {
      field.options = ethnicities.value;
    }
    if (field.key === 'profile.religion') {
      field.options = religions.value;
    }
    if (field.key === 'contract.signer') {
      field.options = signatoryData.value;
      field.optionsLabel = 'name';
      field.optionsValue = 'id';
    }
    if (field.key === 'profile.gender') {
      field.options = genderOption.value;
      field.optionsLabel = 'label';
      field.optionsValue = 'value';
    }
    if (field.key === 'profile.recruitmentForm') {
      field.options = recruitmentFormOptions.value;
      field.optionsLabel = 'label';
      field.optionsValue = 'value';
    }
    if (field.key === 'profile.foreignLanguageLevel') {
      field.options = foreignLanguageLevels.value;
    }
    if (field.key === 'profile.informationTechnologyLevel') {
      field.options = itLevels.value;
    }
    if (field.key === 'profile.highestLevel') {
      field.options = educationLevels.value;
    }
    if (field.key === 'profile.professionalLevel') {
      field.options = specializedJobs.value;
    }
    if (field.key === 'profile.trainingType') {
      field.options = trainingForms.value;
    }
    if (field.key === 'profile.major') {
      field.options = majors.value;
    }
    if (field.key === 'profile.nationality') {
      field.options = nationalities.value;
    }
    if (field.key === 'profile.currentPosition') {
      field.options = jobPositions.value;
    }
    if (field.key === 'contract.contractType') {
      field.options = contractTypes.value;
    }

  });
};

// Watch để khởi tạo lại mỗi khi fields/modelValue thay đổi
watch(() => props.fields, initializeModel, {
  immediate: true,
  deep: true
});
watch(() => props.modelValue, initializeModel, {
  immediate: true,
  deep: true
});

// Watch để đẩy dữ liệu ra ngoài khi model thay đổi, tránh vòng lặp vô hạn
watch(model, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', JSON.parse(JSON.stringify(val)));
  }
}, { deep: true });

// Nút xóa field
const removeField = (key: string) => {
  delete model[key];
  emit('update:modelValue', { ...model });
  emit('removeField', model, key);
};

// Fetch danh mục
onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.ETHNICITY, ethnicities);
  fetchCategoryMappingName(CATEGORY_TYPE.NATIONALITY, nationalities);
  fetchCategoryMappingName(CATEGORY_TYPE.RELIGION, religions);
  fetchCategoryMappingName(CATEGORY_TYPE.FORTE, allHobbies);
  fetchCategoryMappingName(CATEGORY_TYPE.CULTURAL_LEVEL, culturalLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.EDUCATION_LEVEL, educationLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.STATE_MANAGEMENT, stateManagements);
  fetchCategoryMappingName(CATEGORY_TYPE.SPECIALIZED_JOB, specializedJobs);
  fetchCategoryMappingName(CATEGORY_TYPE.POLITICAL_THEORY, politicalTheories);
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_FORM, trainingForms);
  fetchCategoryMappingName(CATEGORY_TYPE.FOREIGN_LANGUAGE_LEVEL, foreignLanguageLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.IT_LEVEL, itLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.MAJOR, majors);
  fetchCategoryMappingName(CATEGORY_TYPE.CONTRACT_TYPE, contractTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.JOB_POSITION, jobPositions);
  // recruitmentFormOptions.value = Object.keys(RecruitmentForm).map((key) => ({
  //   label: t('hrm.profile.general.recruitmentForm.' + camelCase(key)),
  //   value: key
  // }));

  recruitmentFormOptions.value = Object.entries(RecruitmentForm).map(([key, value]) => ({
    label: value,
    value: value
  }));
});

// Operators theo kiểu
const getOperators = (type: string) => {
  switch (type) {
  case 'string':
    return [
      {
        label: 'Chứa',
        value: 'CONTAINS'
      },
      {
        label: 'Không chứa',
        value: 'NOT_IN'
      },
      {
        label: 'Bằng',
        value: 'EQUALS'
      },
      {
        label: 'Không bằng',
        value: 'NOT_EQUALS'
      },
    ];
  case 'number':
  case 'number-date':
    return [
      {
        label: 'Bằng',
        value: 'EQUALS_NUMBER'
      },
      {
        label: 'Không bằng',
        value: 'NOT_EQUALS_NUMBER'
      },
      {
        label: 'Lớn hơn',
        value: 'AFTER'
      },
      {
        label: 'Nhỏ hơn',
        value: 'BEFORE'
      },
    ];
  case 'date':
    return [
      {
        label: 'Là ngày/tháng/năm',
        value: 'EQUALS'
      },
      {
        label: 'Trước ngày',
        value: 'BEFORE'
      },
      {
        label: 'Sau ngày',
        value: 'BEFORE'
      },
    ];
  case 'boolean':
    return [
      {
        label: 'Là',
        value: 'EQUALS'
      },
      {
        label: 'Không là',
        value: 'NOT_EQUALS'
      },
    ];
  case 'multiselect':
  case 'dropdown':
    return [
      {
        label: 'Bao gồm ít nhất một',
        value: 'IN'
      },
      {
        label: 'Không chứa bất kỳ',
        value: 'NOT_IN'
      },
    ];
  default:
    return [];
  }
};

function validateField(field: Field): boolean {
  const {
    key,
    dataType
  } = field;
  const value = model[key]?.value;

  switch (dataType) {
  case 'string':
    if (!value || typeof value !== 'string' || !value.trim()) {
      errors[key] = 'Vui lòng nhập giá trị tìm kiếm';
      return false;
    }
    break;
  case 'number':
    if (value === null || value === undefined || isNaN(value)) {
      errors[key] = 'Vui lòng nhập số hợp lệ';
      return false;
    }
    break;
  case 'number-date':
    if (value === null || value === undefined || isNaN(value) || value < 0 || value > 9999) {
      errors[key] = 'Vui lòng nhập số hợp lệ';
      return false;
    }
    break;
  case 'date':
    if (!value) {
      errors[key] = 'Vui lòng chọn ngày';
      return false;
    }
    break;
  case 'boolean':
    // boolean có thể true/false, không cần validate nghiêm ngặt
    break;
  case 'multiselect':
    if (!Array.isArray(value) || value.length === 0) {
      errors[key] = 'Vui lòng chọn ít nhất một giá trị';
      return false;
    }
    break;
  default:
    break;
  }

  delete errors[key]; // Nếu hợp lệ thì xoá lỗi
  return true;
}

function validateAllFields(): boolean {
  let valid = true;
  props.fields.forEach(field => {
    const result = validateField(field);
    if (!result) {
      valid = false;
    }
  });
  return valid;
}

// Component input theo kiểu
const getInputComponent = (type: string) => {
  switch (type) {
  case 'string':
    return 'InputText';
  case 'number':
  case 'number-date':
    return 'InputNumber';
  case 'date':
    return 'Calendar';
  case 'boolean':
    return 'Checkbox';
  case 'multiselect':
    return 'MultiSelect';
  case 'dropdown':
    return 'Dropdown';
  default:
    return 'InputText';
  }
};

defineExpose({ validateAllFields, });
</script>

<style lang='scss' scoped>
.dynamic-checkbox {
  width: 2rem;
  height: 2rem;
}

:deep( .p-checkbox .p-checkbox-box) {
  border-width: 1px;
  border-radius: 4px;
  width: 25px;
  height: 25px;
}
</style>