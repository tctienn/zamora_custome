<template>
  <div
    v-if='groupAggregation.users'
    class='align-items-center column-gap-3 flex flex-row'>
    <span class='font-bold'>{{ `${ t('ecm.group.membersInGroup') } (${ groupAggregation.users.length }): ` }}</span>
    <div class='flex flex-row flex-wrap'>
      <AppUser
        v-for='(user, index) in slice(groupAggregation.users, 0, NUMBER_MEMBERS <= groupAggregation.users.length ? NUMBER_MEMBERS : groupAggregation.users.length)'
        :key='index'
        avatar-only
        overlay-visible
        :user-id='user.userId'/>

      <div
        v-if='groupAggregation.users.length > NUMBER_MEMBERS'
        class='align-self-center'>
        <small
          class='cursor-pointer font-italic underline'
          @click='memberDialogVisible = true'>
          {{ `${ toLower(t('common.viewMore')) }` }}
        </small>
      </div>
    </div>
  </div>

  <EcmGroupMemberDialog
    v-if='memberDialogVisible'
    :dialog-visible='memberDialogVisible'
    @hide-dialog='memberDialogVisible = false'/>
</template>

<script setup lang='ts'>
import { slice, toLower } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getListUser } from '@/apps/ecm/api/graphql/group-graphql-api';
import EcmGroupMemberDialog from '@/apps/ecm/views/group-documents/components/info/EcmGroupMemberDialog.vue';
import type { GroupAggregation } from '@/common/model/group';

const route = useRoute();
const { id } = route.params;
const NUMBER_MEMBERS = 5;
const groupAggregation = ref<GroupAggregation>({} as GroupAggregation);
const memberDialogVisible = ref(false);
const { t } = useI18n();

getListUser(id as string).onResult((res) => {
  groupAggregation.value = res.data.getListUser;
});
</script>

<script lang='ts'>
export default { name: 'EcmGroupMember' };
</script>