<template>
  <div class='h-full salary-sidebar'>
    <Splitter
      class='flex flex-column'
      style='height: 100%'>
      <SplitterPanel
        class='flex flex-column'
        :size='100'>
        <Accordion
          v-model:activeIndex='activeIndex'
          class='w-full'>
          <AccordionTab header='Thông tin bảng lương'>
            <div class='p-3'>
              <div class='gap-3 grid grid-cols-2'>
                <div>
                  <label class='block font-semibold mb-1'>Tháng</label>
                  <div class='border-round p-2 surface-100'>06/2024</div>
                </div>
                <div>
                  <label class='block font-semibold mb-1'>Trạng thái</label>
                  <div class='border-round p-2 surface-100'>Đã chốt</div>
                </div>
                <div>
                  <label class='block font-semibold mb-1'>Tổng nhân viên</label>
                  <div class='border-round p-2 surface-100'>42</div>
                </div>
                <div>
                  <label class='block font-semibold mb-1'>Tổng tiền lương</label>
                  <div class='border-round p-2 surface-100'>1,250,000,000 VNĐ</div>
                </div>
              </div>
              
              <div class='mt-3'>
                <label class='block font-semibold mb-1'>Ghi chú</label>
                <div class='border-round p-2 surface-100'>
                  Bảng lương tháng 06/2024 đã được phê duyệt bởi quản lý nhân sự.
                </div>
              </div>
            </div>
          </AccordionTab>
          
          <AccordionTab header='Chi tiết lương nhân viên'>
            <div class='p-3'>
              <div class='mb-3'>
                <label class='block font-semibold mb-1'>Tìm kiếm nhân viên</label>
                <div class='p-input-icon-left w-full'>
                  <i class='pi pi-search' />
                  <InputText
                    class='w-full'
                    placeholder='Nhập tên nhân viên...' />
                </div>
              </div>
              
              <div class='border-1 border-round mb-3 p-3'>
                <div class='align-items-center flex justify-content-between mb-2'>
                  <div class='font-medium'>Nguyễn Văn A</div>
                  <Tag severity='success'>Đã thanh toán</Tag>
                </div>
                <div class='grid grid-cols-2'>
                  <div class='text-600'>Chức vụ:</div>
                  <div>Lập trình viên</div>
                  
                  <div class='text-600'>Lương cơ bản:</div>
                  <div>18,000,000 VNĐ</div>
                  
                  <div class='text-600'>Phụ cấp:</div>
                  <div>3,500,000 VNĐ</div>
                  
                  <div class='text-600'>Tổng lương:</div>
                  <div class='font-bold'>21,500,000 VNĐ</div>
                </div>
              </div>
              
              <div class='border-1 border-round p-3'>
                <div class='align-items-center flex justify-content-between mb-2'>
                  <div class='font-medium'>Trần Thị B</div>
                  <Tag severity='warning'>Chưa thanh toán</Tag>
                </div>
                <div class='grid grid-cols-2'>
                  <div class='text-600'>Chức vụ:</div>
                  <div>Tester</div>
                  
                  <div class='text-600'>Lương cơ bản:</div>
                  <div>15,000,000 VNĐ</div>
                  
                  <div class='text-600'>Phụ cấp:</div>
                  <div>2,000,000 VNĐ</div>
                  
                  <div class='text-600'>Tổng lương:</div>
                  <div class='font-bold'>17,000,000 VNĐ</div>
                </div>
              </div>
            </div>
          </AccordionTab>
          
          <AccordionTab header='Thông tin thuế'>
            <div class='p-3'>
              <div class='border-1 border-round mb-3 p-3'>
                <div class='font-medium mb-2 text-center'>Tổng hợp thuế thu nhập cá nhân</div>
                <div class='grid grid-cols-2'>
                  <div class='text-600'>Tổng thu nhập chịu thuế:</div>
                  <div>850,000,000 VNĐ</div>
                  
                  <div class='text-600'>Thuế TNCN đã khấu trừ:</div>
                  <div>85,000,000 VNĐ</div>
                  
                  <div class='text-600'>Số người phụ thuộc:</div>
                  <div>12</div>
                  
                  <div class='text-600'>Giảm trừ gia cảnh:</div>
                  <div>54,000,000 VNĐ</div>
                </div>
              </div>
              
              <div class='border-1 border-round p-3'>
                <div class='font-medium mb-2 text-center'>Chi tiết khấu trừ</div>
                <DataTable
                  class='p-0'
                  :value='taxDeductions'>
                  <Column
                    field='employee'
                    header='Nhân viên'></Column>
                  <Column
                    field='income'
                    header='Thu nhập'></Column>
                  <Column
                    field='tax'
                    header='Thuế TNCN'></Column>
                </DataTable>
              </div>
            </div>
          </AccordionTab>
          
          <AccordionTab header='Bảo hiểm xã hội'>
            <div class='p-3'>
              <div class='gap-3 grid grid-cols-3 mb-3'>
                <div class='border-1 border-round p-3 text-center'>
                  <div class='text-600'>BHXH</div>
                  <div class='font-bold text-xl'>12%</div>
                  <div>150,000,000 VNĐ</div>
                </div>
                <div class='border-1 border-round p-3 text-center'>
                  <div class='text-600'>BHYT</div>
                  <div class='font-bold text-xl'>3%</div>
                  <div>37,500,000 VNĐ</div>
                </div>
                <div class='border-1 border-round p-3 text-center'>
                  <div class='text-600'>BHTN</div>
                  <div class='font-bold text-xl'>1%</div>
                  <div>12,500,000 VNĐ</div>
                </div>
              </div>
              
              <div class='border-1 border-round p-3'>
                <div class='font-medium mb-2 text-center'>Chi tiết đóng bảo hiểm</div>
                <DataTable
                  class='p-0'
                  :value='insuranceData'>
                  <Column
                    field='employee'
                    header='Nhân viên'></Column>
                  <Column
                    field='salary'
                    header='Lương BH'></Column>
                  <Column
                    field='social'
                    header='BHXH'></Column>
                  <Column
                    field='health'
                    header='BHYT'></Column>
                  <Column
                    field='unemployment'
                    header='BHTN'></Column>
                </DataTable>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { ref } from 'vue';

