<template>
  <div
    class='p-2'
    :class='GRID_RESPONSIVE_CLASSES_MAX_7'>
    <div
      class='card h-full p-0'>
      <div class='h-10rem relative'>
        <Avatar
          class='group-avatar h-full text-8xl text-white uppercase w-full'
          :image='generateAvatarUrl(group.avatar)'
          :label='group.avatar && showImageAvatar ? "" : extractAvatarLabel(group.name) '
          shape='square'
          :style='group.avatar && showImageAvatar ? {} : {backgroundColor: extractAvatarBackgroundColor(group.name)}'
          @error='onErrorImage'/>

        <ButtonIcon
          v-if='accessAllow'
          class='absolute bg-white m-2 right-0 shadow-1 top-0'
          icon='more_vert'
          outline
          rounded
          severity='secondary'
          text
          @click='emits("show-menu-action", $event)'/>
      </div>

      <div class='flex flex-column px-3 py-2'>
        <div class='column-gap-2 column-gap-2 flex flex-row justify-content-center my-1'>
          <span
            class='align-items-center column-gap-2 flex font-bold line-number-2 text-lg'
            :style='{"color": group.status === ACTIVITY_STATUSES.DEACTIVATE ? "var(--pink-500)" : "inherit"}'>
            <AppIcon
              v-if='group.status === ACTIVITY_STATUSES.DEACTIVATE'
              class='font-normal'
              color='var(--pink-500)'
              name='lock'
              size='1.5'>
            </AppIcon>

            <span>
              <span
                :class='{"cursor-pointer hover:text-primary": accessAllow}'
                @click='accessAllow ? emits("select-group", $event) : () => {}'>
                {{ group.name }}
              </span>

              <AppIcon
                v-if='group.favoriteUserList.find((u: UserLike) => u.id === user.id)'
                class='ml-2'
                color='var(--red-500)'
                :fill='true'
                name='favorite'
                size='1.25'/>
            </span>

          </span>
          <!--          <AppIcon-->
          <!--            v-tooltip.top='t(`common.groupType.${toLower(group.groupType)}`)'-->
          <!--            name='groups'-->
          <!--            size='2'/>-->
        </div>

        <span class='text-center'>
          {{ t("ecm.group.admin") }}
          <strong>{{ groupAdminNames }}</strong>
        </span>
        <!--        <span class='text-center'>-->
        <!--          {{ t("ecm.group.memberCount", {count: group.users.length}) }}-->
        <!--        </span>-->
        <span class='text-center'>
          {{ t("common.group") }} {{ toLower(t(`common.typePrivacy.${toLower(group.typeOfPrivacy)}`)) }}
        </span>
      </div>

      <!--      <template v-if='group.description'>-->
      <!--        <Divider class='my-1'/>-->

      <!--        <div class='px-3 py-2'>-->
      <!--          {{ group.description }}-->
      <!--        </div>-->
      <!--      </template>-->
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
import { ACTIVITY_STATUSES, GRID_RESPONSIVE_CLASSES_MAX_7 } from '@/common/constants';
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

const accessAllow = computed(() => props.group?.status === ACTIVITY_STATUSES.ACTIVE
    || props.group?.status === ACTIVITY_STATUSES.DEACTIVATE && map(filter(props.group?.users, ['level', Level[Level.MANAGE]]), 'id').includes(user.value.id as string));

const showImageAvatar = ref(true);
const { user } = storeToRefs(useUserStore());

function onErrorImage() {
  showImageAvatar.value = false;
}

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'EcmGroupGridItem' };
</script>