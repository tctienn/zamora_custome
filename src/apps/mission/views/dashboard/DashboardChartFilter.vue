<template>
  <div class='align-items-center flex gap-5 mb-3 mt-2'>
    <div class='align-items-center flex gap-2'>
      <span class='font-bold text-xl'>Chọn đơn vị</span>
      <Dropdown
        v-model='departmentId'
        class='w-30rem'
        
        option-label='name'
        option-value='id'
        :options='organizations'
        show-clear>
        <template #option='{ option }'>
          <div
            class='flex gap-2 items-center relative'
            :class="{ 'text-blue font-semibold': option.id === departmentId }">
            <AppIcon
              v-if='option.id === departmentId'
              class='absolute'
              name='check'
              size='1.3'/>
            <span class='ml-4'>{{ option.name }}</span>
          </div>
        </template>
      </Dropdown>
    </div>
    <div class='align-items-center flex gap-2'>
      <span class='font-bold text-xl'>Chọn năm </span>
      <NamedInputCalendar
        v-model='yearModel'
        class='w-14rem'
        date-format='yy'
        icon-display='input'
        :select-other-months='true'
        show-icon
        view='year'/>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';

import { RoleType } from '../../model/job/job';

const organizations = ref([]);
const yearModel = defineModel<Date | null>('yearModel', { default: new Date });
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const departmentId = defineModel<string | null>('departmentId', { default: null });

if(userDeptRole.value.roleId === RoleType.TRUONG_PHONG){
  departmentId.value = userDeptRole.value.deptId;
}
getAllOrganizationGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic || [];
});
</script>

<style scoped>
.text-blue {
  color: #0d99ff;
}
</style>