const activeIndex = ref<number | number[]>(0);

// Sample data for tax deductions
const taxDeductions = ref([
  {
    employee: 'Nguyễn Văn A',
    income: '21,500,000 VNĐ',
    tax: '1,200,000 VNĐ' 
  },
  {
    employee: 'Trần Thị B',
    income: '17,000,000 VNĐ',
    tax: '900,000 VNĐ' 
  },
  {
    employee: 'Lê Hoàng C',
    income: '23,000,000 VNĐ',
    tax: '1,400,000 VNĐ' 
  },
]);

// Sample data for insurance
const insuranceData = ref([
  { 
    employee: 'Nguyễn Văn A', 
    salary: '21,500,000 VNĐ', 
    social: '2,580,000 VNĐ', 
    health: '645,000 VNĐ', 
    unemployment: '215,000 VNĐ' 
  },
  { 
    employee: 'Trần Thị B', 
    salary: '17,000,000 VNĐ', 
    social: '2,040,000 VNĐ', 
    health: '510,000 VNĐ', 
    unemployment: '170,000 VNĐ' 
  },
  { 
    employee: 'Lê Hoàng C', 
    salary: '23,000,000 VNĐ', 
    social: '2,760,000 VNĐ', 
    health: '690,000 VNĐ', 
    unemployment: '230,000 VNĐ' 
  },
]);
</script>

<style scoped>
.salary-sidebar {
  height: calc(100vh - 6rem);
}

:deep(.p-accordion-header-link) {
  font-weight: 500;
  padding: 1rem;
}

:deep(.p-accordion-content) {
  padding: 0;
}

:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}
</style>