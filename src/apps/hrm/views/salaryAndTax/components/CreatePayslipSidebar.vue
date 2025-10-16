<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {width: "70vw"}}'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-4'
      }
    }"
    :show-close-icon='false'
    @hide='onVisibleChange(false)'>
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click='onCancel'/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ props.isEditing && props.payslipData ? t('hrm.salary.salaryAndTax.editPayslip') : t('hrm.salary.salaryAndTax.createSalaryTable') }}
            </div>
          </div>
          <div class='flex gap-1'>
            <Button
              class='border-round-sm'
              :disabled='!isFormValid'
              icon='pi pi-save'
              :label="t('common.save')"
              @click='onSave'/>
          </div>
        </div>
      </div>
    </template>

    <div class='border-round-sm flex flex-column gap-3'>
      <div class='grid grid-cols-12 mx-0 p-0'>
        <!-- Salary Table Name - Full width -->
        <div class='col-12'>
          <div class='field'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.salaryTableName') }} <span
              class='text-red-500'>*</span></label>
            <InputText
              v-model='localSalaryForm.name'
              class='w-full'
              :class="{ 'p-invalid': errors.name }"
              :placeholder="t('hrm.salary.salaryAndTax.enterSalaryTableName')"/>
            <small
              v-if='errors.name'
              class='p-error'>{{ errors.name }}</small>
          </div>
        </div>

        <!-- Application Period - Two columns -->
        <div class='col-6 flex flex-col gap-2'>
          <div class='field w-6'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.applicationPeriod') }} <span
              class='text-red-500'>*</span></label>
            <Dropdown
              v-model='localSalaryForm.month'
              class='w-full'
              :class="{ 'p-invalid': errors.month }"
              option-label='label'
              option-value='value'
              :options='months'
              :placeholder="t('common.month')"/>
            <small
              v-if='errors.month'
              class='p-error'>{{ t('common.validate.required', {item: t('common.month')}) }}</small>
          </div>
          <div class='field w-6'>
            <label class='block font-normal mb-2'>&nbsp;</label>
            <Dropdown
              v-model='localSalaryForm.year'
              class='w-full'
              :class="{ 'p-invalid': errors.year }"
              :options='years'
              :placeholder="t('common.year')"/>
            <small
              v-if='errors.year'
              class='p-error'>{{ t('common.validate.required', {item: t('common.year')}) }}</small>
          </div>
        </div>

        <!-- Location - Half width -->
        <div class='col-6'>
          <div class='field'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.location') }}</label>
            <Dropdown
              v-model='localSalaryForm.location'
              class='w-full'
              editable
              option-label='label'
              option-value='value'
              :options='locationOptions'
              :placeholder="t('hrm.salary.salaryAndTax.location')"/>
          </div>
        </div>

        <!-- Creation Date - Half width -->
        <div class='col-6'>
          <div class='field'>
            <FormInputCalendar
              v-model='localSalaryForm.createdDate'
              class='w-full'
              date-format='DD/MM/YYYY'
              disabled
              :label="t('hrm.salary.salaryAndTax.creationDate')"
              name='creationDate'
              :placeholder="t('hrm.salary.salaryAndTax.selectCreationDate')"/>
          </div>
        </div>

        <!-- Creator - Half width -->
        <div class='col-6'>
          <div class='field'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.creator') }}</label>
            <InputText
              v-model='localSalaryForm.createdBy'
              class='w-full'
              :placeholder="t('hrm.salary.salaryAndTax.enterCreator')"
              readonly/>
          </div>
        </div>

        <!-- Organization Unit (DV) - Half width -->
        <div class='col-6'>
          <div class='field'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.organizationUnit') }}</label>
            <Dropdown
              v-model='selectedDvOrganizationId'
              class='w-full'
              option-label='name'
              option-value='code'
              :options='dvOrganizations'
              :placeholder="t('hrm.salary.salaryAndTax.selectOrganizationUnit')"/>
          </div>
        </div>

        <!-- Departments - Half width -->
        <div
          class='col-12'
          style='max-height: 25rem;'>
          <div class='field flex flex-column h-full'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.departments1') }}</label>
            <div class='border-1 border-round flex-1 overflow-y-auto p-3 surface-border'>
              <div
                v-for='(dept, index) in filteredDepartments'
                :key='dept.id + index'
                class='align-items-center flex mb-2'>
                <Checkbox
                  v-model='localSalaryForm.organizationIds'
                  class='mr-2'
                  :input-id='`dept_${dept.id}`'
                  :value='dept.id'/>
                <label
                  class='mb-0 text-wrap'
                  :for='`dept_${dept.id}`'>{{ dept.name }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Template - Full width -->
        <div class='col-12'>
          <div class='field flex flex-column'>
            <label class='block font-normal mb-2'>{{ t('hrm.salary.salaryAndTax.templates') }}</label>
            <div class='border-1 border-round flex-1 overflow-y-auto p-3 surface-border'>
              <div 
                v-for='(templatesByType, type) in groupedActiveTemplates' 
                :key='type'
                class='mb-3'>
                <h4 class='mb-2'>{{ getTemplateTypeName(type) }}</h4>
                <div 
                  v-for='template in templatesByType'
                  :key='template.id'
                  class='align-items-center flex mb-2'>
                  <Checkbox
                    binary
                    class='mr-2'
                    :input-id='`template_${template.id}_${type}`'
                    :model-value='getSelectedTemplateByType(type) === template.id'
                    @update:model-value='(checked: boolean) => handleTemplateCheckboxChange(type, template.id, checked)'/>
                  <label
                    class='mb-0'
                    :for='`template_${template.id}_${type}`'>{{ template.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
// Vue & PrimeVue imports
import { cloneDeep, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

// API imports
import {
  findByUsersIdGraphql,
  getAllOrganizationPublicGraphql
} from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllSalaryTemplates } from '@/apps/hrm/api/graphql/salary';
// Component imports
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
// Constants and utilities
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

// Interfaces
interface Department {
  id: string;
  name: string;
  type: string;
  code?: string;
  parentCode?: string;
  accountId: string;
}

interface Template {
  id: string;
  name: string;
  status: string;
  type: string;
}

interface LocationOption {
  label: string;
  value: string;
}

interface TemplatePayload {
  type: string;
  templateId: string;
}

interface SalaryForm {
  id?: string;
  name: string;
  month: number | null;
  year: number | null;
  location: string | null;
  createdDate: string | Date | null;
  createdBy: string;
  creatorId?: string;
  organizationIds: string[];
  templates: TemplatePayload[];
  status?: string | null;
}

interface Props {
  visible: boolean;
  payslipData?: any; // Data for editing individual payslip
  isEditing?: boolean; // Flag to indicate if we're editing an existing payslip
}

interface Emits {
  (e: 'update:visible', value: boolean): void;

  (e: 'save', salary: SalaryForm): void;

  (e: 'cancel'): void;
}

// Component setup
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();
const userStore = useUserStore();
const userMoreInfoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(userMoreInfoStore);
const { moment } = useMoment();
// Reactive variables
const visibleSidebar = ref(false);
const organizations = ref<any[]>([]);
const templates = ref<Template[]>([]);
const dvOrganization = ref<any>(null);
const selectedDvOrganizationId = ref<string | null>(null);
const errors = ref<Record<string, string | undefined>>({});

// Store initial values from API for editing mode
const initialOrganizationIds = ref<string[]>([]);
const initialSelectedDvOrganizationId = ref<string | null>(null);

// Form data  
const localSalaryForm = ref<SalaryForm>({
  name: '',
  month: new Date().getMonth() + 1, // JavaScript months are 0-indexed
  year: new Date().getFullYear(),
  location: null,
  createdDate: moment().format('DD/MM/YYYY'),
  createdBy: userStore.user?.id ? userMoreInfoStore.usersMoreInfo[userStore.user.id]?.fullName || userStore.user?.fullName || userStore.user?.username || '' : '',
  creatorId: userStore.user?.id || '',
  organizationIds: [],
  templates: [],
  status: 'DRAFT'
});

// Basic computed constants
const months = computed(() => [
  {
    label: t('common.months.january'),
    value: 1 
  },
  {
    label: t('common.months.february'),
    value: 2 
  },
  {
    label: t('common.months.march'),
    value: 3 
  },
  {
    label: t('common.months.april'),
    value: 4 
  },
  {
    label: t('common.months.may'),
    value: 5 
  },
  {
    label: t('common.months.june'),
    value: 6 
  },
  {
    label: t('common.months.july'),
    value: 7 
  },
  {
    label: t('common.months.august'),
    value: 8 
  },
  {
    label: t('common.months.september'),
    value: 9 
  },
  {
    label: t('common.months.october'),
    value: 10 
  },
  {
    label: t('common.months.november'),
    value: 11 
  },
  {
    label: t('common.months.december'),
    value: 12 
  }
]);

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }
  return years;
});

