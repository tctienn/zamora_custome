<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt='{
      header: {
        class: "p-0",
      },
      content: {
        class: "flex gap-1"
      }
    }'
    :show-close-icon='false'
    style='width:100rem'>
    <template #header>
      <div class='mb-2 w-full'>
        <div class='align-items-center border-300 border-bottom-1 flex justify-content-between p-3 w-full'>
          <div class='align-items-center flex gap-1'>
            <Button
              icon='pi pi-arrow-left'
              severity='danger'
              @click='hideSidebar'/>
            <SplitButton
              class='mr-2'
              :model='viewProfileHis'>
              <span class='align-items-center flex font-bold gap-2'>
                <AppIcon
                  name='source'
                  size='1.3'/>
              </span>
              <template #item='{item}'>
                <div class='flex justify-content-between p-2'>
                  <span>{{ item.label }}</span>
                  <span v-if='item.id === model.snapshotId'><i :class='item.icon'></i></span>
                </div>
              </template>
            </SplitButton>
          </div>
          <div>
            <SplitButton
              class='mr-2'
              label='Xem và in lý lịch'
              :model='items'>
              <template #icon>
                <i class='mr-2 pi pi-print'></i>
              </template>
            </SplitButton>
            <Button
              v-tooltip='`Nhân sự liên quan`'
              class='border-400'
              icon='pi pi-align-justify'
              outlined
              @click='showRightContent = !showRightContent'/>
          </div>
        </div>

        <div
          class='flex gap-1 px-3 w-full'
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
          class='ml-3 mr-4'>
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
            :header='t("hrm.profile.otherFile")'
            :pt='{
              headertitle: {
                class: "font-normal"
              }
            }'
            @click='active = 6'/>
          <TabPanel
            v-if='otherProfessionData.length > 0'
            header='Thông tin khác'
            :pt='{
              headertitle: {
                class: "font-normal"
              }
            }'
            @click='active = 7'/>
        </TabView>
      </div>
    </template>
    <template v-if='loadingData'>
      <div class='flex flex-wrap gap-2 h-full w-full'>
        <div class='col-9'>
          <Skeleton class='mb-2'></Skeleton>
          <Skeleton
            class='mb-2'
            width='10rem'></Skeleton>
          <Skeleton
            class='mb-2'
            width='5rem'></Skeleton>
          <Skeleton
            class='mb-2'
            height='2rem'></Skeleton>
          <Skeleton
            height='4rem'
            width='10rem'></Skeleton>
          <Skeleton class='mb-2'></Skeleton>
          <Skeleton
            class='mb-2'
            width='10rem'></Skeleton>
          <Skeleton
            class='mb-2'
            width='5rem'></Skeleton>
          <Skeleton
            class='mb-2'
            height='2rem'></Skeleton>
          <Skeleton
            height='4rem'
            width='10rem'></Skeleton>
          <Skeleton class='mb-2'></Skeleton>
          <Skeleton
            class='mb-2'
            width='10rem'></Skeleton>
          <Skeleton
            class='mb-2'
            width='5rem'></Skeleton>
          <Skeleton
            class='mb-2'
            height='2rem'></Skeleton>
          <Skeleton
            height='4rem'
            width='10rem'></Skeleton>
          <Skeleton class='mb-2'></Skeleton>
          <Skeleton
            class='mb-2'
            width='10rem'></Skeleton>
          <Skeleton
            class='mb-2'
            width='5rem'></Skeleton>
          <Skeleton
            class='mb-2'
            height='2rem'></Skeleton>
          <Skeleton
            height='4rem'
            width='10rem'></Skeleton>
        </div>
        <div class='col-2'>
          <div>
            <Skeleton class='mb-2'></Skeleton>
            <Skeleton
              class='mb-2'
              width='10rem'></Skeleton>
            <Skeleton
              class='mb-2'
              width='5rem'></Skeleton>
            <Skeleton
              class='mb-2'
              height='2rem'></Skeleton>
            <Skeleton
              height='4rem'
              width='10rem'></Skeleton>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <SummaryDetail
        v-if='active === 0'
        v-model='model'
        :active-right-bar='activeRightBar'
        :employee-id='model?.employeeId'
        style='width: calc(100% - 60px)'/>
      <ReceivingDocDetail
        v-else-if='active === 5'
        :employee-id='model.employeeId'
        :snapshot-id='model.snapshotId'/>
      <div
        v-else-if='active === 2'
        class='overflow-auto w-full'>
        <TrainingProcessDetail
          :employee-id='model.employeeId'
          :snapshot-id='model.snapshotId'/>
      </div>

      <ProfessionalSkills
        v-else-if='active === 3'
        :snapshot-id='model.snapshotId'/>
      <div
        v-else-if='active === 4'
        class='border-1 border-300 border-round-sm px-3 py-2 w-table-over'>
        <HealthInformation
          :employee-id='model.employeeId'
          :is-view='true'
          :snapshot-id='model.snapshotId'/>
      </div>

      <AssignmentPlanning
        v-else-if='active === 1'
        :employee-id='model.employeeId'/>
      <OtherProfessional
        v-else-if='active === 7'
        :employee-id='model.employeeId'
        :professional-data='otherProfessionData'/>

      <ProfileAttachment
        v-else-if='active === 6'
        :employee-id='model.employeeId'/>
      <div
        v-if="showRightContent && active === 0 && activeRightBar === 'article'"
        class='border-1 border-300 border-round-sm flex flex-column ml-auto mr-2'
        style='width: 27rem; position: sticky; top: 0; z-index: 1'>
        <RelatedEmployeeBox
          class='w-full'
          :employee-id='model?.employeeId'/>
      </div>
    </template>
  </Sidebar>

  <DialogViewFile
    v-if='visibleViewFile'
    v-model='visibleViewFile'
    :employee-id='model?.employeeId ?? ""'
    :file-blob='fileToView'
    :type='viewType'
    :visible='visibleViewFile'
    @hide-dialog='visibleViewFile = false'/>
