<template>
  <div class='flex flex-row w-full'>
    <div
      class='align-items-center flex flex-row list-item'
      @contextmenu.prevent='onContextMenu'>
      <div
        class='align-items-center col-3 column-gap-2 flex flex-row p-3'>
        <Avatar
          class='group-avatar h-2rem text-lg text-white uppercase w-2rem'
          :image='generateAvatarUrl(group.avatar)'
          :label='group.avatar && showImageAvatar ? "" : extractAvatarLabel(group.name) '
          shape='square'
          :style='group.avatar && showImageAvatar ? {} : {backgroundColor: extractAvatarBackgroundColor(group.name)}'
          @error='onErrorImage'/>
        <span
          class='font-bold line-number-2'
          :class='{"cursor-pointer hover:text-primary": accessAllow}'
          @click='accessAllow ? emits("select-group", $event) : () => {}'>{{ group.name }}</span>
        <AppIcon
          v-if='group.favoriteUserList.find((u: UserLike) => u.id === user.id)'
          color='var(--red-500)'
          :fill='true'
          name='favorite'
          size='1.25'/>
      </div>
      <div class='col-1 p-3'>
        {{ t(`common.groupType.${toLower(group.groupType)}`) }}
      </div>
      <div class='col-2 p-3 text-center'>
        {{ groupAdminNames }}
      </div>
      <!--      <div class='col-1 p-3 text-center'>-->
      <!--        {{ group.users.length }}-->
      <!--      </div>-->
      <div class='col-2 p-3 text-center'>
        <span
          class='status-badge'
          :class='`status-${toLower(group.status)}`'>{{
            group.status ? t(`common.statuses.${toLower(group.status)}`) : ''
          }}</span>
      </div>
      <div class='col-3 p-3'>
        {{ group.description }}
      </div>
    </div>

    <div class='my-auto p-3 text-center w-5rem'>
      <ButtonIcon
        v-if='accessAllow'
        icon='more_vert'
        outline
        rounded
        severity='secondary'
        text
        @click='emits("show-menu-action", $event)'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { filter, map, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserLike } from '@/apps/admin/model/userGroup';
import { Level } from '@/apps/admin/model/userGroup';
import { ACTIVITY_STATUSES } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { extractAvatarBackgroundColor, extractAvatarLabel } from '@/common/helpers/utils';
import type { Group } from '@/common/model/group';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  group: {
    type: Object as PropType<Group>,
    default: {} as Group
  },
  groupAdminNames: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['select-group', 'show-menu-action']);
const { user } = storeToRefs(useUserStore());
const { t } = useI18n();
const accessAllow = computed(() => props.group?.status === ACTIVITY_STATUSES.ACTIVE
    || props.group?.status === ACTIVITY_STATUSES.DEACTIVATE && map(filter(props.group?.users, ['level', Level[Level.MANAGE]]), 'id').includes(user.value.id as string));

const showImageAvatar = ref(true);

function onErrorImage() {
  showImageAvatar.value = false;
}

function onContextMenu(event: Event) {
  emits('show-menu-action', event);
}

</script>

<script lang='ts'>
export default { name: 'EcmGroupListItem' };
</script>

<style scoped lang='scss'>
:deep(.list-item) {
  width: calc(100% - 5rem);
}
</style>
