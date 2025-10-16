<template>
  <UserGroupDialog
    v-model:dialog-visible='visible'
    :header='`${t("Danh sách đã đọc")} (${seenUserIds.length})`'
    :users='users as User[]'
    @hide-dialog='visible=false'>
  </UserGroupDialog>

  <!--  <Dialog-->
  <!--    v-model:visible='visible'-->
  <!--    :dismissable-mask='false'-->
  <!--    :header='`${t("Danh sách đã đọc")} (${seenUserIds.length})`'-->
  <!--    modal-->
  <!--    style='width:30%'>-->

  <!--    <div-->
  <!--      v-for='userId in seenUserIds'-->
  <!--      :key='userId'>-->
  <!--      <AppUser-->
  <!--        name-visible-->
  <!--        :user-id='usersMoreInfo[userId]?.id'>-->
  <!--      </AppUser>-->
  <!--    </div>-->
  <!--  </Dialog>-->
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import UserGroupDialog from '@/common/components/dialog/UserGroupDialog.vue';
import type { User } from '@/common/model/User';

const props = defineProps({
  seenUserIds: {
    type: Array as PropType<string[]>,
    required: true
  }
});
const visible = defineModel<boolean>('visible', { default: false });
const { t } = useI18n();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const users = computed<UserMoreInfo[]>(() => props.seenUserIds
  ?.map(id => usersMoreInfo.value[id])
  .filter(a => a));
</script>

<style scoped>

</style>