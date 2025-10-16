<template>
  <div class='card px-0'>
    <div class='align-item-center flex justify-content-between'>
      <slot></slot>
      <div class='flex gap-2'>
        <Button
          class='border-round-sm btn flex gap-2'
          icon='pi pi-plus'
          label='Thêm nhóm'
          @click='addNewGroup'/>

      </div>
    </div>

    <div class='mt-3 table-container'>
      <table class='custom-table'>
        <!-- Header Row 1 -->
        <thead>
          <tr class='header-row-1'>
            <th rowspan='2'>STT</th>
            <th rowspan='2'>Họ và tên</th>
            <th colspan='2'>Ngày, tháng, năm sinh</th>
            <th rowspan='2'>Chức vụ, đơn vị công tác</th>
            <th rowspan='2'>Dân tộc</th>
            <th rowspan='2'>Ngày vào đảng</th>
            <th colspan='4'>Trình độ hiện nay</th>
            <th rowspan='2'>Ghi chú</th>
            <th rowspan='2'>Thao tác</th>
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
        </thead>

        <!-- Dynamic Groups and Rows -->
        <tbody>
          <template
            v-for='(group, groupIndex) in planningData?.planingGroups || []'
            :key='`group-${groupIndex}`'>
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
                <Textarea
                  auto-resize
                  class='border-none font-semibold group-input py-2 w-10'
                  :model-value='group.groupName'
                  rows='1'
                  type='text'
                  variant='filled'
                  @update:model-value='updateNameGroup($event, groupIndex)'/>
              </td>
              <td class='group-note'>
                <InputText
                  class='border-none group-note-input'
                  :model-value="group.note || ''"
                  placeholder='Ghi chú nhóm...'
                  type='text'
                  variant='filled'
                  @update:model-value='updateGroupNote(groupIndex, $event)'/>
              </td>
              <td class='group-action'>
                <Button
                  class='p-button-plain p-button-text'
                  icon='pi pi-ellipsis-v'
                  @click='showActionMenusForGroup($event, groupIndex)'/>
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
                <template v-if='!planningData.id'>
                  <td class='date-col'>{{ employee.gender ? employee.birthDate : '' }}
                  </td>
                  <td class='date-col'>{{ !employee.gender ? employee.birthDate : '' }}</td>
                </template>
                <template v-else>
                  <td class='date-col'>{{ employee.gender ? formatDate(employee.birthDate) : '' }}
                  </td>
                  <td class='date-col'>{{ !employee.gender ? formatDate(employee.birthDate) : '' }}</td>
                </template>
                <td>{{ employee.positionName ? employee.positionName : employee.position }} - {{
                  employee.organizationName
                }}
                </td>
                <td>{{ employee.nation }}</td>
                <td class='date-col'>{{ formatDate(employee.dateOfJoiningParty) }}</td>
                <td>{{ employee.specialization }}</td>
                <td>{{ employee.politicalTheoryLevel }}</td>
                <td>{{ employee.computerSkill }}</td>
                <td>{{ employee.languageSkill }}</td>
                <td style='min-width: 150px'>
                  <InputText
                    class='border-none note-input'
                    :model-value='employee.note'
                    placeholder='Nhập ghi chú...'
                    type='text'
                    variant='outlined'
                    @update:model-value='updateEmployeeNote(groupIndex, empIndex, $event)'/>
                </td>
                <td class='action-col'>
                  <Button
                    class='p-button-plain p-button-text'
                    icon='pi pi-ellipsis-v'
                    @click='showActionMenus($event, employee, groupIndex, empIndex)'/>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <Menu
      ref='actionMenusRefForm'
      :model='actionMenus'
      popup/>

    <ModalSelectEmployee
      v-model:visible='showModalSelectEmployee'
      @close='showModalSelectEmployee = false'
      @update:employee='handleAddEmployee'/>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import ModalSelectEmployee from '@/apps/hrm/views/planning/modal/ModalSelectEmployee.vue';
import type { PlanListItem, PlanListItemEmployee, PlanningInterface } from '@/apps/hrm/views/planning/model';
import useMoment from '@/common/helpers/mixins/use-moment';

