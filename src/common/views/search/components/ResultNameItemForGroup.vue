<template>
  <div
    v-for='data in datas'
    :key='data.id'
    class='border-bottom-1 flex flex-row py-1 result-item surface-border'>
    <div
      class='col-6 flex flex-row gap-2'
      @click='selectGroup(data.id)'>
      <img
        alt='avatar'
        class='folder-icon'
        draggable='false'
        :src='urlGateway + data.avatar'
        @error='handleFileImageError'/>

      <span>{{ data.name }}</span>
    </div>

    <div class='col-4 text-center'>
      <span
        v-for='(u,index) in data.users'
        :key='index'>{{ u.fullName }}{{ (index == data.users.length - 1) ? ' ' : ', ' }} </span>
    </div>

    <div class='col-2 text-center'>
      <span>{{ data.groupType }}</span>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { joinGroup } from '@/apps/ecm/api/graphql/group-graphql-api';
import { GATEWAY_URL } from '@/common/api/configService';
import { handleFileImageError } from '@/common/helpers/file-utils';

defineProps({
  datas: {
    type: Array as PropType<UserGroupInterface[]>,
    default: () => []
  }
});
const { t } = useI18n() || {};
const { mutate: joinGroupMutate, onDone: joinGroupDone } = joinGroup();
const router = useRouter();
const urlGateway = GATEWAY_URL + '/files/preview/';
const idGroup = ref();

function selectGroup(id: string) {
  idGroup.value = id;
  joinGroupMutate({ groupId: id });
}

joinGroupDone(() =>
  router.push({
    name: 'EcmGroupMainPage',
    params: { id: idGroup.value }
  }));
</script>

<script lang='ts'>
export default { name: 'ResultNameItemForGroup' };
</script>

<style scoped>

</style>