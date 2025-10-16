<template>
  <div
    class='flex gap-1 mb-2 user-profile w-full'
    style='background: #EEF2F7'>
    <div
      v-for='icon in icons'
      :key='icon.icon'
      class='align-items-center cursor-pointer flex flex-column justify-content-center list-icon-item px-1 py-2'
      :class='activeRightBar === icon.icon && "bg-primary"'
      @click='handleClickIcon(icon.icon)'>
      <AppIcon
        v-tooltip.left='icon.tooltip'
        :class='activeRightBar === icon.icon ? "text-white" : "gray"'
        :name='icon.icon'
        size='1.8'/>
      <div
        class='font-bold px-2'
        :class='activeRightBar === icon.icon ? "text-white" : "gray"'>{{ icon.tooltip }}
      </div>
    </div>
  </div>
  <TabView
    v-if='activeRightBar === icons[0].icon'
    v-model:activeIndex='active'
    class='mb-2'>
    <TabPanel
      :header="t('hrm.profile.type.summary')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 0'/>
    <TabPanel
      :header="t('hrm.profile.type.assignmentPlanning')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 1'/>
    <TabPanel
      :header="t('hrm.profile.type.trainingProcess')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 2'/>
    <TabPanel
      :header="t('hrm.profile.type.skills')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 3'/>
    <TabPanel
      :header="t('hrm.profile.type.health')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 4'/>
    <TabPanel
      :header="t('hrm.profile.type.receptionDocuments')"
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 5'/>
    <TabPanel
      v-if='otherProfessionData.length > 0'
      header='Thông tin khác'
      :pt='{
        headertitle: {
          class: "font-normal"
        }
      }'
      @click='active = 6'/>
  </TabView>
  <div class='flex gap-2'>
    <div class='w-full'>
      <SummaryDetail
        v-if='active === 0'
        v-model='userData'
        :active-right-bar='activeRightBar'
        class='w-full'
        :employee-id='userData.employeeId'/>
      <ReceivingDocDetail
        v-else-if='active === 5'
        :snapshot-id='userData.snapshotId'/>
      <div
        v-else-if='active === 2 && userData.employeeId'
        class='overflow-auto w-full'>
        <TrainingProcessDetail
          :employee-id='userData.employeeId'
          :snapshot-id='userData.snapshotId'/>
      </div>
      <HealthTab
        v-else-if='active === 4'
        class='mx-auto my-2 p-2 surface-0'
        :is-view='true'
        :snapshot-id='userData.snapshotId'/>
      <ProfessionalSkills
        v-else-if='active === 3'
        :snapshot-id='userData.snapshotId'/>
      <AssignmentPlan
        v-else-if='active === 1'
        class='flex mx-auto my-2 p-2 surface-0'
        :employee-id='userData.employeeId'/>
      <OtherProfessional
        v-else-if='active === 6'
        class='mx-0 my-2 p-2 surface-0'
        :employee-id='userData.employeeId'
        :professional-data='otherProfessionData'/>
    </div>
    <div style='width: 30vw'>
      <div class='p-2 surface-card'>
        <div class='font-bold text-primary text-xl'>
          {{ t('hrm.salary.systemWarning') }}
        </div>
        <div
          class='border-bottom-1 surface-border'
          style='margin: 0.5rem -0.5rem'></div>
        <div style='height: 63vh'>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { nextTick, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getOtherProfessionByEmployeeId } from '@/apps/hrm/api/graphql/employee-other';
import type { Employee, EmployeeOtherProfessionData } from '@/apps/hrm/model/employee';
import OtherProfessional from '@/apps/hrm/views/profile/detail/detailComponent/OtherProfessional.vue';
import SummaryDetail from '@/apps/hrm/views/profile/detail/detailComponent/SummaryDetail.vue';
import ProfessionalSkills from '@/apps/hrm/views/profile/detail/ProfessionalSkills.vue';
import ReceivingDocDetail from '@/apps/hrm/views/profile/detail/ReceivingDocDetail.vue';
import TrainingProcessDetail from '@/apps/hrm/views/profile/detail/TrainingProcessDetail.vue';
import HealthTab from '@/apps/hrm/views/profile/form/health/HealthTab.vue';
import AssignmentPlan from '@/apps/hrm/views/userProfile/personal/AssignmentPlan.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  oldSnapshotId: {
    type: String,
    default: ''
  }
});
const { t } = useI18n();
const active = ref(0);
const userData = defineModel('model', {
  type: Object as PropType<Employee>,
  default: {} as Employee
});
const otherProfessionData = ref<EmployeeOtherProfessionData[]>([]);
const icons = [
  {
    icon: 'article',
    tooltip: 'Hồ sơ'
  },
  {
    icon: 'description',
    tooltip: 'Hợp đồng lao động'
  },
  {
    icon: 'mark_email_read',
    tooltip: 'Quyết định'
  },
  {
    icon: 'free_cancellation',
    tooltip: 'Công & phép'
  },
  {
    icon: 'request_page',
    tooltip: 'Lương & Thuế'
  },
  {
    icon: 'admin_panel_settings',
    tooltip: 'Bảo hiểm xã hội'
  },
  {
    icon: 'star_border',
    tooltip: 'Khen thưởng & Kỷ luật'
  },
  {
    icon: 'school',
    tooltip: 'Đào tạo'
  },
  {
    icon: 'folder_open',
    tooltip: 'Tệp số hóa'
  },
];
const activeRightBar = ref<any>(icons[0].icon);

const handleClickIcon = (icon: string) => {
  activeRightBar.value = icon;
  if (active.value !== 0) {
    active.value = 0;
  }
};

onMounted(async () => {
  await nextTick();

  if (userData.value.employeeId) {

    const {
      onResult: getOtherProfessionData,
      refetch
    } =
      getOtherProfessionByEmployeeId(userData.value.employeeId);

    getOtherProfessionData((res) => {
      otherProfessionData.value = res.data.findVacationByEmployeeId;
    });
  }
});
</script>

<style lang='scss' scoped>
:deep(.p-tabview-nav-link) {
  border-radius: 0 !important;
}

:deep(.p-tabview-panels) {
  padding: 0 !important;
}

.gray {
  color: #6C757D
}
</style>
