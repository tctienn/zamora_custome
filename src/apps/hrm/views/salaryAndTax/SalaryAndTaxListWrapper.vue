<template>
  <div
    ref='wrapperRef'
    class='ease-linear list-wrapper transition-all transition-duration-300'>
    <div class='flex flex-column gap-2 toolbar-container'>
      <Toolbar
        class='mb-2 p-0'
        style='min-height: 3rem'>
        <template #start>
          <div class='align-items-center flex gap-2 pl-2'>
            <ButtonIcon
              v-tooltip='"Ẩn/Hiện"'
              class='align-self-center p-1'
              icon='menu'
              rounded
              text
              @click='toggleTree'/>
           
            <p class='font-semibold'>Bảng lương tháng</p>

          </div>
        </template>
        <template #end>
          <div class='btn-group-toolbar flex gap-1 mr-1'>
            <Button
              class='btn-create focus:shadow-none font-medium'
              icon='pi pi-plus'
              :label='t("common.create")'
              @click=' visibleSidebarForm = !visibleSidebarForm;'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-calculator'
              label='Tính lương'
              
              severity='secondary'
              @click='handleCalculationData'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-send'
              label='Chuyển duyệt'
              severity='secondary'
              @click='visibleSend = true'></Button>
            <Button
              v-if='hasPermission("/HRM/HRM_PROFILE/HRM_PROFILE_CURRENT/CREATE")'
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-credit-card'
              label='Tài khoản'
              severity='secondary'
              @click='bankTaxVisible = true'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-list'
              :label='t("hrm.salary.salaryProcess")'
              severity='secondary'
              @click='visibleSalaryProcessSidebar = true'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-filter'
              :label='t("common.filter")'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-import'
              label='Import'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-export'
              label='Export'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-cog'
              :label='t("common.setting")'
              severity='secondary'></Button>
          </div>
        </template>
      </Toolbar>
    </div>
    <div
      class='list-wrapper-content'
      :class='{ "hide-tree": isHidden }'>
      <div
        ref='treeRef'
        class='overflow-hidden transition-all'>
        <SalaryAndTaxTree
          class='h-full'
          :salary-data='salaryData'
          style='background-color: var(--surface-e)'
          @select-salary='handleSelectSalary'
          @select-status='handleSelectStatus'/>
      </div>
      <SalaryAndTax
        ref='salaryAndTaxRef'
        :payslip-id='selectedSalary?.id'
        @refetch-data='refetchPayslipData'/>
    </div>
  </div>

  <!-- Create Salary Sidebar -->
  <CreatePayslipSidebar
    v-model:visible='visibleSidebarForm'
    @cancel='handleCancelSalary'
    @save='handleSaveSalary'/>

  <SalaryProcessSidebar
    v-if='visibleSalaryProcessSidebar'
    v-model:visible='visibleSalaryProcessSidebar'
    @hide-dialog='visibleSalaryProcessSidebar = false'/>

  <HrmBankTaxDialog
    v-if='bankTaxVisible'
    :visible-dialog='bankTaxVisible'
    @hide-dialog='bankTaxVisible = false'/>

  <!-- Salary Information Sidebar -->
  <!--  <Sidebar-->
  <!--    v-model:visible='salaryInfoSidebarVisible'-->
  <!--    :dismissable='false'-->
  <!--    position='right'-->
  <!--    style='width: 500px'>-->
  <!--    <template #header>-->
  <!--      <h3>Thông tin chi tiết bảng lương</h3>-->
  <!--    </template>-->
  <!--    <SalarySidebar/>-->
  <!--  </Sidebar>-->

  <SalaryAndTaxSendFlow
    v-if='visibleSend'
    :selected-payslip='selectedSalary'
    :visible='visibleSend'
    @update:refetch='refetchPayslipData'
    @update:visible='(val) => visibleSend = val'/>

</template>

<script lang='ts' setup>
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { hasPermission } from '@/apps/admin/services/permission';
import { createPayslip, getAllPayslip } from '@/apps/hrm/api/graphql/salary';
import HrmListWrapper from '@/apps/hrm/components/list/HrmListWrapper.vue';
import { PayslipStatus } from '@/apps/hrm/model/salary';
import SalaryAndTaxSendFlow from '@/apps/hrm/views/salaryAndTax/components/SalaryAndTaxSendFlow.vue';
import HrmBankTaxDialog from '@/apps/hrm/views/salaryAndTax/components/salaryBankCard/HrmBankTaxDialog.vue';
import SalaryProcessSidebar from '@/apps/hrm/views/salaryAndTax/components/salaryProcess/SalaryProcessSidebar.vue';
import SalaryAndTax from '@/apps/hrm/views/salaryAndTax/SalaryAndTax.vue';
import SalaryAndTaxTree from '@/apps/hrm/views/salaryAndTax/SalaryAndTaxTree.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDate } from '@/common/helpers/utils';

// Import the new components
import CreatePayslipSidebar from './components/CreatePayslipSidebar.vue';

