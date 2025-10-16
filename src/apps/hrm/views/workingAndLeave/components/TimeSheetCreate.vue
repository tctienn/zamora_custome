<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "50vw"}}'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-4 pb-2'
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
              {{ editingTemplate ? t('hrm.timeSheet.form.titleEdit') : t('hrm.timeSheet.form.titleCreate') }}
            </div>
          </div>
          <div class='flex gap-1'>
            <Button
              class='border-round-sm'
              :disabled='!isFormValid || isLoading'
              icon='pi pi-save'
              :label="t('common.save')"
              :loading='isLoading'
              @click='onSave'/>
          </div>
        </div>
      </div>
    </template>

    <div class='border-round-sm flex gap-2'>
      <div class='grid grid-cols-12 mx-0 p-0'>
        <div class='col-12 field'>
          <FormTreeSelect
            v-model='localTimeSheetForm.organizationId'
            class='w-full'
            :expanded-level='1'
            :label="t('hrm.timeSheet.form.organization')"
            name='organization'
            option-value='key'
            :options='orgsList'/>
          
          <!--          <Dropdown-->
          <!--            v-model='localTimeSheetForm.organizationId'-->
          <!--            class='w-full'-->
          <!--            option-label='name'-->
          <!--            option-value='id'-->
          <!--            :options='orgsList'-->
          <!--            panel-class='custom-dropdown'>-->
          <!--          </Dropdown>-->

        </div>
        <div class='col-12 field'>
          <label class='block font-semibold mb-2'>{{ t('hrm.salary.salary.templateName') }} <span
            class='text-red-500'>*</span></label>
          <InputText
            v-model='localTimeSheetForm.name'
            class='w-full'
            :class="{ 'p-invalid': errors.name }"
            :placeholder="t('hrm.salary.salary.enterTemplateName')"/>
          <small
            v-if='errors.name'
            class='p-error'>{{ errors.name }}</small>
        </div>
        <div class='col-6 flex flex-col gap-2'>
          <div class='field w-6'>
            <label class='block font-normal mb-2'>{{ t('hrm.timeSheet.form.time') }} <span
              class='text-red-500'>*</span></label>
            <Dropdown
              v-model='localTimeSheetForm.month'
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
              v-model='localTimeSheetForm.year'
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
            <label class='block font-normal mb-2'>{{ t('hrm.timeSheet.form.location') }}</label>
            <Dropdown
              v-model='localTimeSheetForm.createdPlace'
              class='w-full'
              editable
              option-label='label'
              option-value='value'
              :options='locationOptions'
              :placeholder="t('hrm.timeSheet.form.location')">

            </Dropdown>
          </div>
        </div>

        <!-- Creation Date - Half width -->
        <div class='col-6'>
          <div class='field'>
            <FormInputCalendar
              v-model='localTimeSheetForm.createdDate'
              class='w-full'
              input-format='DD/MM/YYYY'
              :label="t('hrm.timeSheet.form.dateTime')"
              name='creationDate'
              :placeholder="t('hrm.timeSheet.form.selectCreationDate')"/>
          </div>
        </div>

        <!-- Creator - Half width -->
        <div class='col-6'>
          <div class='field'>
            <label class='block font-normal mb-2'>{{ t('hrm.timeSheet.form.creator') }}</label>
            <InputText
              v-model='localTimeSheetForm.createdUserId'
              class='hidden w-full'/>
            <InputText
              v-model='localTimeSheetForm.createdUsername'
              class='w-full'
              readonly />
          </div>
        </div>
        <div
          class='col-12'
          style='max-height: 60vh; overflow-y: auto;'>
          <div class='field flex flex-column h-full'>
            <label class='block font-normal mb-2'>{{ t('hrm.timeSheet.form.employeeList') }}</label>
            <div class='border-1 border-round flex-1 overflow-y-auto p-3 surface-border'>
              <template v-if='filteredEmployees.length > 0'>
                <div
                  v-for='(emp, index) in filteredEmployees'
                  :key='index'
                  class='align-items-center flex mb-2'>
                  <Checkbox
                    v-model='localTimeSheetForm.employeeIds'
                    class='mr-2'
                    :input-id='`emp_${emp?.id}`'
                    :value='emp?.id'/>
                  <label
                    class='mb-0 text-wrap'
                    :for='`emp_${emp?.id}`'>{{index+1}}. {{ emp.fullName }}</label>
                </div>
              </template>
              <template v-else>
                <div class='text-500 text-center'>
                  {{ t('hrm.timeSheet.form.noEmployees') }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">

import type { TreeNode } from 'primevue/treenode';
import { useToast } from 'primevue/usetoast';
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { searchEmployees } from '@/apps/hrm/api/graphql/employee';
import { saveTimesheet } from '@/apps/hrm/api/graphql/timesheet';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import type { EmployeeFilter, EmployeeSummary } from '@/apps/hrm/model/employee';
import { type TimeSheetDataItem } from '@/apps/hrm/model/time-sheet';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatToISOLocalDateTime } from '@/common/helpers/utils';
import type { Connection } from '@/common/model/page';
import type { User } from '@/common/model/User';

