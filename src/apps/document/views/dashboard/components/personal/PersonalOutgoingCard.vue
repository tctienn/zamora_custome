<template>
  <div class='bg-transparent card h-full p-0 shadow-none'>
    <div class='flex flex-column h-full'>
      <PersonalOutgoingSummary
        class='flex-grow-1'
        :year='year' />
      <!--      <div class="flex gap-3 mt-3">-->
      <!--        <CardCounter-->
      <!--          bgc="bg-red-50"-->
      <!--          class="flex-1"-->
      <!--          :count="overdueResult?.countDocOutOverdue || 0"-->
      <!--          type="overdue"/>-->
      <!--        <DeadlineCounter-->
      <!--          v-model:days-before="daysBefore"-->
      <!--          bgc="bg-red-50"-->
      <!--          class="flex-1"-->
      <!--          :count="deadlineResult?.countDocOutDeadline || 0"/>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import {
  countDocOutDeadline,
  countDocOutOverdue,
} from '@/apps/document/api/graphql/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CardCounter from '@/apps/document/views/dashboard/components/card/CardCounter.vue';
import DeadlineCounter from '@/apps/document/views/dashboard/components/card/DeadlineCounter.vue';
import PersonalOutgoingSummary from '@/apps/document/views/dashboard/components/personal/PersonalOutgoingSummary.vue';

defineProps({
  year: {
    type: Number,
    required: true,
  },
});
const DEFAULT_DAYS_BEFORE = 3;
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const daysBefore = ref(DEFAULT_DAYS_BEFORE);

const {
  result: overdueResult,
  load: overdueLoad,
  refetch: refetchOverdue,
} = countDocOutOverdue(userDeptRole.value);
const {
  result: deadlineResult,
  load: deadlineLoad,
  refetch: refetchDeadline,
} = countDocOutDeadline(daysBefore.value, userDeptRole.value);

watch(userDeptRole, (newVal) => {
  daysBefore.value = DEFAULT_DAYS_BEFORE;
  refetchOverdue({ userDeptRole: newVal });
  refetchDeadline({
    daysBefore: daysBefore.value,
    userDeptRole: newVal,
  });
});
watch(daysBefore, (newVal) => {
  refetchDeadline({
    daysBefore: newVal,
    userDeptRole: userDeptRole.value,
  });
});

onMounted(() => {
  overdueLoad();
  deadlineLoad();
});
</script>

<style scoped></style>
