<template>
  <Sidebar
    v-model:visible='visibleDialog'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style : {width: "75vw"}}'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    @hide='emits("hide-dialog")'>
    <template #header>
      <div
        class='align-items-center flex justify-content-between w-full'
        style='z-index: 1000'>
        <div class='flex gap-1'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='emits("hide-dialog")'/>

          <div class='align-content-center font-semibold text-xl'>
            {{ dataPlaning.planingName }}
          </div>
        </div>

      </div>
    </template>
    <div
      class='mb-8 mt-2 overflow-y-auto surface-0 w-12'
      style='height: calc(100vh - 11rem)'>
      <LoadingSkeleton v-if='loading'/>
      <div
        v-else
        ref='formRef'
        class='flex flex-wrap'>
        <div class='border-1 border-300 border-round-sm flex flex-wrap w-6'>
          <LabelDisplay
            class='col-6 font-medium py-1'
            :label="t('hrm.planning.noPlan')"
            :value='dataPlaning.code'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            :label='t("hrm.planning.planDate")'
            :value='formatDate(dataPlaning.planingDate)'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            :label='t("hrm.planning.effectDate")'
            :value='formatDate(dataPlaning.effectDate)'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            :label="t('hrm.planning.expireDate')"
            :value='formatDate(dataPlaning.expireDate)'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            label='Tên quy hoạch'
            :value='dataPlaning.planingName'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            label='Phân loại'
            :value='classificationOptions.find((item) => item.value === dataPlaning.classification)?.label'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            label='Nhiệm kỳ'
            :value='dataPlaning.term?.toString() ?? ""'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            label='Mẫu số'
            :value='dataPlaning.formNumber?.toString() ?? ""'/>
          <LabelDisplay
            class='col-6 font-medium py-1'
            label='Người tạo'
            :value='getCreatorInfo(dataPlaning.creator?.toString() ?? "")?.fullName ?? ""'/>
        </div>

        <div class='my-3 overflow-scroll w-full'>
          <table class='custom-table'>
            <!-- Header Row 1 -->
            <tr class='header-row-1'>
              <th rowspan='2'>STT</th>
              <th rowspan='2'>Họ và tên</th>
              <th colspan='2'>Ngày, tháng, năm sinh</th>
              <th rowspan='2'>Chức vụ, đơn vị công tác</th>
              <th rowspan='2'>Dân tộc</th>
              <th rowspan='2'>Ngày vào đảng</th>
              <th colspan='4'>Trình độ hiện nay</th>
              <th rowspan='2'>Ghi chú</th>
            </tr>

            <!-- Header Row 2 -->
            <tr class='header-row-2'>
              <th>Nam</th>
              <th>Nữ</th>
              <th>Chuyên môn</th>
              <th>LLCT</th>
              <th>Tin học</th>
              <th>Ngoại ngữ</th>
            </tr>

            <!-- Dynamic Groups and Rows -->
            <template
              v-for='(group, groupIndex) in dataPlaning?.planingGroups || []'
              :key='`group-${groupIndex}-${group.groupName}`'>
              <!-- Group Header -->
              <tr
                class='group-header'
                @click='selectGroupHeader(groupIndex)'>
                <td
                  class='group-stt'
                  :class="{ 'group-stt-selected': isGroupSTTSelected(groupIndex) }">
                  {{ convertToRoman(groupIndex + 1) }}
                </td>
                <td
                  class='group-name'
                  colspan='10'>
                  <p>{{ group.groupName }}</p>

                </td>
                <td class='group-note'>
                  <p>{{ group.note }}</p>

                </td>

              </tr>

              <!-- Data Rows or Empty Row -->
              <template v-if='group.employees.length === 0'>
                <tr class='data-row empty-row'>
                  <td class='stt'></td>
                  <td
                    class='text-center text-gray-400'
                    colspan='10'>Không có nhân viên
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </template>

              <template v-else>
                <tr
                  v-for='(employee, empIndex) in group.employees'
                  :key='`emp-${groupIndex}-${empIndex}`'
                  class='data-row'
                  :class="{ 'selected': selectedPlan?.employeeId === employee.employeeId }"
                  @click='selectEmployee(employee, groupIndex, empIndex)'>
                  <td
                    class='stt'
                    :class="{ 'stt-selected': isSTTSelected(groupIndex, empIndex) }">
                    {{ getEmployeeSTT(groupIndex, empIndex) }}
                  </td>
                  <td>{{ employee.employeeName }}</td>
                  <td class='date-col'>{{ employee.gender ? formatDate(employee.birthDate) : '' }}</td>
                  <td class='date-col'>{{ !employee.gender ? formatDate(employee.birthDate) : '' }}</td>
                  <td>{{ employee.position }} - {{ employee.organizationName }}</td>
                  <td>{{ employee.nation }}</td>
                  <td class='date-col'>{{ formatDate(employee.dateOfJoiningParty) }}</td>
                  <td>{{ employee.specialization }}</td>
                  <td>{{ employee.politicalTheoryLevel }}</td>
                  <td>{{ employee.computerSkill }}</td>
                  <td>{{ employee.languageSkill }}</td>
                  <td>
                    <p>{{ employee.note }}</p>

                  </td>
                </tr>
              </template>
            </template>
          </table>

        </div>
        <div>
          <div class='align-item-center flex justify-content-between'>
            <p class='font-semibold mb-0 text-xl'>{{ t("hrm.planning.attachmentData") }}</p>
          </div>

          <DataTable
            class='p-datatable-sm'
            responsive-layout='scroll'
            scroll-height='250px'
            scrollable
            show-gridlines
            striped-rows
            :value='dataPlaning.files'>
            <template #empty>
              <p class='text-center'>{{ t('common.noData') }}</p>
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
              header='Trích yếu'>
              <template #body='{ data }'>
                <p
                  class='cursor-pointer w-full'
                  @click.prevent.stop='() => viewDetail(data)'>{{ data.name }}</p>
              </template>
            </Column>
            <Column
              class='w-18rem'
              :header='t(`book-ticket.bookFlight.attachment.table.fileName`)'>
              <template #body='{ data }'>
                <div
                  class='align-items-center cursor-pointer flex gap-2 justify-content-start'
                  @click.prevent.stop='() => viewDetail(data)'>
                  <img
                    alt=''
                    class='file-extension-icon h-2rem w-2rem'
                    draggable='false'
                    :src='getFileIcon(data.file.name.split(".")[data.file.name.split(".").length - 1])'
                    @error='handleFileImageError'/>
                  <p class='mb-0 ml-2 text-green-600'>{{ data.file.name }}</p>
                </div>
              </template>
            </Column>
            <Column
              body-class='justify-content-center text-center'
              :header='t(`book-ticket.bookFlight.attachment.table.fileSize`)'
              style='width: 8rem'>
              <template #body='{ data }'>
                <p v-if='data.size'>
                  {{ data.size ? convertFileSize(data.size) : "0Kb" }}
                </p>
                <p v-else-if='data.file?.size'>
                  {{ data.file.size ? convertFileSize(data.file.size) : "0Kb" }}
                </p>
              </template>
            </Column>
            <Column
              align-frozen='right'
              body-class='surface-card p-2 text-center'
              frozen
              style='width: 2rem'>
              <template #body='{index}'>
                <Button
                  icon='pi pi-ellipsis-v'
                  rounded
                  text
                  @click='showActionMenus($event, index)'></Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </Sidebar>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import { computed, PropType, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import LoadingSkeleton from '@/apps/hrm/components/LoadingSkeleton.vue';
import type {
  AttachmenFiles,
  Planing,
  PlanListItemEmployee
} from '@/apps/hrm/views/planning/model';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  convertFileSize,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dataPlaning: {
    type: Object as PropType<Planing>,
    default: {} as Planing
  }
});
const emits = defineEmits(['hide-dialog', 'fetchData']);
const formRef = ref<HTMLFormElement>();
const { allUsers } = storeToRefs(useUserMoreInfoStore());