</template>

<script lang='ts' setup>
import type { MenuItem } from 'primevue/menuitem';
import Skeleton from 'primevue/skeleton';
import { inject, nextTick, onMounted, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getOtherProfessionByEmployeeId } from '@/apps/hrm/api/graphql/employee-other';
import {
  findEmployeeByIdAndSnapshot,
  findPersonalProfileHistory,
  viewPdfExportFileEmployee
} from '@/apps/hrm/api/rest/employee';
import type { Employee, EmployeeOtherProfessionData, ProfilesHistory } from '@/apps/hrm/model/employee';
import AssignmentPlanning from '@/apps/hrm/views/profile/detail/AssignmentPlanning.vue';
import RelatedEmployeeBox from '@/apps/hrm/views/profile/detail/component/RelatedEmployeeBox.vue';
import OtherProfessional from '@/apps/hrm/views/profile/detail/detailComponent/OtherProfessional.vue';
import ProfileAttachment from '@/apps/hrm/views/profile/detail/detailComponent/ProfileAttachment.vue';
import SummaryDetail from '@/apps/hrm/views/profile/detail/detailComponent/SummaryDetail.vue';
import DialogViewFile from '@/apps/hrm/views/profile/detail/DialogViewFileProfile.vue';
import HealthInformation from '@/apps/hrm/views/profile/detail/HealthInformation.vue';
import ProfessionalSkills from '@/apps/hrm/views/profile/detail/ProfessionalSkills.vue';
import ReceivingDocDetail from '@/apps/hrm/views/profile/detail/ReceivingDocDetail.vue';
import TrainingProcessDetail from '@/apps/hrm/views/profile/detail/TrainingProcessDetail.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

defineProps({
  loadingData: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['update:profile']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const needRefresh = inject('needRefresh', ref(false));
const resetData = inject('resetData', () => void {});
const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});
const viewType = ref<string>('');
const active = ref(0);
const visibleViewFile = ref(false);
const showRightContent = ref(true);
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
const viewProfileHis = ref<MenuItem[]>([]);

function hideSidebar() {
  visible.value = false;
  needRefresh.value = false;
  resetData();
}