const salaryTypes = computed(() => [
  {
    label: t('hrm.salary.salaryAndTax.salaryType.calculation'),
    value: 'SALARY_CALCULATION'
  },
  {
    label: t('hrm.salary.salaryAndTax.salaryType.payment'),
    value: 'SALARY_PAYMENT'
  },
  {
    label: t('hrm.salary.salaryAndTax.salaryType.bill'),
    value: 'MONTHLY_SALARY'
  }
]);

const statusOptions = computed(() => [
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.DRAFT'),
    value: 'DRAFT'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.PENDING_REVIEW'),
    value: 'PENDING_REVIEW'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.REVIEWED'),
    value: 'REVIEWED'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.PENDING_APPROVAL'),
    value: 'PENDING_APPROVAL'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.APPROVED'),
    value: 'APPROVED'
  },
  {
    label: t('hrm.salary.salaryAndTax.statusOptions.REJECTED'),
    value: 'REJECTED'
  }
]);

// Location options - Major cities in Vietnam
const locationOptions = computed<LocationOption[]>(() => [
  {
    label: 'Hà Nội',
    value: 'Hà Nội' 
  },
  {
    label: 'Hồ Chí Minh',
    value: 'Hồ Chí Minh' 
  },
  {
    label: 'Đà Nẵng',
    value: 'Đà Nẵng' 
  },
  {
    label: 'Hải Phòng',
    value: 'Hải Phòng' 
  },
  {
    label: 'Cần Thơ',
    value: 'Cần Thơ' 
  },
  {
    label: 'An Giang',
    value: 'An Giang' 
  },
  {
    label: 'Bà Rịa - Vũng Tàu',
    value: 'Bà Rịa - Vũng Tàu' 
  },
  {
    label: 'Bắc Giang',
    value: 'Bắc Giang' 
  },
  {
    label: 'Bắc Kạn',
    value: 'Bắc Kạn' 
  },
  {
    label: 'Bạc Liêu',
    value: 'Bạc Liêu' 
  },
  {
    label: 'Bắc Ninh',
    value: 'Bắc Ninh' 
  },
  {
    label: 'Bến Tre',
    value: 'Bến Tre' 
  },
  {
    label: 'Bình Định',
    value: 'Bình Định' 
  },
  {
    label: 'Bình Dương',
    value: 'Bình Dương' 
  },
  {
    label: 'Bình Phước',
    value: 'Bình Phước' 
  },
  {
    label: 'Bình Thuận',
    value: 'Bình Thuận' 
  },
  {
    label: 'Cà Mau',
    value: 'Cà Mau' 
  },
  {
    label: 'Cao Bằng',
    value: 'Cao Bằng' 
  },
  {
    label: 'Đắk Lắk',
    value: 'Đắk Lắk' 
  },
  {
    label: 'Đắk Nông',
    value: 'Đắk Nông' 
  },
  {
    label: 'Điện Biên',
    value: 'Điện Biên' 
  },
  {
    label: 'Đồng Nai',
    value: 'Đồng Nai' 
  },
  {
    label: 'Đồng Tháp',
    value: 'Đồng Tháp' 
  },
  {
    label: 'Gia Lai',
    value: 'Gia Lai' 
  },
  {
    label: 'Hà Giang',
    value: 'Hà Giang' 
  },
  {
    label: 'Hà Nam',
    value: 'Hà Nam' 
  },
  {
    label: 'Hà Tĩnh',
    value: 'Hà Tĩnh' 
  },
  {
    label: 'Hải Dương',
    value: 'Hải Dương' 
  },
  {
    label: 'Hậu Giang',
    value: 'Hậu Giang' 
  },
  {
    label: 'Hòa Bình',
    value: 'Hòa Bình' 
  },
  {
    label: 'Hưng Yên',
    value: 'Hưng Yên' 
  },
  {
    label: 'Khánh Hòa',
    value: 'Khánh Hòa' 
  },
  {
    label: 'Kiên Giang',
    value: 'Kiên Giang' 
  },
  {
    label: 'Kon Tum',
    value: 'Kon Tum' 
  },
  {
    label: 'Lai Châu',
    value: 'Lai Châu' 
  },
  {
    label: 'Lâm Đồng',
    value: 'Lâm Đồng' 
  },
  {
    label: 'Lạng Sơn',
    value: 'Lạng Sơn' 
  },
  {
    label: 'Lào Cai',
    value: 'Lào Cai' 
  },
  {
    label: 'Long An',
    value: 'Long An' 
  },
  {
    label: 'Nam Định',
    value: 'Nam Định' 
  },
  {
    label: 'Nghệ An',
    value: 'Nghệ An' 
  },
  {
    label: 'Ninh Bình',
    value: 'Ninh Bình' 
  },
  {
    label: 'Ninh Thuận',
    value: 'Ninh Thuận' 
  },
  {
    label: 'Phú Thọ',
    value: 'Phú Thọ' 
  },
  {
    label: 'Phú Yên',
    value: 'Phú Yên' 
  },
  {
    label: 'Quảng Bình',
    value: 'Quảng Bình' 
  },
  {
    label: 'Quảng Nam',
    value: 'Quảng Nam' 
  },
  {
    label: 'Quảng Ngãi',
    value: 'Quảng Ngãi' 
  },
  {
    label: 'Quảng Ninh',
    value: 'Quảng Ninh' 
  },
  {
    label: 'Quảng Trị',
    value: 'Quảng Trị' 
  },
  {
    label: 'Sóc Trăng',
    value: 'Sóc Trăng' 
  },
  {
    label: 'Sơn La',
    value: 'Sơn La' 
  },
  {
    label: 'Tây Ninh',
    value: 'Tây Ninh' 
  },
  {
    label: 'Thái Bình',
    value: 'Thái Bình' 
  },
  {
    label: 'Thái Nguyên',
    value: 'Thái Nguyên' 
  },
  {
    label: 'Thanh Hóa',
    value: 'Thanh Hóa' 
  },
  {
    label: 'Thừa Thiên Huế',
    value: 'Thừa Thiên Huế' 
  },
  {
    label: 'Tiền Giang',
    value: 'Tiền Giang' 
  },
  {
    label: 'Trà Vinh',
    value: 'Trà Vinh' 
  },
  {
    label: 'Tuyên Quang',
    value: 'Tuyên Quang' 
  },
  {
    label: 'Vĩnh Long',
    value: 'Vĩnh Long' 
  },
  {
    label: 'Vĩnh Phúc',
    value: 'Vĩnh Phúc' 
  },
  {
    label: 'Yên Bái',
    value: 'Yên Bái' 
  }
]);

