<template>
  <div class='flex flex-column gap-3'>
    <FamilyRelationshipInfoTable
      :data='relationshipMySelf'
      :label="t('hrm.relationship.tableWithYourself')"
      :snapshot-id='snapshotId'/>
    <FamilyRelationshipInfoTable
      class='mt-2'
      :data='relationshipHusbandWife'
      :label="t('hrm.relationship.tableWithHusbandWife')"
      :snapshot-id='snapshotId'
      :type='RELATIONSHIP_TYPE.WITH_HUSBAND_WIFE'/>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllFamilyRelationshipInfoBySnapshotId } from '@/apps/hrm/api/graphql/employee-relationship';
import { RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import type { FamilyRelationshipInfo } from '@/apps/hrm/model/employee';
import FamilyRelationshipInfoTable from '@/apps/hrm/views/profile/form/relationship/FamilyRelationshipInfoTable.vue';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
});
const { t } = useI18n();
const relationshipMySelf = ref<FamilyRelationshipInfo[]>([]);
const relationshipHusbandWife = ref<FamilyRelationshipInfo[]>([]);

const {
  onResult: getAllFamilyRelationshipInfoBySnapshotIdResult,
  refetch: getAllFamilyRelationshipInfoBySnapshotIdRefetch
} =
    getAllFamilyRelationshipInfoBySnapshotId(
      props.snapshotId
    );

getAllFamilyRelationshipInfoBySnapshotIdResult((res) => {
  relationshipMySelf.value = res.data.getAllFamilyRelationshipInfoBySnapshotId.filter(
    (item: FamilyRelationshipInfo) => item.relationshipType === RELATIONSHIP_TYPE.WITH_YOURSELF);
  relationshipHusbandWife.value = res.data.getAllFamilyRelationshipInfoBySnapshotId.filter(
    (item: FamilyRelationshipInfo) => item.relationshipType === RELATIONSHIP_TYPE.WITH_HUSBAND_WIFE);
});

const injectedRefreshTable = inject('refreshFamilyRelationshipInfoTable', ref(false));

watch(injectedRefreshTable, (newValue) => {
  if (newValue) {
    getAllFamilyRelationshipInfoBySnapshotIdRefetch();
    injectedRefreshTable.value = false;
  }
});
</script>

<style scoped>

</style>