const { moment } = useMoment();
const loading = ref(true);
const { t } = useI18n();
const visibleDialog = ref(false);
const actionMenus = ref();
const actionMenusRef = ref();
const classificationOptions = reactive([
  {
    label: 'Cấp ủy',
    value: 'PARTY_COMMITTEE'
  },
  {
    label: 'Chức danh',
    value: 'TITLE'
  },
  {
    label: 'Tín nhiệm',
    value: 'TRUST'
  }
]);

const formatDate = (date: any) => {
  if (!date) {
    return '';
  }
  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format('DD/MM/YYYY') : '';
};
const selectedPlan = ref<PlanListItemEmployee | null>(null);
const flattenedEmployees = computed(() => {
  const result: (PlanListItemEmployee & {
    groupName: string,
    stt: number | null,
    birthDayMale?: string,
    birthDayFemale?: string,
    __empty?: boolean // flag để ẩn dòng rỗng
  })[] = [];

  if (Array.isArray(props.dataPlaning.planingGroups)) {
    props.dataPlaning.planingGroups.forEach(group => {
      if (group.employees.length === 0) {
        result.push({
          groupName: group.groupName,
          stt: null,
          employeeId: '',
          employeeName: '',
          gender: '',
          birthDate: '',
          position: '',
          nation: '',
          dateOfJoiningParty: '',
          specialization: '',
          politicalTheoryLevel: '',
          computerSkill: '',
          languageSkill: '',
          note: '',
          __empty: true
        });
      } else {
        group.employees.forEach((employee, index) => {
          result.push({
            ...employee,
            groupName: group.groupName,
            stt: index + 1,
            birthDayMale: employee.gender ? formatDate(employee.birthDate) : '',
            birthDayFemale: !employee.gender ? formatDate(employee.birthDate) : '',
          });
        });
      }
    });
  }

  return result;
});