// Organization-related computed properties
const { result: organizationResult, loading: orgLoading } = findByUsersIdGraphql(userStore.user.id || '');
const organizationCode = computed(() => {
  const data = organizationResult.value?.findByUsersId;
  return data || null;
});

// Function to find DV organization by traversing up the hierarchy
function findDVOrganization(organizations: any[], code: string | null): any | null {
  if (!code) {
    return null;
  }
  let org = organizations.find(o => o.code === code);
  while (org && org.type !== 'DV' && org.parentCode) {
    org = organizations.find(o => o.id === org.parentCode);
  }
  return org && org.type === 'DV' ? org : null;
}

// Function to find all child organizations of a given organization
function findChildOrganizations(organizations: any[], parentCode: string): any[] {
  const children: any[] = [];
  const findChildren = (orgs: any[], parent: string) => {
    const directChildren = orgs.filter((org: any) => org.parentCode === parent);
    for (const child of directChildren) {
      children.push(child);
      // Recursively find children of this child
      findChildren(orgs, child.id);
    }
  };
  findChildren(organizations, parentCode);
  return children;
}

const dvChildOrganizations = computed(() => {
  if (dvOrganization.value && dvOrganization.value?.code) {
    return findChildOrganizations(organizations.value, dvOrganization.value?.code);
  }
  return [];
});

