<template>
  <div class='font-semibold p-2 text-2xl'>Bảng tính lương cán bộ nhân viên</div>
  <div class='table-container'>
    <DataTable 
      class='p-datatable-sm' 
      column-resize-mode='fit'
      resizable-columns
      v-bind='{...DEFAULT_DATATABLE_CONFIG}'
      scroll-height='60vh'
      scrollable 
      :value='salaryData'>
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
        field='xepLoai'
        header='Loại'
        :style="{ width: '80px' }"></Column>
      <Column
        field='diem'
        header='Điểm'
        :style="{ width: '80px' }"></Column>
      <Column
        field='ngayCongThang'
        header='Ngày công tháng'
        :style="{ width: '100px' }"></Column>
      <Column
        field='nghiPhep'
        header='Ngày nghỉ phép/ nghỉ chế độ theo BLLĐ'
        :style="{ width: '100px' }"></Column>
      <Column
        field='lamThemGio'
        header='Công làm thêm giờ cá nhân'
        :style="{ width: '100px' }"></Column>
      <Column
        field='diLamMuon'
        header='Đi làm muộn; không chấm công'
        :style="{ width: '100px' }"></Column>
      <Column
        field='nghiKhongLuong'
        header='Nghỉ không lương,/ hưởng lương BHXH'
        :style="{ width: '100px' }"></Column>
      <Column
        field='ngayCongCaNhan'
        header='Ngày công cá nhân'
        :style="{ width: '100px' }"></Column>
      <Column
        field='heSoLuong'
        header='Hệ số lương Hcni)'
        :style="{ width: '120px' }"></Column>
      <Column
        field='ncixHcni'
        header='NcixHcni (ẩn)'
        :style="{ width: '120px' }"></Column>
      <Column
        field='luong100'
        header='100% lương (ẩn)'
        :style="{ width: '120px' }"></Column>
      <Column
        field='luong85'
        header='85% lương (ẩn)'
        :style="{ width: '120px' }"></Column>
      <Column
        field='luongThucTeNCtt'
        header='Lương thực tế theo NCtt'
        :style="{ width: '120px' }"></Column>
      <Column
        field='luongThucTe'
        header='Lương thực tế theo NCtt'>
        <template #header>
          <div>
            Lương thực tế theo NCtt
            <span class='block text-gray-500 text-sm'>
              Mức lương đã giảm: Người quản lý: 10%<br/>
              Người lao động: 5%
            </span>
          </div>
        </template>
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.luongThucTe) }}</div>
        </template>
      </Column>
      <Column
        field='tangLuong'
        header='Tăng lương (tính theo % lương tt)'
        :style="{ width: '100px' }"></Column>
      <Column
        field='giamLuong'
        header='Giảm lương (tính theo % lương tt)'
        :style="{ width: '100px' }"></Column>
      <Column
        field='tongLuong'
        header='Tổng lương'
        :style="{ width: '120px' }">
        <template #body='slotProps'>
          <div>{{ formatCurrency(slotProps.data.luongThucTe) }}</div>
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

// Props
const props = defineProps({
  salaryData: {
    type: Array,
    required: true
  }
});

// Format currency
function formatCurrency(value: string) {
  if (!value || value === '-') {
    return value;
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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