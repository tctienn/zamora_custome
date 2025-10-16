<template>
  <Panel
    collapsed
    :toggleable='!!group.description'
    @toggle='updateHeightForEcmTemplate'>
    <template #header>
      <span class='font-bold'>{{ `${ t('common.info') } ${ toLower(t('common.group')) }: ${ group.name }` }}</span>
      <EcmGroupMember/>
    </template>
    <template #default>
      <div
        v-if='group.description'
        class='max-h-5rem overflow-auto'>
        <span class='font-bold'>{{ `${ t('common.description') } ${ toLower(t('common.group')) }: ` }}</span>
        <span>{{ group.description }}</span>
      </div>
    </template>

  </Panel>
</template>

<script setup lang='ts'>
import { toLower } from 'lodash';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupMember from '@/apps/ecm/views/group-documents/components/info/EcmGroupMember.vue';
import EventBus from '@/common/helpers/event-bus';
import type { Group } from '@/common/model/group';

const group = inject('group', ref<Group>({} as Group));

const { t } = useI18n();

function updateHeightForEcmTemplate() {
  setTimeout(() => {
    EventBus.emit('correctEcmViewHeight');
  }, 300);
}
</script>

<script lang='ts'>
export default { name: 'EcmGroupInfo' };
</script>