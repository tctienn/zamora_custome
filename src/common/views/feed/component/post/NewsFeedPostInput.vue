<template>
  <div class='border-1 border-round-xl flex flex-column p-2 row-gap-2 shadow-1 surface-border'>
    <div class='column-gap-2 flex flex-row'>
      <AppAvatar />
      <Textarea
        class='border-none outline-none resize-none shadow-none surface-ground w-full'
        placeholder='Hãy chia sẻ điều gì đó'
        rows='3' />
    </div>

    <Divider class='my-0' />

    <div class='flex flex-row flex-wrap justify-content-between'>
      <div class='column-gap-3 flex flex-row'>
        <ButtonIcon
          class='px-2 py-1'
          icon='video_call'
          label='Livestream'
          text/>
        <ButtonIcon
          class='px-2 py-1'
          icon='video_camera_back'
          label='Ảnh/video'
          text/>
        <ButtonIcon
          class='px-2 py-1'
          icon='poll'
          label='Bình chọn'
          text/>
      </div>
      <div class='column-gap-3 flex flex-row'>
        <ButtonIcon
          v-tooltip='"Tệp đính kèm"'
          class='p-1'
          icon='attachment'
          text/>
        <ButtonIcon
          v-tooltip='"Biểu cảm"'
          class='p-1'
          icon='mood'
          text/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'NewsFeedPostInput' };
</script>