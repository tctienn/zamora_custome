<template>
  <div class='border-1 border-round-xl flex flex-column row-gap-2 shadow-1 surface-border'>
    <div class='column-gap-2 flex flex-row p-2'>
      <AppAvatar/>

      <div class='flex flex-column flex-grow-1'>
        <router-link
          class='font-bold'
          :to='{name: "NewsFeed"}'>Đỗ Quang Trường
        </router-link>
        <div class='align-items-center column-gap-2 flex flex-row opacity-80'>
          <small class=''>1 phút trước</small>
          <AppIcon
            :fill='true'
            name='radio_button_unchecked'
            size='0.5'/>
          <ButtonIcon
            class='p-1'
            icon='lock'
            icon-size='1'
            rounded
            text/>
        </div>
      </div>

      <ButtonIcon
        class='align-self-center ml-auto p-1'
        icon='more_horiz'
        rounded
        text/>
    </div>

    <div class='px-2'>
      <span class='white-space-pre-wrap'>
        <template
          v-for='(split, index) in cutContent'
          :key='index'>
          <a
            v-if='split.isLink'
            class='underline'
            :href='split.href'
            target='_blank'>{{ split.text }}</a>
          <template v-else>{{ split.text }}</template>
        </template>

        <span
          class='cursor-pointer font-bold ml-2 text-primary underline'
          :class='{"block": showMoreContent}'
          @click='showMoreContent = !showMoreContent'>
          <template v-if='showMoreContent'>Thu gọn</template>
          <template v-else>Xem thêm</template>
        </span>
      </span>
    </div>

    <div class='w-full'>
      <img
        alt=''
        class='object-fit-cover w-full'
        src='https://genk.mediacdn.vn/thumb_w/640/139269124445442048/2023/9/3/covertconnew-16937611441371551388761.jpg'/>
    </div>

    <div class='flex flex-row justify-content-between px-2'>
      <div class='align-items-center column-gap-2 flex flex-row'>
        <AppIcon
          color='var(--orange-500)'
          :fill='true'
          name='thumb_up'
          size='1.5'/>
        <AppIcon
          color='var(--pink-500)'
          :fill='true'
          name='favorite'
          size='1.5'/>
        <small>100</small>
      </div>
      <div class='column-gap-2 flex flex-row'>
        <Button
          class='px-2 py-1 sm:focus:shadow-none'
          label='100 bình luận'
          text/>
        <Button
          class='px-2 py-1 sm:focus:shadow-none'
          label='20 chia sẻ'
          text/>
      </div>
    </div>

    <Divider class='my-0'/>

    <div class='flex flex-row p-2'>
      <div class='col-4 p-0'>
        <Button
          class='column-gap-2 flex flex-row justify-content-center py-1 sm:focus:shadow-none w-full'
          text>
          <AppIcon name='thumb_up'/>
          <span>Thích</span>
        </Button>
      </div>
      <div class='col-4 p-0'>
        <Button
          class='column-gap-2 flex flex-row justify-content-center py-1 sm:focus:shadow-none w-full'
          text
          @click='showComment = !showComment'>
          <AppIcon name='chat_bubble'/>
          <span>Bình luận</span>
        </Button>
      </div>
      <div class='col-4 p-0'>
        <Button
          class='column-gap-2 flex flex-row justify-content-center py-1 sm:focus:shadow-none w-full'
          text>
          <AppIcon name='share'/>
          <span>Chia sẻ</span>
        </Button>
      </div>
    </div>

    <NewsFeedPostComment v-if='showComment' />
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CHARACTER_LENGTH_SHOW_MORE } from '@/common/constants';
import { convertLinkContent } from '@/common/helpers/utils';
import NewsFeedPostComment from '@/common/views/feed/component/post/NewsFeedPostComment.vue';

const showMoreContent = ref(false);
const showComment = ref(false);

const content = 'genk.vn Một hạt vi mô không có ý thức, nhưng tại sao rất nhiều hạt kết hợp lại thành một con người lại có thể '
    + 'sinh ra ý thức? Đây là một vấn đề triết học đã gây rắc rối cho nhân loại trong nhiều năm.'
    + '\nChúng ta biết rằng mọi thứ trên thế giới đều được cấu tạo từ vô số hạt vi mô, và khi các hạt vi mô khác nhau kết '
    + 'hợp theo tỷ lệ khác nhau sẽ tạo ra những chất hoàn toàn khác nhau.'
    + '\nCon người hiện nay có ý thức, nhưng phải chăng '
    + 'điều đó có nghĩa là những hạt vi mô này thực sự có khả năng tự nhận thức? Đây thực sự là một câu hỏi cực kỳ phức tạp, '
    + 'để tìm ra câu trả lời, có lẽ chúng ta cần phải khám phá nó từ góc độ cơ học lượng tử.';

const cutContent = computed(() => convertLinkContent(showMoreContent.value ? content : `${content.substring(0, CHARACTER_LENGTH_SHOW_MORE)}...`));

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'NewsFeedPost' };
</script>