const planningData = defineModel('tableData', {
  type: Object as PropType<PlanningInterface>,
  default: () => ({
    code: '',
    planingDate: '',
    expireDate: '',
    effectDate: '',
    planingGroups: [] as PlanListItem[]
  })
});

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const actionMenusRefForm = ref<InstanceType<typeof Menu>>();
const actionMenus = ref<any[]>([]);
const { moment } = useMoment();
const showModalSelectEmployee = ref(false);
const { onResult: newTitleResult } = getAllCategory(userDeptRole.value, 'JOB_TITLE');
const selectedPlan = ref<PlanListItemEmployee | null>(null);
const newTitles = ref<any[]>([]);
const selectedGroupIndex = ref<number | null>(null);

// Thêm state để track STT được select
const selectedSTT = ref<{ groupIndex: number, empIndex: number } | null>(null);
// Thêm state để track group header STT được select
const selectedGroupSTT = ref<number | null>(null);

// Methods
const addNewGroup = () => {

  if (!planningData.value) {
    planningData.value = {
      code: '',
      planingName: '',
      classification: '',
      term: '',
      formNumber: '',
      creator: '',
      planingDate: '',
      expireDate: '',
      effectDate: '',
      planingGroups: [] as PlanListItem[]
    };
  }
  if (!Array.isArray(planningData.value.planingGroups)) {
    planningData.value.planingGroups = [];
  }

  const groupIndex = planningData.value.planingGroups.length + 1;
  const newGroup = {
    groupName: `Nhóm mới ${groupIndex}`,
    employees: [],
    note: '',
  };

  // Add the new group to the array - this should maintain reactivity
  planningData.value.planingGroups.push(newGroup);

};

const getEmployeeSTT = (groupIndex: number, empIndex: number): number => {
  let stt = 1;
  const groups = planningData.value?.planingGroups || [];
  for (let i = 0; i < groupIndex; i++) {
    stt += groups[i]?.employees?.length || 0;
  }
  return stt + empIndex;
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

// Thêm hàm để chọn group header
const selectGroupHeader = (groupIndex: number) => {
  selectedGroupSTT.value = groupIndex;
  // Reset employee selection khi chọn group header
  selectedSTT.value = null;
  selectedPlan.value = null;
};

// Thêm hàm kiểm tra STT có được chọn không
const isSTTSelected = (groupIndex: number, empIndex: number): boolean => {
  return selectedSTT.value?.groupIndex === groupIndex && selectedSTT.value?.empIndex === empIndex;
};

// Thêm hàm kiểm tra group STT có được chọn không
const isGroupSTTSelected = (groupIndex: number): boolean => {
  return selectedGroupSTT.value === groupIndex;
};

const getExactlyPosition = (position: string) => {
  const oldPosition = newTitles.value.find(item => item.code === position);
  return oldPosition ? oldPosition.name : '';
};

const formatDate = (date: any) => {
  if (!date) {
    return '';
  }
  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format('DD/MM/YYYY') : '';
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

const updateEmployeeNote = (groupIndex: number, empIndex: number, note: string) => {
  if (planningData.value?.planingGroups?.[groupIndex]?.employees?.[empIndex]) {
    planningData.value.planingGroups[groupIndex].employees[empIndex].note = note;
  }
};

const handleAddEmployee = (data: any[]) => {
  if (selectedGroupIndex.value === null) {
    return;
  }
  const newEmployees: PlanListItemEmployee[] = data.map((item) => ({
    employeeId: item.id ?? '',
    employeeName: item.fullName ?? '',
    employeeType: item.employeeType ?? '',
    gender: item.gender === 'MALE',
    birthDate: formatDate(item.birthDay),
    position: getExactlyPosition(item.position) || item.positionName,
    positionName: item.positionName ?? '',
    nation: item.nation ?? '',
    dateOfJoiningParty: item.partyEntryDayOfficial ? item.partyEntryDayOfficial : '',
    specialization: item.professionalLevel ?? '',
    politicalTheoryLevel: item.politicalTheory ?? '',
    jobTitle: item.jobTitleName,
    organizationName: item.organizationName ?? '',
    computerSkill: item.informationTechnologyLevel ?? '',
    languageSkill: item.foreignLanguageLevel ?? '',
    note: item.note ?? '',
  }));

  planningData.value?.planingGroups?.[selectedGroupIndex.value]?.employees?.push(...newEmployees);
};

const updateGroupNote = (groupIndex: number, note: string) => {
  if (planningData.value?.planingGroups?.[groupIndex]) {
    if (!planningData.value.planingGroups[groupIndex].note) {
      planningData.value.planingGroups[groupIndex] = {
        ...planningData.value.planingGroups[groupIndex],
        note: ''
      };
    }
    planningData.value.planingGroups[groupIndex].note = note;
  }
};

const updateNameGroup = (name: string, index: number) => {
  if (!Array.isArray(planningData.value.planingGroups)) {
    planningData.value.planingGroups = [];
  }
  if (!planningData.value.planingGroups[index]) {
    planningData.value.planingGroups[index] = {
      groupName: '',
      employees: [],
      note: ''
    };
  }
  const updatedGroup = {
    ...planningData.value.planingGroups[index],
    groupName: name
  };
  planningData.value.planingGroups.splice(index, 1, updatedGroup);
};

function showActionMenus(event: Event, employee: PlanListItemEmployee, groupIndex: number, empIndex: number) {
  actionMenus.value = [
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (planningData.value?.planingGroups?.[groupIndex]?.employees) {
          planningData.value.planingGroups[groupIndex].employees.splice(empIndex, 1);
          // Reset selected STT if the deleted employee was selected
          if (selectedSTT.value?.groupIndex === groupIndex && selectedSTT.value?.empIndex === empIndex) {
            selectedSTT.value = null;
            selectedPlan.value = null;
          }
          // Reset group STT selection if all employees are deleted
          if (planningData.value?.planingGroups?.[groupIndex]?.employees?.length === 0) {
            selectedGroupSTT.value = null;
          }
        }
      }
    }
  ];
  actionMenusRefForm.value?.toggle(event);
}