// Computed property to get all organizations with type = 'DV', excluding the root DV organization
const dvOrganizations = computed(() => {
  const allDvOrgs = organizations.value.filter(org => org.type === 'DV');
  
  // Find the root DV organization (where code equals parentCode of other DV orgs, or has no valid parent)
  const parentCodes = allDvOrgs
    .map(org => org.parentCode)
    .filter(Boolean);
  
  // Filter out any DV organization that is a parent of other DV organizations
  return allDvOrgs.filter(org => !parentCodes.includes(org.code));
});

// Filtered departments based on selected DV organization
const filteredDepartments = computed<Department[]>(() => {
  if (!selectedDvOrganizationId.value) {
    return [];
  }
  
  // Find the selected DV organization
  const selectedOrg = organizations.value.find(org => org.code === selectedDvOrganizationId.value);
  if (!selectedOrg || !selectedOrg.code) {
    return [];
  }
  
  // Filter organizations with type = 'PB', parentCode = code of selected DV, and status = 'ACTIVE'
  const pbOrganizations = organizations.value.filter(org => 
    org.type === 'PB' && org.parentCode === selectedOrg.code && org.status === 'ACTIVE'
  );
  
  // Map to Department format
  return pbOrganizations.map(org => ({
    id: org.id,
    code: org.code,
    name: org.name,
    type: org.type,
    parentCode: org.parentCode,
    accountId: org.accountId || userStore.user.id
  }));
});