const items: MenuItem[] = [
  {
    label: 'Sơ yếu lý lịch (Mẫu 2C-BNV/2008)',
    icon: 'pi pi-file',
    command: () => {
      viewDetail('MINISTRY_OF_INTERIOR');
      viewType.value = 'MINISTRY_OF_INTERIOR';
    }

  },
  {
    label: 'Sơ yếu lý lịch (Mẫu 2C/TCTW-98)',
    icon: 'pi pi-file',
    command: () => {
      viewDetail('CENTRAL_ORGANIZATION');
      viewType.value = 'CENTRAL_ORGANIZATION';
    }
  },
];

function viewDetail(type: string) {
  viewPdfExportFileEmployee(model.value.employeeId ?? '', type)
    .then(file => {
      if (file) {
        openPDF(file);
      }
    });
}

const fileToView = ref<Blob | null>(null);

const handleClickIcon = (icon: string) => {
  activeRightBar.value = icon;
  if (active.value !== 0) {
    active.value = 0;
  }
};

function openPDF(file: Blob) {
  if (!(file instanceof Blob)) {
    throw new Error('Invalid file type');
  }
  fileToView.value = file;
  visibleViewFile.value = true;
}

const fetchRecordHistories = async (employeeId: string) => {
  // Gọi API thật tại đây
  const records = await findPersonalProfileHistory(employeeId);
  // Sắp xếp theo createdTime tăng dần (bản gốc lên đầu)
  const sortedRecords = [...records || []].sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
    return timeA - timeB;
  });

  // Gắn version và command
  if (sortedRecords.length === 1) {
    viewProfileHis.value = [{
      ...sortedRecords[0],
      icon: 'pi pi-check',
      label: 'Hồ sơ gốc',
      version: 1,
      command: () => loadRecordDetail(sortedRecords[0])
    }];
  } else {
    const minOrder = Math.min(...sortedRecords.map(r => Number(r.orderNumber) || Infinity));

    viewProfileHis.value = sortedRecords.map((item: ProfilesHistory, index) => {
      const order = Number(item.orderNumber);
      return {
        ...item,
        icon: 'pi pi-check',
        label: order === minOrder
          ? 'Hồ sơ gốc'
          : `Lần thay đổi thứ ${index + 1}`,
        version: index + 1, // Lần thay đổi thứ mấy (1 là bản gốc)
        command: () => loadRecordDetail(item)
      };

    });
  }
};

const loadRecordDetail = async (item: ProfilesHistory) => {
  if (!item?.employeeId) {
    return;
  }
  try {
    const res = await findEmployeeByIdAndSnapshot(item.employeeId, item.id); // gọi lại API theo id của bản ghi lịch sử
    if (res) {
      emits('update:profile', res);
    }
  } finally {

  }
};
const otherProfessionData = ref<EmployeeOtherProfessionData[]>([]);
let refetchOtherProfession: (() => Promise<any> | undefined) | null = null;

const refetchEmployee = async () => {
  if (!model.value.employeeId || !refetchOtherProfession) {
    return;
  }
  try {
    const { data } = await refetchOtherProfession();

    if (data?.findVacationByEmployeeId) {
      otherProfessionData.value = data.findVacationByEmployeeId;
    }
  } catch (error) {
  }
};

provide('refetchEmployee', refetchEmployee);

onMounted(async () => {
  await nextTick();

  if (model.value.employeeId) {
    await fetchRecordHistories(model.value.employeeId);

    const {
      onResult: getOtherProfessionData,
      refetch
    } =
      getOtherProfessionByEmployeeId(model.value.employeeId);

    if (refetch) {
      refetchOtherProfession = () => refetch();
    }

    getOtherProfessionData((res) => {
      otherProfessionData.value = res.data.findVacationByEmployeeId;
    });
  }
});
</script>

<style scoped>
:deep(.p-tabview-nav-link) {
  padding: 1rem;
}

:deep(.p-tabview-panels) {
  padding: unset;
}

.w-table-over {
  width: calc(100% - 52px) !important;
}

.spinner-custom {
  width: 50px;
  height: 50px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

:deep(.custom-mask) {
  background-color: rgba(0, 0, 0, 0.1) !important;
  animation: none !important; /* hoặc tùy chỉnh lại animation */
}

.list-icon-item:hover {
  background: #E6E6E6;
}

.gray {
  color: #6C757D
}
</style>