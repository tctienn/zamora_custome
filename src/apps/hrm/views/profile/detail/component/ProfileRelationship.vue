<template>
  <span
    v-if='relationshipMySelf.length > 0'
    class='bg-yellow-50 border-1 border-round-2xl border-yellow-400 font-bold px-3 py-1'>A. Với bản thân</span>
  <div class='formgrid grid'>
    <RelationshipInfo
      v-for='(item, index) in relationshipMySelf'
      :key='index'
      class='col-6'
      :index='index + 1'
      :model='item'/>
  </div>

  <span
    v-if='relationshipHusbandWife.length > 0'
    class='bg-yellow-50 border-1 border-round-2xl border-yellow-400 font-bold px-3 py-1'>B. Về bên Vợ/Chồng</span>
  <div class='formgrid grid'>
    <RelationshipInfo
      v-for='(item, index) in relationshipHusbandWife'
      :key='index'
      class='col-6'
      :index='index + 1'
      :model='item'/>
  </div>
</template>

<script setup lang='ts'>

import { ref } from 'vue';

import { getAllFamilyRelationshipInfoBySnapshotId } from '@/apps/hrm/api/graphql/employee-relationship';
import { RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import type { FamilyRelationshipInfo } from '@/apps/hrm/model/employee';
import RelationshipInfo from '@/apps/hrm/views/profile/detail/component/RelationshipInfo.vue';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  }
});

const relationshipMySelf = ref<FamilyRelationshipInfo[]>([]);
const relationshipHusbandWife = ref<FamilyRelationshipInfo[]>([]);

const { onResult: getAllFamilyRelationshipInfoBySnapshotIdResult } =
  getAllFamilyRelationshipInfoBySnapshotId(
    props.snapshotId
  );

getAllFamilyRelationshipInfoBySnapshotIdResult((res) => {
  relationshipMySelf.value = res.data.getAllFamilyRelationshipInfoBySnapshotId.filter(
    (item: FamilyRelationshipInfo) => item.relationshipType === RELATIONSHIP_TYPE.WITH_YOURSELF);
  relationshipHusbandWife.value = res.data.getAllFamilyRelationshipInfoBySnapshotId.filter(
    (item: FamilyRelationshipInfo) => item.relationshipType === RELATIONSHIP_TYPE.WITH_HUSBAND_WIFE);
});
</script>

<style scoped>

</style>