// Templates and active templates - show all templates regardless of type since form doesn't have type
const activeTemplates = computed<Template[]>(() => {
  return templates.value.filter(template => template.status === 'ACTIVE');
});

// Group templates by type
const groupedActiveTemplates = computed(() => {
  const grouped: Record<string, Template[]> = {};
  
  activeTemplates.value.forEach(template => {
    if (!grouped[template.type]) {
      grouped[template.type] = [];
    }
    grouped[template.type].push(template);
  });
  
  return grouped;
});

// Helper function to get selected template ID for a specific type
const getSelectedTemplateByType = (type: string) => {
  const selectedTemplate = localSalaryForm.value.templates?.find(t => t.type === type);
  return selectedTemplate?.templateId || null;
};

// Helper function to update selected template for a specific type
const updateSelectedTemplateByType = (type: string, templateId: string | null) => {
  // Filter out templates of this type
  const otherTemplates = localSalaryForm.value.templates.filter(t => t.type !== type);
  
  // Add the new template if provided
  if (templateId) {
    otherTemplates.push({
      type,
      templateId 
    });
  }

  localSalaryForm.value.templates = otherTemplates;
};

// Handle checkbox change to allow toggle and single selection per type
const handleTemplateCheckboxChange = (type: string, templateId: string, checked: boolean) => {
  if (checked) {
    // Select this template (will deselect others of the same type)
    updateSelectedTemplateByType(type, templateId);
  } else {
    // Deselect this template
    updateSelectedTemplateByType(type, null);
  }
};

// Helper function to get template type display name
const getTemplateTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'SALARY_CALCULATION': 'Tính lương',
    'SALARY_PAYMENT': 'Thanh toán lương',
    'MONTHLY_SALARY': 'Phiếu lương',
    'SALARY_TAX': 'Tính thuế',
    'INSURANCE': 'Bảo hiểm',
    'OTHER': 'Khác'
  };
  return typeMap[type] || type;
};

// Form validation
const isFormValid = computed(() => {
  return localSalaryForm.value.name.trim().length > 0
      && localSalaryForm.value.month !== null
      && localSalaryForm.value.year !== null
      && localSalaryForm.value.templates?.length > 0
      && localSalaryForm.value.status !== null;
});

// Fetch data and initialize
getAllOrganizationPublicGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic;
});

watchEffect(() => {
  dvOrganization.value = findDVOrganization(organizations.value, organizationCode.value?.parentCode ? organizationCode.value?.parentCode : organizationCode.value?.code);
});

// Watch dvOrganization to set default selectedDvOrganizationId when creating new
watch([() => dvOrganization.value, () => dvOrganizations.value], ([newDvOrg, dvOrgs]) => {
  if (newDvOrg && visibleSidebar.value && !props.isEditing && !selectedDvOrganizationId.value && dvOrgs.length > 0) {
    // Check if dvOrganization.code exists in dvOrganizations list
    const dvOrgExists = dvOrgs.some(org => org.code === newDvOrg.code);

    if (dvOrgExists) {
      // If exists, use it
      selectedDvOrganizationId.value = newDvOrg.code;
    } else {
      // If not exists (filtered out as root DV), select the first available DV
      selectedDvOrganizationId.value = dvOrgs[0]?.code || null;
    }
  }
}, { immediate: true });