const { t } = useI18n();
const wrapperRef = ref<InstanceType<typeof HrmListWrapper>>();
const salaryAndTaxRef = ref<InstanceType<typeof SalaryAndTax>>();
const isHidden = ref(false);
// const salaryInfoSidebarVisible = ref(false);
const visibleSidebarForm = ref(false);
const visibleSalaryProcessSidebar = ref(false);
const bankTaxVisible = ref(false);
const visibleSend = ref(false);
// Tạo reactive ref cho selectedSalary và cung cấp nó qua provide
const selectedSalary = ref<any>(null);
const { mutate: savePayslipMutate, onDone: savePayslipMutateDone, onError: savePayslipMutateError } = createPayslip();
interface TreePayslip {
  id: string;
  name: string;
  type: string;
  month: number;
  year: number;
  location: string;
  createdDate: string; // Changed to match component expectations
  createdBy: string;
  organizationIds: string[];
  templateIds: string[];
  status: string; // Converted to lowercase to match existing logic in Tree component
}

const salaryData = ref<TreePayslip[]>([]);
const { moment } = useMoment();
// Add getAllPayslip logic
const { onResult: onPayslipResult, onError: onPayslipError, refetch: refetchDataPayslip } = getAllPayslip('DRAFT');

onPayslipResult((result) => {
  if (result.data && result.data.findMyPayslips) {
    salaryData.value = result.data.findMyPayslips.map((payslip: any) => ({
      id: payslip.id,
      name: payslip.name,
      type: payslip.type,
      month: payslip.month,
      year: payslip.year,
      location: payslip.location,
      createdDate: payslip.createdDate, // Map createdDate from GraphQL to match component expectations
      createdBy: payslip.createdBy,
      organizationIds: payslip.organizationIds,
      templateIds: payslip.templateIds,
      status: payslip.status.toLowerCase() // Convert to lowercase to match existing logic in Tree component
    }));
  }
});
onPayslipError((error) => {
  toastError({ message: 'Lỗi khi tải dữ liệu bảng lương!' });
});

// Function to refetch payslip data
function refetchPayslipData() {
  refetchDataPayslip();
}

// Initial fetch of payslip data - the query runs automatically when created

provide('selectedSalary', selectedSalary);

const items = [
  {
    label: 'Lập bảng lương tháng ',
    icon: 'pi pi-file-plus',
    command: () => {
      visibleSidebarForm.value = !visibleSidebarForm.value;
    },
  },
];

function toggleTree() {
  isHidden.value = !isHidden.value;
}

// Handler for saving salary form
function handleSaveSalary(salaryData: any) {
  // Prepare the payslip payload based on the salaryData
  const payslipPayload = {
    name: salaryData.name,
    month: salaryData.month,
    year: salaryData.year,
    // type: 'SALARY_CALCULATION',
    // createdDate: moment(salaryData.createdDate).format(DateTimeFormat.ISO_LOCAL_DATE),
    // createdBy: salaryData.creatorId,
    organizationIds: salaryData.organizationIds,
    templates: salaryData.templates,
    location: salaryData.location || null
  } as any;
  if(salaryData.id) {
    payslipPayload['id'] = salaryData.id;
  }
  savePayslipMutateDone((result) => {
    toastSuccess({ message: t('hrm.salary.template.saveSuccess') || 'Bảng lương đã được tạo thành công!' });
    visibleSidebarForm.value = false;
    refetchPayslipData();
  });

  savePayslipMutateError((error) => {
    // Show error message to user
    toastError({ message: t('hrm.salary.template.saveError') || 'Lỗi khi tạo bảng lương!' });
  });
  // Execute the mutation
  savePayslipMutate({ payslipPayload: payslipPayload });
}

// Handler for canceling salary form
function handleCancelSalary() {
  visibleSidebarForm.value = false;
}

// Handler for selecting status
function handleSelectStatus(status: string) {
  console.log('Selected status in parent:', status);
  // Update the salaryData based on the selected status
  if (status === 'all') {
    // Reset to show all data
    // This will be handled by the SalaryAndTaxTree component itself
  } else {
    // The filtering is handled by the SalaryAndTaxTree component
    // This function can be used for additional logic if needed
  }
}

// Handler for selecting salary
function handleSelectSalary(salary: any) {
  // Cập nhật selectedSalary khi có sự kiện từ SalaryAndTaxTree
  selectedSalary.value = salary;
  // Xử lý logic khi chọn bảng lương
  // Ví dụ: tải dữ liệu bảng lương vào component SalaryAndTax
}

const handleCalculationData = () => {
  // Gọi function handleCalculatePayslip từ SalaryAndTax component
  if (salaryAndTaxRef.value) {
    salaryAndTaxRef.value.handleCalculatePayslip();
  } else {
    toastError({ message: 'Không thể thực hiện tính toán lương!' });
  }
};

defineExpose({
  toggleTree,
  handleCalculationData 
});
</script>

<style scoped>
.list-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem); /* Giảm chiều cao để phù hợp với header */
  transition: all 0.3s ease;
}

.list-wrapper-content {
  display: grid;
  grid-template-columns: 30rem 1fr;
  gap: 0.5rem;
  flex: 1; /* Chiếm phần còn lại của container */
  min-height: 0; /* Cho phép scroll nội bộ */
  transition: all 0.3s ease;

  &.hide-tree {
    grid-template-columns: 0 1fr;
    gap: 0;
  }
}

/* Loại bỏ scroll dọc bằng cách đảm bảo chiều cao phù hợp */
.toolbar-container {
  flex-shrink: 0; /* Ngăn toolbar bị co lại */
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>