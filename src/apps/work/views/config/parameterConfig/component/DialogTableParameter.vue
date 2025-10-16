<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Bảng từ khóa sử dụng để khai báo bộ mã'
    @hide="emits('hide-dialog')">
    <div>
      <div class='grid'>
        <div class='col-3 font-bold'>date</div>
        <div class='col-9'>
          Giá trị ngày /tháng năm Tùy theo format hệ thống có thể lấy ra giá trị
          phù hợp theo định dạng sau: dd: ngày 2 chữ số MM: tháng 2 chữ số yy:
          năm 2 chữ số, yyyy: năm 4 chữ số
          <div class='font-bold grid grid-nogutter mt-1'>
            <div class='col-1'>Ví dụ:</div>
            <div class='col-11'>{date, “dd/MM/yyyy”} sẽ là 15/01/2025</div>
            <div class='col-1'></div>
            <div class='col-11'>{date, “MMyyyy”}.{count} = 012025.20</div>
          </div>
        </div>
        <Divider />

        <div class='col-3 font-bold'>count</div>
        <div class='col-9'>
          Là giá trị tăng dần của bộ đếm, định dạng format {count} Trường hợp
          muốn thêm số 0 vào trước giá trị đếm thì format định dạng như sau:
          {count, 2} 2 là hiển thị 2 số 0
          <div>Ví dụ: {count, 2} = 0020</div>
        </div>
        <Divider />
        <div class='col-3 font-bold'>user_id</div>
        <div class='col-9'>
          Là mã đăng nhập của người sử dụng định danh trong hệ thống
          <div>Ví dụ: thangpd</div>
        </div>
        <Divider />
        <div class='col-3 font-bold'>dept_id</div>
        <div class='col-9'>
          Là mã phòng ban của người dùng đăng nhập vào hệ thống
          <div>Ví dụ: DEV là là mã của Phòng phát triển sản phẩm</div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
</script>

<style scoped></style>