function showActionMenusForGroup(event: Event, index: number) {
  actionMenus.value = [
    {
      label: t('hrm.planning.addEmployee'),
      icon: 'pi pi-user-plus',
      command: () => {
        showModalSelectEmployee.value = true;
        selectedGroupIndex.value = index;
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (planningData.value?.planingGroups) {
          planningData.value.planingGroups.splice(index, 1);
          selectedGroupIndex.value = null;
          // Reset selected STT if the deleted group contained the selected employee
          if (selectedSTT.value?.groupIndex === index) {
            selectedSTT.value = null;
            selectedPlan.value = null;
          }
          // Reset group STT selection if the deleted group was selected
          if (selectedGroupSTT.value === index) {
            selectedGroupSTT.value = null;
          }
        }
      }
    }
  ];
  actionMenusRefForm.value?.toggle(event);
}

onMounted(() => {
  // Initialize if needed

  if (!planningData.value.planingGroups) {
    planningData.value.planingGroups = [];
  }
});

newTitleResult((res) => {
  newTitles.value = res.data.getAllCategory;
});

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
  display: block; /* Đảm bảo chỉ tbody scroll */
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1200px; // Ensure horizontal scroll
}

.custom-table thead {
  position: sticky;
  top: 0;
  z-index: 30;
  background-color: var(--surface-0);
  border: 0.5px solid var(--surface-d);
}

/* Header styling */
.header-row-1 th {
  top: 0;
}

.header-row-2 th {
  top: 40px; /* Chiều cao row 1 */
}

.header-row-1 th,
.header-row-2 th {
  color: var(--text-color);
  padding: 12px 8px;
  font-weight: 600;
  text-align: center;
  border: 0.5px solid var(--surface-d);
  white-space: nowrap;
  position: sticky;
  background-color: var(--surface-0);
  z-index: 20;
}

/* Vẽ lại viền 4 phía cho sticky header */
.header-row-1 th::before,
.header-row-2 th::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0.5px solid var(--surface-d);
  pointer-events: none;
  box-sizing: border-box;
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
  background-color: #fef08a !important;
  border-color: #eab308 !important;
  font-weight: 700;
  color: #92400e;
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
  background-color: #fef08a !important;
  border-color: #eab308 !important;
  font-weight: 700;
  color: #92400e;
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