// Fetch departments from API
const { onResult: onOrganizationsResult } = getAllOrganizationPublicGraphql();
onOrganizationsResult((result) => {
  const organizations = result.data?.allOrganizationPublic || [];

  // Convert tree nodes to flat list of departments
  const flatDepartments: Department[] = [];
  const flattenTree = (nodes: TreeNode[], level = 0, parentKey: string | null = null) => {
    nodes.forEach(node => {
      // Add department with indentation based on level
      flatDepartments.push({
        id: node.key as string,
        code: node.code,
        parentCode: node.parentCode,
        name: ' '.repeat(level) + node.label, // Using em space for indentation
        type: node.data?.type || 'DV', // Default to 'DV' if not specified
        accountId: node.data?.accountId || userStore.user.id // Default to current user id if not specified
      });

      // Process children if they exist
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, node.key as string);
      }
    });
  };

  // Select departments based on child organizations of the DV
  if (dvChildOrganizations.value.length > 0) {
    localSalaryForm.value.organizationIds = dvChildOrganizations.value.map(org => org.id);
  } else {
    // If no child organizations found, use all departments
    localSalaryForm.value.organizationIds = flatDepartments.map(dept => dept.id) as string[];
  }
});

// Fetch templates from API
const { onResult: onTemplatesResult, onError: onTemplatesError } = getAllSalaryTemplates();
onTemplatesResult((result) => {
  if (result.data && result.data.findTemplate) {
    templates.value = result.data.findTemplate.map((template: any) => ({
      id: template.id,
      name: template.name,
      status: template.status,
      type: template.type
    }));
    
    // Re-map templates if in edit mode with columnTemplates
    if (props.isEditing && props.payslipData && Array.isArray(props.payslipData.columnTemplates) 
        && props.payslipData.columnTemplates.length > 0 && localSalaryForm.value.templates.length === 0) {
      const uniqueTemplates = new Map<string, string>();
      props.payslipData.columnTemplates.forEach((col: any) => {
        if (col.templateId && !uniqueTemplates.has(col.templateId)) {
          const template = templates.value.find(t => t.id === col.templateId);
          if (template) {
            uniqueTemplates.set(col.templateId, template.type);
          }
        }
      });
      
      localSalaryForm.value.templates = Array.from(uniqueTemplates.entries()).map(([templateId, type]) => ({
        type,
        templateId
      }));
    }
  }
});

onTemplatesError((error) => {});

