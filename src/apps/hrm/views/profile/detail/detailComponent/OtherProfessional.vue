<template>
  <div class='grid mx-auto pt-2 w-full'>
    <div class='col-12 flex flex-column px-0 py-2'>
      <div
        class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 py-2 surface-0'>
        <div class='font-bold pl-3 text-lg text-primary'>Thông tin khác</div>
      </div>
      <div class='border-1 border-300 border-round-sm h-full py-2 surface-0'>
        <div
          v-for='(data, index) in dataProfession'
          :key='index'
          class='mb-5'>
          <div class='align-items-center flex justify-content-start p-2'>
            <div :class='["border-1 border-dashed py-2 px-4 border-round-3xl", getLeaveType(data.type)?.class]'>
              <span class='text-secondary'>{{ index + 1 }}.</span>
              <span class='text-secondary'>{{ getLeaveType(data.type)?.title }}</span>
            </div>
            <Button
              v-tooltip.top="t('common.action')"
              class='focus:border-0 focus:outline-0 hover:surface-0 ml-2 p-button-text'
              icon='pi pi-ellipsis-v'
              text
              @click='toggleVocationActionMenu($event, data)'/>
          </div>
          <div class='grid ml-2 mr-0 mt-2 pl-5 w-5'>
            <p class='col-5 p-0'>
              {{
                data.type === 'LEAVE' || data.type === 'RETIREMENT' ? t('hrm.profile.otherProfessional.leaveDate') : t('hrm.profile.otherProfessional.leaveFrom')
              }}</p>
            <p class='col-7 font-semibold p-0'>: {{
              data.fromDate ? moment(data.fromDate).format('DD/MM/YYYY') : ''
            }}</p>
            <p
              v-if="data.type !== 'LEAVE' && data.type !== 'RETIREMENT'"
              class='col-5 p-0'>{{ t('hrm.profile.otherProfessional.leaveTo') }}</p>
            <p
              v-if="data.type !== 'LEAVE' && data.type !== 'RETIREMENT'"
              class='col-7 font-semibold p-0'>: {{ data.toDate ? moment(data.toDate).format('DD/MM/YYYY') : '' }}</p>
            <p class='col-5 p-0'>{{ t('hrm.profile.otherProfessional.leaveReason') }}</p>
            <p class='col-7 font-semibold p-0'>: {{ data.description }}</p>
          </div>
          <div class='pl-5 w-8'>
            <p class='font-bold mb-2'>Danh sách giấy tờ kèm theo</p>
            <DataTable
              class='p-datatable-sm'
              responsive-layout='scroll'
              show-gridlines
              striped-rows
              :value='data.files'>
              <template #empty>
                <p class='text-center'>Không có dữ liệu</p>
              </template>
              <Column
                class='text-center'
                :header='t("common.ordinalNumber")'
                style='width: 5%'>
                <template #body='{index}'>
                  {{ index + 1 }}
                </template>
              </Column>
              <Column
                class='w-25rem'
                header='Tên file'>
                <template #body='{ data }'>
                  <p> {{ data.name }}</p>
                </template>
              </Column>
              <Column
                class='w-18rem'
                header='Tập tin đính kèm'>
                <template #body='{ data }'>
                  <div
                    class='align-items-center cursor-pointer flex gap-2'
                    @click='viewDetail(data)'>
                    <img
                      alt=''
                      class='file-extension-icon h-2rem w-2rem'
                      draggable='false'
                      :src='getFileIcon(data.extension)'
                      @error='handleFileImageError'/>
                    <div class='align-content-center line-number-2 word-break-break-word'>
                      {{ data.fileName }}
                    </div>
                  </div>
                </template>
              </Column>
              <Column
                body-class='justify-content-center text-center'
                header='Kích thước'
                style='min-width: 7vw'>
                <template #body='{ data }'>
                  {{ data.size ? convertFileSize(data.size) : '0Kb' }}
                </template>
              </Column>
              <Column
                class='text-center'
                style='min-width: 7vw'>
                <template #body='{ data }'>
                  <ButtonIcon
                    v-tooltip.top="t('common.action')"
                    class='text-color'
                    icon='more_vert'
                    icon-size='1.4'
                    rounded
                    text
                    @click='toggleActionMenu($event, data)'/>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <Menu
    ref='menuActionRef'
    :model='menuVocationActions'
    :popup='true'>
  </Menu>
  <HrmAdditionalProfile
    v-model:visible='additionalProfile'
    :data='selectedData'
    :employee-id='employeeId'/>

