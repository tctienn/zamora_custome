<template>
  <div
    class='column-gap-2 flex flex-row'
    :style='level > 0 ? `margin-left: ${level * 3}rem` : ""'>
    <AppAvatar/>
    <div class='border-round-2xl flex flex-column p-2 surface-ground'>
      <router-link
        class='font-bold'
        :to='{name: "NewsFeed"}'>Đỗ Quang Trường
      </router-link>
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

      <div class='align-items-center column-gap-2 flex flex-row'>
        <span>5 giờ</span>
        <Button
          class='px-2 py-1 sm:focus:shadow-none'
          label='Thích'
          severity='secondary'
          text/>
        <Button
          class='px-2 py-1 sm:focus:shadow-none'
          label='Trả lời'
          severity='secondary'
          text/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CHARACTER_LENGTH_SHOW_MORE } from '@/common/constants';
import { convertLinkContent } from '@/common/helpers/utils';

defineProps({
  level: {
    type: Number,
    default: 0
  }
});

const { t } = useI18n();

const showMoreContent = ref(false);

const content = 'Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn.\n'
    + 'Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn.\n'
    + 'Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn.\n'
    + 'Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn.\n'
    + 'Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. Đây là 1 đoạn bình luận dài vô cùng dài luôn. ';

const cutContent = computed(() => convertLinkContent(showMoreContent.value ? content : `${content.substring(0, CHARACTER_LENGTH_SHOW_MORE)}...`));

</script>

<script lang='ts'>
export default { name: 'NewsFeedPostCommentItem' };
</script>