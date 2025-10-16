<template>
  <div class='flex flex-column row-gap-2'>
    <div class='column-gap-2 flex flex-row'>
      <div class='flex flex-column row-gap-2'>
        <span class='font-bold text-xl'>Revotech - đế chế công nghệ mới nổi gia nhập 10 công ty thành công nhất 2024</span>
        <span class='white-space-pre-wrap'>
          Mới đây, nhà nước vừa trao tặng Huy chương Lao động hạng nhất cho công ty phần mềm Revotech về những đóng góp
          vô cùng to lớn trong lĩnh vực kỹ thuật, công nghệ nước nhà cũng như Thế giới. Theo đó, công ty Revotech đầu năm
          2024 đã cho ra mắt hệ sinh thái làm việc số RevoWorkspace,...
        </span>

        <div class='align-items-center column-gap-2 flex flex-row'>
          <AppAvatar size='2' />
          <span>Đỗ Quanng Trường</span>

          <AppIcon
            :fill='true'
            name='radio_button_unchecked'
            size='0.5'/>

          <span>{{convertReadableDate(new Date())}}</span>
        </div>
      </div>

      <div class=''>
        <img
          alt=''
          class='lg:w-10rem object-fit-cover w-7rem'
          src='http://revotech.vn/wp-content/uploads/2023/07/cropped-revotech.png.pagespeed.ce.vFD-DHa_q8.png' />
      </div>
    </div>

    <Divider class='my-0' />
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

import { convertReadableDate } from '@/common/helpers/utils';

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'NewsFeedNotificationItem' };
</script>