// Watch for changes in props
watch(() => props.visible, (newVisible) => {
  visibleSidebar.value = newVisible;
  if (newVisible) {
    // Reset form when sidebar opens
    errors.value = {};

    if (props.isEditing && props.payslipData) {
      // Initialize form with payslip data for editing
      localSalaryForm.value = {
        ...props.payslipData, // Use the payslip data for editing
        month: props.payslipData.month || new Date().getMonth() + 1,
        year: props.payslipData.year || new Date().getFullYear(),
        status: props.payslipData.status || 'DRAFT',
        createdDate: props.payslipData.createdDate ? moment(props.payslipData.createdDate).format('DD/MM/YYYY') : null,
        creatorId: props.payslipData.creatorId || props.payslipData.createdBy || userStore.user?.id || '',
        createdBy: (() => {
          // Get the creator ID - try creatorId first, then createdBy field
          const creatorId = props.payslipData.creatorId || props.payslipData.createdBy;
          if (creatorId) {
            // Try to get the fullname from userMoreInfo store
            const userInfo = userMoreInfoStore.usersMoreInfo[creatorId];
            if (userInfo && userInfo.fullName) {
              return userInfo.fullName;
            } else {
              // If not in userMoreInfo store, try to fetch it
              userMoreInfoStore.fetchUserMoreInfo(creatorId);
              // Return a temporary value and expect the watch function to update it
              return props.payslipData.createdByName || props.payslipData.createdBy || '';
            }
          } else {
            // Fallback to current user if no creator info available
            return userStore.user?.fullName || userStore.user?.username || '';
          }
        })(),
        templates: (() => {
          // Handle templates array (from findPayslipById)
          if (Array.isArray(props.payslipData.templates) && props.payslipData.templates.length > 0) {
            return props.payslipData.templates.map((item: any) => ({
              type: item.type,
              templateId: item.id
            }));
          }
          
          // Handle columnTemplates array (from createPayslip/updateStatus/findMyPayslips)
          if (Array.isArray(props.payslipData.columnTemplates) && props.payslipData.columnTemplates.length > 0) {
            // Group columns by templateId to get unique templates
            const uniqueTemplates = new Map<string, string>();
            props.payslipData.columnTemplates.forEach((col: any) => {
              if (col.templateId && !uniqueTemplates.has(col.templateId)) {
                // Find template type from templates list
                const template = templates.value.find(t => t.id === col.templateId);
                if (template) {
                  uniqueTemplates.set(col.templateId, template.type);
                }
              }
            });
            
            return Array.from(uniqueTemplates.entries()).map(([templateId, type]) => ({
              type,
              templateId
            }));
          }
          
          return [];
        })()
      };
      
      // Find and set selectedDvOrganizationId based on organizationIds
      if (props.payslipData.organizationIds && props.payslipData.organizationIds.length > 0) {
        // Get the first organization from organizationIds
        const firstOrgId = props.payslipData.organizationIds[0];
        const firstOrg = organizations.value.find(org => org.id === firstOrgId);
        
        if (firstOrg) {
          // Find the parent DV organization
          let parentOrg = organizations.value.find(org => org.code === firstOrg.parentCode);
          
          // If the first org itself is DV, use it; otherwise find parent DV
          if (firstOrg.type === 'DV') {
            selectedDvOrganizationId.value = firstOrg.code;
            initialSelectedDvOrganizationId.value = firstOrg.code;
          } else if (parentOrg && parentOrg.type === 'DV') {
            selectedDvOrganizationId.value = parentOrg.code;
            initialSelectedDvOrganizationId.value = parentOrg.code;
          }
        }
      }
      
      // Store initial organizationIds from API
      initialOrganizationIds.value = [...props.payslipData.organizationIds];
    } else {
      // Initialize with default values for creating new salary table
      localSalaryForm.value = {
        name: '',
        month: new Date().getMonth() + 1, // JavaScript months are 0-indexed
        year: new Date().getFullYear(),
        location: null,
        createdDate: moment().format('DD/MM/YYYY'),
        createdBy: userStore.user.fullName || userStore.user.username || '',
        creatorId: userStore.user.id || '',
        organizationIds: [], // Will be populated after departments are loaded
        templates: [],
        status: 'DRAFT'
      };
      // Set default selectedDvOrganizationId to the parent DV organization of user's department
      // Check if dvOrganization exists in dvOrganizations list
      if (dvOrganization.value && dvOrganizations.value.length > 0) {
        const dvOrgExists = dvOrganizations.value.some(org => org.code === dvOrganization.value?.code);
        selectedDvOrganizationId.value = dvOrgExists 
          ? dvOrganization.value.code 
          : dvOrganizations.value[0]?.code || null;
      } else {
        selectedDvOrganizationId.value = null;
      }
      initialSelectedDvOrganizationId.value = null;
      initialOrganizationIds.value = [];
    }
  }
});

// Watch for departments changes to update selected departments
watchEffect(() => {
  // Update selected departments when departments are loaded (only for new creation, not editing)
  if (visibleSidebar.value && !props.isEditing && localSalaryForm.value.organizationIds && localSalaryForm.value.organizationIds.length === 0) {
    localSalaryForm.value.organizationIds = filteredDepartments.value.map(dept => dept.id) as string[];
  }
});