watchEffect(() => {
  visibleDialog.value = props.visible;
  if (props.dataPlaning.id && props.visible) {
    loading.value = false;
  }
});

const getCreatorInfo = (val: string) => {
  const userData = allUsers.value.find((user) => user.id === val);
  if (userData) {
    return {
      ...userData,
      avatar: userData?.avatar,
      fullName: userData?.fullName,
      info: [
        userData?.positionName || '',
        Array.isArray(userData?.departments) && userData.departments.length > 0
          ? userData.departments[0]?.name || ''
          : ''
      ].filter(Boolean).join(' - '),
    };
  }
};

const showActionMenus = (event: Event, index: number) => {
  actionMenus.value = [
    {
      key: 'download',
      label: t('common.download'),
      icon: 'download',
      command: () => {

      },
    },
  ];
  actionMenusRef.value?.toggle(event);
};

function viewDetail(data: AttachmenFiles) {
  const file = data.file || data;
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

// Thêm hàm để chọn group header
const selectGroupHeader = (groupIndex: number) => {
  selectedGroupSTT.value = groupIndex;
  // Reset employee selection khi chọn group header
  selectedSTT.value = null;
  selectedPlan.value = null;
};

// Thêm state để track STT được select
const selectedSTT = ref<{ groupIndex: number, empIndex: number } | null>(null);
// Thêm state để track group header STT được select
const selectedGroupSTT = ref<number | null>(null);

// Thêm hàm kiểm tra group STT có được chọn không
const isGroupSTTSelected = (groupIndex: number): boolean => {
  return selectedGroupSTT.value === groupIndex;
};

const convertToRoman = (num: number): string => {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';

  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  return result;
};

const getEmployeeSTT = (groupIndex: number, empIndex: number): number => {
  let stt = 1;
  const groups = props.dataPlaning.value?.planingGroups || [];
  for (let i = 0; i < groupIndex; i++) {
    stt += groups[i]?.employees?.length || 0;
  }
  return stt + empIndex;
};

// Thêm hàm kiểm tra STT có được chọn không
const isSTTSelected = (groupIndex: number, empIndex: number): boolean => {
  return selectedSTT.value?.groupIndex === groupIndex && selectedSTT.value?.empIndex === empIndex;
};

// Cập nhật hàm selectEmployee để lưu thông tin STT được chọn
const selectEmployee = (employee: PlanListItemEmployee, groupIndex: number, empIndex: number) => {
  selectedPlan.value = employee;
  selectedSTT.value = {
    groupIndex,
    empIndex
  };
  // Reset group header selection khi chọn employee
  selectedGroupSTT.value = null;
};
</script>

<style lang="scss" scoped>
.card {
  padding: 1rem;
  border-radius: 4px;
}

.table-container {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1200px; // Ensure horizontal scroll
}

/* Header styling */
.header-row-1 th {
  color: var(--text-color);
  padding: 12px 8px;
  font-weight: 600;
  text-align: center;
  border: 1px solid var(--surface-d);
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.header-row-2 th {
  color: var(--text-color);
  padding: 10px 8px;
  font-weight: 500;
  text-align: center;
  border: 1px solid var(--surface-d);
  position: sticky;
  top: 44px;
  z-index: 9;
  white-space: nowrap;
}

/* Group header styling */
.group-header {
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.group-header td {
  padding: 12px 8px;
  border: 1px solid #cbd5e0;
  background-color: #f7fafc;
}

.group-stt {
  text-align: center;
  color: #3182ce;
  font-size: 14px;
  font-weight: bold;
  width: 50px;
  transition: background-color 0.3s ease;
}

/* Group STT selected styling - màu nền vàng */
.group-stt-selected {
  background-color: #fef08a !important; /* Màu vàng nhạt */
  border-color: #eab308 !important; /* Màu viền vàng đậm hơn */
  font-weight: 700;
  color: #92400e; /* Màu chữ nâu vàng */
  box-shadow: inset 0 0 0 1px #eab308;
}

.group-name {
  position: relative;
}

.group-note {
  width: 150px;
  position: relative;
}

.group-note-input {
  background: transparent !important;
  border: none !important;
  font-weight: 500;
  color: #4a5568;
  width: 100%;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover,
  &:focus {
    background: white !important;
    box-shadow: 0 0 0 1px #cbd5e0 !important;
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
    font-size: 12px;
  }
}

.group-input {
  background: transparent !important;
  border: none !important;
  font-weight: 600;
  color: #2d3748;
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover,
  &:focus {
    background: white !important;
    box-shadow: 0 0 0 2px #3182ce !important;
    outline: none;
  }
}

.group-action {
  text-align: center;
  width: 40px;
}

/* Regular row styling */
.data-row td {
  padding: 10px 8px;
  border: 1px solid #e2e8f0;
  vertical-align: middle;
  white-space: nowrap;
}

.data-row:nth-child(even) {
  background-color: #fff;
}

.data-row:hover {
  background-color: #edf2f7;
  cursor: pointer;
}

.data-row.selected {
  background-color: #bee3f8;
  border-color: #3182ce;
}

.empty-row {
  opacity: 0.6;
  font-style: italic;
}

/* STT column styling */
.stt {
  text-align: center;
  font-weight: 500;
  color: #4a5568;
  width: 50px;
  transition: background-color 0.3s ease;
}

/* STT selected styling - màu nền vàng */
.stt-selected {
  background-color: #fef08a !important; /* Màu vàng nhạt */
  border-color: #eab308 !important; /* Màu viền vàng đậm hơn */
  font-weight: 700;
  color: #92400e; /* Màu chữ nâu vàng */
  box-shadow: inset 0 0 0 1px #eab308;
}

/* Input styling for notes */
.note-input {
  border: none !important;
  background: transparent !important;
  width: 100%;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 3px;
  transition: all 0.2s;

  &:hover,
  &:focus {
    background: white !important;
    box-shadow: 0 0 0 1px #cbd5e0 !important;
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
    font-size: 12px;
  }
}

/* Action column styling */
.action-col {
  text-align: center;
  width: 50px;
}

/* Date column styling */
.date-col {
  text-align: center;
  color: #4a5568;
}

/* Column widths */
.custom-table th:nth-child(1), .custom-table td:nth-child(1) {
  width: 50px;
}

/* STT */
.custom-table th:nth-child(2), .custom-table td:nth-child(2) {
  width: 150px;
}

/* Họ và tên */
.custom-table th:nth-child(3), .custom-table td:nth-child(3) {
  width: 100px;
}

/* Nam */
.custom-table th:nth-child(4), .custom-table td:nth-child(4) {
  width: 100px;
}

/* Nữ */
.custom-table th:nth-child(5), .custom-table td:nth-child(5) {
  width: 200px;
}

/* Chức vụ */
.custom-table th:nth-child(6), .custom-table td:nth-child(6) {
  width: 100px;
}

/* Dân tộc */
.custom-table th:nth-child(7), .custom-table td:nth-child(7) {
  width: 120px;
}

/* Ngày vào đảng */
.custom-table th:nth-child(8), .custom-table td:nth-child(8) {
  width: 120px;
}

/* Chuyên môn */
.custom-table th:nth-child(9), .custom-table td:nth-child(9) {
  width: 100px;
}

/* LLCT */
.custom-table th:nth-child(10), .custom-table td:nth-child(10) {
  width: 100px;
}

/* Tin học */
.custom-table th:nth-child(11), .custom-table td:nth-child(11) {
  width: 120px;
}

/* Ngoại ngữ */
.custom-table th:nth-child(12), .custom-table td:nth-child(12) {
  width: 150px;
}

/* Ghi chú */
.custom-table th:nth-child(13), .custom-table td:nth-child(13) {
  width: 50px;
}

/* Thao tác */

/* Responsive */
@media (max-width: 768px) {
  .custom-table {
    font-size: 11px;
  }

  .header-row-1 th,
  .header-row-2 th {
    padding: 8px 4px;
  }

  .data-row td,
  .group-header td {
    padding: 8px 4px;
  }
}

/* PrimeVue button overrides */
:deep(.p-button-plain) {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #718096;
  transition: all 0.2s;

  &:hover {
    background: #edf2f7;
    color: #2d3748;
  }
}
</style>