interface Props {
  visible: boolean;
  editingTemplate: TimeSheetDataItem | null;
  user: User;
  department: any;
  allOrganization: TreeNode[];
}

interface Emits {
  (e: 'update:visible', value: boolean): void;

  (e: 'save', template: any): void;

  (e: 'cancel'): void;
  (e: 'refetch'): void;
}

interface LocationOption {
  label: string;
  value: string;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const { t } = useI18n();
const toast = useToast();
const { moment } = useMoment();
const filteredEmployees = computed<User[]>(() => {
  return employeesList.value;
});

const defaultData = reactive<TimeSheetDataItem>(
  {
    id: '',
    name: '',
    status: '',
    month: Number(moment().format('MM')),
    year: Number(moment().format('YYYY')),
    organizationId: '',
    createdDate: '',
    createdUserId: '',
    createdUsername: props.user?.fullName || '',
    employeeIds: [''],
    createdPlace: '',
  }
);
const localTimeSheetForm = ref<TimeSheetDataItem>(defaultData);
// Loading state
const isLoading = ref(false);
let mutationHandled = false; // Flag to prevent duplicate notifications
// Local form data

const visibleSidebar = ref<boolean>(false);
const userMoreInfoStore = useUserMoreInfoStore();
// Form validation
const isFormValid = computed(() => {
  return localTimeSheetForm.value.name && localTimeSheetForm.value.name.trim().length > 0;
});
const errors = ref<Record<string, string>>({});
const orgsList = ref<TreeNode[]>([]);
const employeesList = ref<User[]>([]);
const filter = reactive<EmployeeFilter>({ organization: '' });
const {
  result,
  load: loadSearch,
} = searchEmployees(filter, {
  page: 0,
  size: 9999
});
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

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }
  return years;
});

// GraphQL operations
const {
  mutate: saveTimesheetMutate,
  onDone: saveTimesheetMutateDone,
  onError: saveTimesheetMutateError
} = saveTimesheet();

// Handle GraphQL events
saveTimesheetMutateDone((result) => {
  if (mutationHandled) {
    return;
  } // Prevent duplicate notifications
  mutationHandled = true;
  isLoading.value = false;
  if (result.data && result.data.saveTimesheet) {
    toast.add({
      severity: 'success',
      summary: t('common.result.title.success'),
      detail: props.editingTemplate ? t('hrm.timeSheet.form.successUpdate') : t('hrm.timeSheet.form.successCreate'),
      life: 3000
    });
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.result.title.error'),
      detail: props.editingTemplate ? t('hrm.timeSheet.form.errorUpdate') : t('hrm.timeSheet.form.errorCreate'),
      life: 3000
    });
  }
  emit('refetch');
  onVisibleChange(false);
});

saveTimesheetMutateError((error) => {
  if (mutationHandled) {
    return;
  } // Prevent duplicate notifications
  mutationHandled = true;
  isLoading.value = false;
  if(error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('hrm.salary.template.saveError'),
      life: 3000
    });
  }

});

watchEffect(() => {

});

// Methods
function onVisibleChange(visible: boolean) {
  emit('update:visible', visible);
  visibleSidebar.value = visible;
  if (!visible) {
    employeesList.value = [];
  }
  resetFormData();
}

function onCancel() {
  emit('cancel');
  // Reset form when canceling to ensure clean state for next use
  resetFormData();
  onVisibleChange(false);
}