</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import { inject, type PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteEmployeeOtherProfession } from '@/apps/hrm/api/graphql/employee-other';
import type { EmployeeOtherProfessionData } from '@/apps/hrm/model/employee';
import HrmAdditionalProfile from '@/apps/hrm/views/profile/dialog/HrmAdditionalProfile.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import {
  convertFileSize,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  professionalData: {
    type: Array as PropType<EmployeeOtherProfessionData[]>,
    default: () => []
  },
  employeeId: {
    type: String,
    default: ''
  },
});

const { t } = useI18n();
const { moment } = useMoment();
const dataProfession = ref<EmployeeOtherProfessionData[]>([]);
/**
 * Get leave type information based on the leave type string.
 * @param {string} leaveType - The type of leave.
 * @returns {Object} An object containing the title and class for the leave type.
 */
const leaveTypeMap: Record<string, { title: string; class: string }> = {
  LEAVE: {
    title: 'Nghỉ việc',
    class: 'leave-red'
  },
  MATERNITY_LEAVE: {
    title: 'Nghỉ thai sản',
    class: 'leave-purple'
  },
  RETIREMENT: {
    title: 'Nghỉ hưu',
    class: 'leave-orange'
  },
  WITHOUT_PAY_LEAVE: {
    title: 'Nghỉ không lương',
    class: 'leave-blue'
  },
  STUDY_LEAVE: {
    title: 'Nghỉ học',
    class: 'leave-green'
  },
  OTHER_LEAVE: {
    title: 'Nghỉ khác',
    class: 'leave-yellow'
  }
};

const getLeaveType = (leaveType: string) => {
  return leaveTypeMap[leaveType] ?? {
    title: 'Không xác định',
    class: 'leave-default'
  };
};
const additionalProfile = ref(false);
const selectedData = ref<any>();
const menuRef = ref();
const menuActionRef = ref();
// eslint-disable-next-line @typescript-eslint/no-empty-function
const refetchData = inject('refetchEmployee', () => {
});
watchEffect(() => {
  dataProfession.value = props.professionalData;
});

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
}

function toggleVocationActionMenu(event: Event, data: any) {
  menuActionRef.value.toggle(event);
  selectedData.value = data;
}

const menuActions = [
  {
    key: 'download',
    label: t('common.download'),
    icon: 'download',
    command: () => {

    },
  },
];

const menuVocationActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      additionalProfile.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      console.log(selectedData.value);
      deleteEmployeeOtherProfession().mutate({ id: selectedData.value.id }).then(() => {
        refetchData();
      }).catch(err => {
        console.error('Error deleting employee other profession:', err);
      });
    },
  }
];

function viewDetail(file: { path: string; name: string; extension: string }) {
  if (!file?.path) {
    return;
  }

  const fileUrl = generatePreviewFileUrl(file.path);
  if (!fileUrl) {
    return;
  }
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  const isViewable = viewableExtensions.includes(file.extension.toLowerCase());

  if (isViewable) {
    window.open(fileUrl, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
</script>

<style scoped>
.leave-red {
  color: var(--text-red);
  border-color: #f87171;
}

.leave-purple {
  color: var(--purple-500);
  border-color: var(--purple-500);
}

.leave-orange {
  color: var(--orange-500);
  border-color: var(--orange-500);
}

.leave-blue {
  color: var(--blue-500);
  border-color: var(--blue-500);
}

.leave-green {
  color: var(--green-500);
  border-color: var(--green-500);
}

.leave-yellow {
  color: var(--yellow-500);
  border-color: var(--yellow-500);
}

.leave-default {
  color: #666;
  border-color: #ccc;
}

</style>