<template>
  <div class='flex flex-column row-gap-2'>
    <router-link
      v-for='group in groups'
      :key='group.id'
      class='align-items-center color-inherit column-gap-2 cursor-pointer flex flex-row hover:surface-ground'
      target='_blank'
      :to='{name: "EcmGroupMainPage", params: {id: group.id}}'>
      <div class='flex'>
        <AppAvatar
          :avatar='generateAvatarUrl(group.avatar)'
          :label='group.name'/>
      </div>

      <div class='flex flex-column flex-grow-1 overflow-hidden row-gap-1'>
        <span class='color-link font-bold line-number-1 w-full'>{{ group.name }}
        </span>
        <small class='font-italic opacity-80'>
          <!--        TODO: fix total docs-->
          <!--          ${t("ecm.widget.group.files")}: ${group.totalDocument} - -->
          {{
            `
           ${t('ecm.widget.group.member')}: ${group.users.length} -
           ${t('ecm.widget.group.manager')}: ${getManageName(group.users)}`
          }}

        </small>
      </div>

      <!--    <div class=''>-->
      <!--      <ButtonIcon-->
      <!--        class='p-1'-->
      <!--        icon='more_vert'-->
      <!--        rounded-->
      <!--        text-->
      <!--        @click='emits("toggle-menu", $event, group)'-->
      <!--      />-->
      <!--    </div>-->
    </router-link>
  </div>
</template>

<script setup lang='ts'>
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { Level } from '@/apps/admin/model/userGroup';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import type { Group, UserLevel } from '@/common/model/group';

defineProps({
  groups: {
    type: Array as PropType<Group[]>,
    default: () => []
  }
});

const { t } = useI18n();

function getManageName(users: UserLevel[]) {
  const filterUser: UserLevel[] = users.filter(item => {
    return item.level === Level[Level.MANAGE];
  });
  return filterUser.map(item => item.fullName).join(', ');
}
</script>

<script lang='ts'>
export default { name: 'EcmMyGroupWidgetItem' };
</script>