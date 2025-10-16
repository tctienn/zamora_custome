<template>
  <div class='flex justify-content-center'>
    <div
      v-if='!avatar || error'
      class='p-avatar relative size text-color'
      :class='avatarWithLabelClass'
      :style='{ backgroundColor: backgroundColor }'>
      <span class='p-avatar-text text-size text-white'>
        {{ extractAvatarLabel(label, 1) }}
      </span>
      <img
        v-if='showBirthdayIcon'
        alt='Birthday Icon'
        class='birthday-icon'
        src='@/common/assets/images/birthday.png'/>
    </div>

    <!--    <Avatar-->
    <!--      v-else-->
    <!--      class='object-fit-cover relative'-->
    <!--      :class='avatarClass'-->
    <!--      :image='avatarImg'-->
    <!--      :pt='{-->
    <!--        root: {-->
    <!--          style: {-->
    <!--            width: imageSize,-->
    <!--            height: imageSize-->
    <!--          }-->
    <!--        }-->
    <!--      }'-->
    <!--      :shape='shape'-->
    <!--      :style-avatar='styleAvatar'-->
    <!--      @error='avatarError'>-->
    <!--      <template v-if='showBirthdayIcon'>-->
    <!--        <img-->
    <!--          alt='Birthday icon'-->
    <!--          class='birthday-icon'-->
    <!--          src='@/common/assets/images/birthday.png'/>-->
    <!--      </template>-->
    <!--    </Avatar>-->
    <div
      v-else
      class='relative'
      :style='{ width: imageSize, height: imageSize }'>
      <Avatar
        class='object-fit-cover'
        :class='avatarClass'
        :image='avatarImg'
        :pt='{
          root: {
            style: {
              width: imageSize,
              height: imageSize,
            }
          }
        }'
        :shape='shape'
        :style-avatar='styleAvatar'
        @error='avatarError'/>
      <img
        v-if='showBirthdayIcon'
        alt='Birthday Icon'
        class='birthday-icon'
        src='@/common/assets/images/birthday.png'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { parseInt, round, toNumber } from 'lodash';
import { computed, type PropType, type StyleValue, watch } from 'vue';

import { extractAvatarBackgroundColor, extractAvatarLabel } from '@/common/helpers/utils';

const props = defineProps({
  avatar: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '3'
  },
  label: {
    type: String,
    default: ''
  },
  shape: {
    type: String as PropType<'circle' | 'square'>,
    default: 'circle'
  },
  fit: {
    type: Boolean,
    default: false
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  styleAvatar: {
    type: Object as PropType<StyleValue>,
    default: () => ({})
  },
  showBirthdayIcon: {
    type: Boolean,
    default: false
  }
});
const error = defineModel('error', {
  type: Boolean,
  default: false
});

function avatarError() {
  error.value = true;
}

const backgroundColor = computed(() => extractAvatarBackgroundColor(props.label));

const avatarImg = computed(() => props.avatar && !error.value ? props.avatar : '/images/avatar/default_avatar.jpg');

const imageSize = computed(() => {
  const size = toNumber(props.size);
  return isNaN(size) ? props.size : `${props.size}rem`;
});

const fontSize = computed(() => {
  const split = props.size.match(/[\d.]+|\D+/g);
  if (split?.length) {
    let size = parseInt(split[0]);
    if (isNaN(size)) {
      return 'inherit';
    } else {
      size = round(size / 2.2, 2);
      return `${size}${split[1] ? split[1] : 'rem'}`;
    }
  } else {
    return 'inherit';
  }
});

const avatarClass = computed(() => ({
  'border-2': props.shape === 'circle',
  'border-round-sm': props.shape === 'square',
  'border-300': !props.isHighlight,
  'border-avt-highlight': props.isHighlight
}));

const avatarWithLabelClass = computed(() => ({
  ...avatarClass.value,
  'p-avatar-circle': props.shape === 'circle',
  'p-avatar-square border-round-sm': props.shape === 'square',
  'w-full': props.fit
}));

watch(() => props.avatar, () => {
  error.value = !props.avatar;
});
</script>

<script lang='ts'>
export default { name: 'AppAvatar' };
</script>

<style scoped>
.size {
  width: v-bind(imageSize);
  height: v-bind(imageSize);
}

.text-size {
  font-size: v-bind(fontSize);
  text-transform: uppercase;
}

.birthday-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: white;
  padding: 0.1rem;
  box-shadow: 0 0 0 2px white;
}

.border-avt-highlight {
  border-color: #FEA547
}
</style>