function onSave() {
  // Validate form
  errors.value = {};
  let hasErrors = false;

  if (!localTimeSheetForm.value.name || localTimeSheetForm.value.name.trim().length === 0) {
    errors.value.name = t('common.validate.required', { item: t('hrm.timeSheet.form.name') });
    hasErrors = true;
  }

  if (!localTimeSheetForm.value.month || localTimeSheetForm.value.month < 1 || localTimeSheetForm.value.month > 12) {
    errors.value.month = t('common.validate.required', { item: t('hrm.timeSheet.form.month') });
    hasErrors = true;
  }
  if (!localTimeSheetForm.value.year) {
    errors.value.type = t('common.validate.required', { item: t('hrm.timeSheet.form.year') });
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  // Reset mutation handled flag and set loading state
  mutationHandled = false;
  isLoading.value = true;

  // Prepare template input for GraphQL mutation
  const templateInput = {
    name: localTimeSheetForm.value.name,
    month: localTimeSheetForm.value.month,
    year: localTimeSheetForm.value.year,
    organizationId: localTimeSheetForm.value.organizationId,
    createdDate: formatToISOLocalDateTime(localTimeSheetForm.value.createdDate || ''),
    createdUserId: localTimeSheetForm.value.createdUserId,
    createdPlace: localTimeSheetForm.value.createdPlace,
    employeeIds: localTimeSheetForm.value.employeeIds?.filter(id => id) || [],
  } as TimeSheetDataItem;

  if(props.editingTemplate) {
    templateInput['id'] = localTimeSheetForm.value.id;
  }

  // Call GraphQL mutation to save template
  saveTimesheetMutate({ timesheet: templateInput });

}

// Function to reset form data to initial state
function resetFormData() {
  localTimeSheetForm.value = defaultData;
}

// Get full name of creator
function getCreatorName(userId: string) {
  if (!userId) {
    return {
      name: '',
      avatar2: '',
    };
  }
  const user = userMoreInfoStore.usersMoreInfo[userId];
  if (!user) {
    return {
      name: '',
      avatar2: '',
    };
  }
  return {
    name: user.fullName || user.username || '',
    avatar2: generateAvatarUrl(user.avatar as string | undefined),
  };
}

// Expose methods for parent component
defineExpose({
  resetForm: () => {
    resetFormData();
  }
});

watchEffect(() => {
  visibleSidebar.value = props.visible;
  orgsList.value = props.allOrganization;

  if (props.editingTemplate && props.editingTemplate.id) {
    // If we're editing an existing timesheet, populate the form with its data
    localTimeSheetForm.value = {
      ...defaultData,
      id: props.editingTemplate.id || '',
      name: props.editingTemplate.name || '',
      status: props.editingTemplate.status || '',
      month: props.editingTemplate.month || Number(moment().format('MM')),
      year: props.editingTemplate.year || Number(moment().format('YYYY')),
      organizationId: props.editingTemplate.organizationId || '',
      createdDate: moment(props.editingTemplate.createdDate || '').format('DD/MM/YYYY') || '',
      createdUserId: props.editingTemplate.createdUserId || '',
      createdUsername: getCreatorName(props.editingTemplate.createdUserId || '').name,
      employeeIds: props.editingTemplate.employeeIds || [''],
      createdPlace: props.editingTemplate.createdPlace || '',
    };
  } else {
    // If creating new timesheet, set default values
    defaultData.organizationId = props.department[0]?.id || '';
    defaultData.createdUserId = props.user?.id || '';
    defaultData.createdUsername = props.user?.fullName || '';
    defaultData.createdDate = moment().format('DD/MM/YYYY');
    localTimeSheetForm.value = defaultData;
  }
});

watch(result, () => {
  const connection = result.value?.searchEmployees as Connection<EmployeeSummary>;
  if (connection) {
    employeesList.value = connection.edges.map(e => {
      const n = e.node;
      return {
        id: n.id,
        fullName: n.fullName
      };
    });
  }
});

watch(() => visibleSidebar.value, (newValue) => {
  if (newValue && localTimeSheetForm.value.organizationId) {
    filter.organization = localTimeSheetForm.value.organizationId;
    loadSearch();
  }
});

watch(() => localTimeSheetForm.value.organizationId, (newValue) => {
  if (visibleSidebar.value && newValue) {
    filter.organization = newValue;
    loadSearch();
  }
});

watch(() => filteredEmployees.value, (newValue) => {
  localTimeSheetForm.value.employeeIds = newValue.map(emp => emp.id) as string[];
}, { deep: true });
</script>

<style lang="scss" scoped>
.p-invalid {
  border-color: #f44336;
}

.field {
  margin-bottom: 0;
}
.col-12, .col-6 {
  padding: 0.5rem;
}
:deep(.p-inputtext) {
  width: 100%;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-dropdown) {
  width: 100%;
}

</style>
