<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Tài liệu được chia sẻ</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <div class='flex justify-content-between'>
      <div class='flex flex-column'>
        <div class='flex justify-content-center'>
          <img
            alt=''
            class='file-extension-icon h-5rem w-5rem'
            draggable='false'
            src='/images/folder-icons/folder.svg'>
        </div>
        Hợp đồng
      </div>

      <div class='flex flex-column'>
        <div class='flex justify-content-center'>
          <img
            alt=''
            class='file-extension-icon h-5rem w-5rem'
            draggable='false'
            src='/images/folder-icons/folder.svg'/>
        </div>
        Tài liệu sản phẩm
      </div>

      <div class='flex flex-column'>
        <div class='flex justify-content-center'>
          <img
            alt=''
            class='file-extension-icon h-5rem w-5rem'
            draggable='false'
            src='/images/folder-icons/folder.svg'/>
        </div>
        Báo cáo
      </div>
    </div>

    <div class='flex flex-column gap-3 pt-5'>
      <div class='flex gap-2'>
        <img
          alt=''
          class='file-extension-icon h-3rem w-3rem'
          draggable='false'
          :src="
            getFileIcon(
              'pdf',
            )
          "/>

        <div class='w-full'>
          <div class='flex justify-content-between'>
            <div>Báo giá phần mềm Zamora</div>
            <div>09/05/2025 8:30</div>
          </div>

          <div class='flex justify-content-between'>
            <div>Người thực hiện: Nguyễn Mai Hương</div>
            <div>3,58 MB</div>
          </div>
        </div>
      </div>

      <div class='flex gap-2'>
        <img
          alt=''
          class='file-extension-icon h-3rem w-3rem'
          draggable='false'
          :src="
            getFileIcon(
              'pdf',
            )
          "/>

        <div class='w-full'>
          <div class='flex justify-content-between'>
            <div>Tài liệu hướng dẫn sử dụng</div>
            <div>09/05/2025 8:30</div>
          </div>

          <div class='flex justify-content-between'>
            <div>Người thực hiện: Nguyễn Mai Hương</div>
            <div>3,58 MB</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { getFileIcon } from '@/common/helpers/file-utils';
</script>

<style scoped>
</style>
