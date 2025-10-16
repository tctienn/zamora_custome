<template>
  <div class='bg-transparent card h-full p-0 shadow-none'>
    <div class='flex flex-column h-full'>
      <PersonalIncomingSummary
        :bg-class='bgClass'
        class='flex-grow-1'
        :year='year' />
      <!--      <div class="flex gap-3 mt-3">-->
      <!--        <CardCounter-->
      <!--          bgc="bg-green-50"-->
      <!--          class="flex-1"-->
      <!--          :count="overdueResult?.countOverdueDocs || 0"-->
      <!--          type="overdue"/>-->
      <!--        <DeadlineCounter-->
      <!--          v-model:days-before="daysBefore"-->
      <!--          bgc="bg-green-50"-->
      <!--          class="flex-1"-->
      <!--          :count="deadlineResult?.countDeadlineDocs || 0"/>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import {
  countDeadlineDocs,
  countOverdueDocs,
} from '@/apps/document/api/graphql/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CardCounter from '@/apps/document/views/dashboard/components/card/CardCounter.vue';
import DeadlineCounter from '@/apps/document/views/dashboard/components/card/DeadlineCounter.vue';
import PersonalIncomingSummary from '@/apps/document/views/dashboard/components/personal/PersonalIncomingSummary.vue';

defineProps({
  year: {
    type: Number,
    required: true,
  },
  bgClass: {
    type: String,
    default: 'bg-orange-cus',
  },
});

const DEFAULT_DAYS_BEFORE = 3;
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const daysBefore = ref(DEFAULT_DAYS_BEFORE);
const {
  result: overdueResult,
  load: overdueLoad,
  refetch: refetchOverdue,
} = countOverdueDocs(userDeptRole.value);
const {
  result: deadlineResult,
  load: deadlineLoad,
  refetch: refetchDeadline,
} = countDeadlineDocs(daysBefore.value, userDeptRole.value);

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