// Watch for user changes to update creator field
watch(() => userStore.user?.id, (newUserId) => {
  if (newUserId) {
    // Fetch user info from userMoreInfo store
    userMoreInfoStore.fetchUserMoreInfo(newUserId);
    
    // Set the creator ID
    localSalaryForm.value.creatorId = newUserId;
    
    // Update the createdBy field when userMoreInfo is available
    let unwatch: () => void;
    unwatch = watch(() => userMoreInfoStore.usersMoreInfo[newUserId], (userInfo) => {
      if (userInfo) {
        localSalaryForm.value.createdBy = userInfo.fullName || userStore.user?.fullName || userStore.user?.username || '';
        if (unwatch) {
          unwatch(); // Stop watching once we have the value
        }
      }
    }, { immediate: true });
    
    // Also set a fallback in case userMoreInfo is not available immediately
    if (!userMoreInfoStore.usersMoreInfo[newUserId]) {
      localSalaryForm.value.createdBy = userStore.user?.fullName || userStore.user?.username || '';
    } else {
      localSalaryForm.value.createdBy = userMoreInfoStore.usersMoreInfo[newUserId].fullName || userStore.user?.fullName || userStore.user?.username || '';
    }
  }
}, { immediate: true });

// Methods
function onVisibleChange(visible: boolean) {
  visibleSidebar.value = visible;
  emit('update:visible', visible);
}

function onCancel() {
  emit('cancel');
  onVisibleChange(false);
}

function onSave() {
  // Validate form
  errors.value = {};
  let hasErrors = false;

  if (!localSalaryForm.value.name || localSalaryForm.value.name.trim().length === 0) {
    errors.value.name = t('common.validate.required', { item: t('hrm.salary.salaryTableName') });
    hasErrors = true;
  }

  if (localSalaryForm.value.month === null) {
    errors.value.month = t('common.validate.required', { item: t('common.month') });
    hasErrors = true;
  }

  if (localSalaryForm.value.year === null) {
    errors.value.year = t('common.validate.required', { item: t('common.year') });
    hasErrors = true;
  }

  if (localSalaryForm.value.templates.length === 0) {
    errors.value.templates = t('common.validate.required', { item: t('hrm.salary.salaryAndTax.template') });
    hasErrors = true;
  }

  if (!localSalaryForm.value.status) {
    errors.value.status = t('common.validate.required', { item: t('hrm.salary.salaryAndTax.status') });
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  const data = localSalaryForm.value.id ? cloneDeep(localSalaryForm.value) : omit(localSalaryForm.value, ['id']);
  data.createdBy = localSalaryForm.value.creatorId || '';
  data.createdDate = moment(localSalaryForm.value.createdDate).format(DateTimeFormat.ISO_LOCAL_DATE);
  emit('save', data);
  onVisibleChange(false);
}

// Reset organizationIds when filteredDepartments changes to avoid keeping invalid department IDs
watch(() => filteredDepartments.value,
  () => {
    if (visibleSidebar.value) {
      if (!props.isEditing) {
        // When creating new: auto-select all departments
        localSalaryForm.value.organizationIds = filteredDepartments.value.map(dept => dept.id) as string[];
      } else {
        // When editing: check if we're back to the initial DV organization
        if (selectedDvOrganizationId.value === initialSelectedDvOrganizationId.value) {
          // Restore initial organizationIds from API
          localSalaryForm.value.organizationIds = [...initialOrganizationIds.value];
        } else {
          // Different DV selected: filter out invalid IDs, keep only those still in filteredDepartments
          const validIds = filteredDepartments.value.map(dept => dept.id);
          localSalaryForm.value.organizationIds = localSalaryForm.value.organizationIds.filter(id => 
            validIds.includes(id)
          );
        }
      }
    }
  }
);

// Expose methods for parent component
defineExpose({
  resetForm: () => {
    localSalaryForm.value = {
      name: '',
      month: new Date().getMonth() + 1, // JavaScript months are 0-indexed
      year: new Date().getFullYear(),
      location: null,
      createdDate: new Date(),
      createdBy: userStore.user.fullName || userStore.user.username || '',
      creatorId: userStore.user.id || '',
      organizationIds: [],
      templates: [],
      status: 'DRAFT',
    };
    selectedDvOrganizationId.value = null;
    errors.value = {};
  }
});
</script>

<style lang="scss" scoped>

.p-invalid {
  border-color: #f44336;
}

.max-h-20rem {
  max-height: 20rem;
}

.h-full {
  height: 100%;
}

.flex-1 {
  flex: 1;
}

:deep(.hide-label label) {
  display: none;
}

.field {
  margin-bottom: 0;
}

[class*="col-"] {
  padding: 10px 5px;
  box-sizing: border-box;
}
</style>