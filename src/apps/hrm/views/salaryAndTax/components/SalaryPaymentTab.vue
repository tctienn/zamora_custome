<template>
  <div class='font-semibold p-2 text-2xl'>Bảng thanh toán</div>
  <div class='table-container'>
    <DataTable 
      class='p-datatable-sm' 
      column-resize-mode='fit'
      resizable-columns
      v-bind='{...DEFAULT_DATATABLE_CONFIG}'
      scroll-height='60vh'
      scrollable 
      :value='paymentData'>
      <Column
        field='stt'
        header='TT'
        :style="{ width: '50px' }"></Column>
      <Column
        field='hoTen'
        header='HỌ TÊN'
        :style="{ width: '150px' }"></Column>
      <Column
        field='maNhanVien'
        header='MNV'
        :style="{ width: '80px' }"></Column>
      <Column
        field='chucVu'
        header='Chức vụ'
        :style="{ width: '150px' }"></Column>
      <Column
        field='luongCoBan'
        header='Lương cơ bản'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.luongCoBan) }}</div>
        </template>
      </Column>
      <Column
        field='phuCap'
        header='Phụ cấp'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.phuCap) }}</div>
        </template>
      </Column>
      <Column
        field='thuong'
        header='Thưởng'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.thuong) }}</div>
        </template>
      </Column>
      <Column
        field='khauTru'
        header='Khấu trừ'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.khauTru) }}</div>
        </template>
      </Column>
      <Column
        field='tongLuong'
        header='Tổng lương'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.tongLuong) }}</div>
        </template>
      </Column>
      <Column
        field='thucNhan'
        header='Thực nhận'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.thucNhan) }}</div>
        </template>
      </Column>
      <Column
        field='ghiChu1'
        header='Ghi chú 1'
        :style="{ width: '150px' }">
        <template #body='slotProps'>
          <div>{{ slotProps.data.ghiChu1 }}</div>
        </template>
      </Column>
      <Column
        field='ghiChu2'
        header='Ghi chú 2'
        :style="{ width: '150px' }">
        <template #body='slotProps'>
          <div>{{ slotProps.data.ghiChu2 }}</div>
        </template>
      </Column>
      <Column
        field='ghiChu3'
        header='Ghi chú 3'
        :style="{ width: '150px' }">
        <template #body='slotProps'>
          <div>{{ slotProps.data.ghiChu3 }}</div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref } from 'vue';

import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

// Mock data for payment table
const paymentData = ref([
  {
    id: 1,
    stt: 1,
    hoTen: 'Phạm Đức Thắng',
    maNhanVien: 'C002',
    chucVu: 'Nhân viên phát triển phần mềm',
    luongCoBan: '20000000',
    phuCap: '3000000',
    thuong: '2000000',
    khauTru: '1500000',
    tongLuong: '23500000',
    thucNhan: '22000000',
    ghiChu1: 'Thanh toán qua ngân hàng',
    ghiChu2: 'Đã kiểm tra thông tin',
    ghiChu3: 'Không có vấn đề'
  },
  {
    id: 2,
    stt: 2,
    hoTen: 'Nguyễn Văn A',
    maNhanVien: 'C001',
    chucVu: 'Lập trình viên',
    luongCoBan: '18000000',
    phuCap: '2500000',
    thuong: '1500000',
    khauTru: '1200000',
    tongLuong: '20800000',
    thucNhan: '19600000',
    ghiChu1: 'Thanh toán qua ví điện tử',
    ghiChu2: 'Đã kiểm tra thông tin',
    ghiChu3: 'Không có vấn đề'
  },
  {
    id: 3,
    stt: 3,
    hoTen: 'Trần Thị B',
    maNhanVien: 'C002',
    chucVu: 'Tester',
    luongCoBan: '15000000',
    phuCap: '2000000',
    thuong: '1000000',
    khauTru: '1000000',
    tongLuong: '17000000',
    thucNhan: '16000000',
    ghiChu1: 'Thanh toán tiền mặt',
    ghiChu2: 'Đã kiểm tra thông tin',
    ghiChu3: 'Không có vấn đề'
  }
]);

// Format currency
function formatCurrency(value: string) {
  if (!value) {
    return '0';
  }
  return parseInt(value).toLocaleString('vi-VN');
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 290px);
  width: 100%;
}

:deep(.p-datatable) {
  font-size: 13px;
}

:deep(.p-datatable-header) {
  padding: 8px 12px;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 6px 8px;
}

:deep(.p-datatable-thead > tr > th) {
  padding: 8px;
  background-color: #f5f5f5;
  font-weight: 600;
}
</style>