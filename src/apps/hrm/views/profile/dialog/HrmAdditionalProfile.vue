<template>
  <Dialog
    v-model:visible='visible'
    class='w-6'
    header='MỘT SỐ NGHIỆP VỤ THỰC HIỆN VỚI NHÂN SỰ'
    modal
    :pt="{
      content: {
        class: 'pb-2',
        style: 'height: 80dvh;'
      }
    }">
    <div class='item-group-block'>
      <div
        v-for='item in profileActionData'
        :key='item.key'
        class='align-items-center col-2 cursor-pointer flex gap-2 hover:bg-surface-200 item-block items-center justify-content-center p-0'
        :class="{ 'selected-item': formData.leaveType === item.key, 'pointer-events-none opacity-50': isDisabled }"
        @click='() => !data.id && (formData.leaveType = item.key)'>
        <div class='item-block-detail'>
          <AppIcon
            v-if="!item.icon.includes('pi')"
            :name='item.icon'
            size='28px'
            :style='{ color: item.iconColor }'/>
          <i
            v-else
            class='text-3xl'
            :class='item.icon'
            :style='{ color: item.iconColor }'></i>
          <span class='font-semibold text-center'>{{ t(item.title) }}</span>
        </div>
      </div>
    </div>
    <div class='mt-4'>
      <p class='font-semibold mb-2 text-xl'>Thời gian nghỉ</p>
      <div class='align-items-end flex gap-2'>
        <Dropdown
          v-model='formData.employeeId'
          class='mb-2 md:w-6 w-full'
          :error='v$?.$errors?.find((error) => error.$property === "employeeId")?.$message?.toString()'
          :filter='true'
          option-label='fullName'
          option-value='id'
          :options='employeeDataByLeaveType'
          panel-class='custom-dropdown'
          placeholder='Chọn nhân sự'
          :show-clear="formData.employeeId !== ''">
          <template #option='slotProps'>
            <div class='align-items-center flex gap-2'>
              <AppAvatar
                :avatar='generateAvatarUrl(slotProps.option.avatar)'
                shape='square'
                size='2.5'/>
              <div>
                <p class='font-semibold mb-0'>{{ slotProps.option.fullName }}</p>
                <div class='flex'>
                  <p class='mb-0 text-700 text-base'>{{ slotProps.option.jobTitleName }}</p>
                  <p class='border-l-2 mb-0 ml-2 text-700 text-base'>| {{ slotProps.option.organizationName }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </Dropdown>

        <div
          v-if='formData.employeeId'
          class='align-items-center col-6 flex gap-2 justify-content-between mb-0 p-1'>
          <ButtonIcon
            class='border-round-sm btn-check hidden mb-1 p-3 w-9rem'
            icon='approval_delegation'
            :label="checking ? 'Đang kiểm tra...' : 'Kiểm tra'"
            severity='secondary'
            @click='handleCheckEmployee'>
          </ButtonIcon>
          <div
            v-if='checking'
            class='align-items-center border-round-sm check-result flex justify-content-center mb-1'
            :class="{'bg-green-100': !checking, 'bg-yellow-300': checking }">
            <i
              class='pi pi-spin pi-spinner'
              style='font-size: 14px'></i>
          </div>
          <div
            v-if='!checking && checkResult'
            class='align-items-center border-round-sm check-result flex justify-content-center mb-1'
            :class="{'bg-green-100': !checking, 'bg-yellow-300': checking }">
            <AppIcon
              v-if='checkResult'
              name='done_all'
              size='14px'/>

          </div>
        </div>
      </div>
      <div class='flex'>
        <FormInputCalendar
          v-model='formData.fromDate'
          class='col-6 mb-0 p-1'
          :error='v$?.$errors?.find((error) => error.$property === "fromDate")?.$message?.toString()'
          label='Từ ngày'
          name='fromDate'
          required/>
        <FormInputCalendar
          v-if='formData.leaveType !== ActionKey.LEAVE && formData.leaveType !== ActionKey.RETIRE_LEAVE'
          v-model='formData.toDate'
          class='col-6 mb-0 p-1'
          :error='v$?.$errors?.find((error) => error.$property === "toDate")?.$message?.toString()'
          label='Đến ngày'
          name='toDate'/>
      </div>
      <FormInputTextArea
        v-model='formData.description'
        class='col-12 mb-0 p-1'
        label='Ghi chú/Lý do'
        name='workDescription'/>
      <div class='align-items-end flex justify-content-between mb-2 mt-4'>
        <p class='font-semibold mb-0 text-xl'>Danh sách giấy tờ kèm theo</p>
        <ButtonIcon
          class='border-round-sm justify-content-center w-fit'
          icon='attach_file_add'
          label='Thêm giấy tờ'
          severity='warning'
          size='20px'
          @click='addRow'/>
      </div>
      <OtherProfessionalTable
        :attachment='formData.attachment'
        :edit-indexes='editIndexes'
        :file-inputs='fileInputs'
        @file-upload='handleFileUpload'
        @show-action-menus='showActionMenus'/>
      <div class='mt-4'>
        <Checkbox
          id='formCheck'
          v-model='formData.isAutoUpdate'
          :binary='true'
          class='mr-2'
          :disabled='isInprocess'/>
        <label for='formCheck'>
          Bạn có muốn cài đặt trạng thái nhân sự được kiểm tra hằng ngày?
        </label>
      </div>
      <div class='align-items-center flex gap-2 mt-4'>
        <i class='pi pi-info-circle'></i>
        <p v-html="t('hrm.profile.otherProfessional.notification')"></p>
      </div>
    </div>

    <template #footer>

      <Button
        class='border-round-sm'
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'/>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        :label='t("common.confirm")'
        @click='submit'/>
    </template>
  </Dialog>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, type PropType, reactive, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import { getOtherProfessionByEmployeeId } from '@/apps/hrm/api/graphql/employee-other';
import { createEmployeeVocation } from '@/apps/hrm/api/rest/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import type { EmployeeOtherProfessionData, EmployeeSummary } from '@/apps/hrm/model/employee';
import OtherProfessionalTable from '@/apps/hrm/views/profile/detail/component/OtherProfessionalTable.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { validateFilesCommon } from '@/common/helpers/validateFileOption';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const props = defineProps({
  data: {
    type: Object as PropType<EmployeeOtherProfessionData>,
    default: () => ({})
  },
  employeeId: {
    type: String,
    default: ''
  },
});
const employeeData = ref<EmployeeSummary[]>([]);

const { callRefetchCountTable } = useHrmProfileStore();
const { moment } = useMoment();

const employeeDataByLeaveType = computed(() => {
  if (!employeeData.value || employeeData.value.length === 0) {
    return [];
  }

  switch (formData.value.leaveType) {
  case ActionKey.LEAVE:
    // Cho phép chọn cả nhân viên đang làm việc và nhân viên đã nghỉ việc (để xử lý trường hợp trở lại làm việc)
    return employeeData.value.filter(emp => emp.status === 'WORKING' || emp.status === 'LEAVE');
  case ActionKey.MATERNITY_LEAVE:
    return employeeData.value.filter(emp => emp.status !== 'MATERNITY_LEAVE' && emp.status !== 'LEAVE');
  case ActionKey.RETIRE_LEAVE:
    return employeeData.value.filter(emp => emp.status !== 'RETIREMENT' && emp.status !== 'LEAVE');
  case ActionKey.LEAVE_WITHOUT_PAY:
    return employeeData.value.filter(emp => emp.status !== 'WITHOUT_PAY_LEAVE' && emp.status !== 'LEAVE');
  case ActionKey.TRAINING_LEAVE:
    return employeeData.value.filter(emp => emp.status !== 'STUDY_LEAVE' && emp.status !== 'LEAVE');
  case ActionKey.OTHER_LEAVE:
    return employeeData.value.filter(emp => emp.status !== 'OTHER_LEAVE' && emp.status !== 'LEAVE');
  default:
    return [];
  }
});

const enum ActionKey {
  LEAVE = 'LEAVE', // nghi viec
  MATERNITY_LEAVE = 'MATERNITY_LEAVE', // nghi thai san
  RETIRE_LEAVE = 'RETIREMENT', // nghi huu
  LEAVE_WITHOUT_PAY = 'WITHOUT_PAY_LEAVE', // nghi khong luong
  TRAINING_LEAVE = 'STUDY_LEAVE', // nghi hoc tap
  OTHER_LEAVE = 'OTHER_LEAVE', // nghi khac
}

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});

const { t } = useI18n();

interface AttachmentFile {
  name: string;
  file: File | null;
  id?: string;
  fileName?: string;
  size?: number;
}

interface formDataType {
  leaveType: ActionKey;
  employeeId: string;
  fromDate: string | Date | null;
  toDate: string | Date | null;
  description: string;
  isAutoUpdate: boolean;
  attachment: AttachmentFile[];
}

const formData = ref<formDataType>({
  leaveType: ActionKey.LEAVE,
  employeeId: '',
  fromDate: '',
  isAutoUpdate: false,
  toDate: '',
  description: '',
  attachment: []
});

const rules = computed(() => ({
  employeeId: {
    required: helpers.withMessage(
      t('common.validate.required', { item: 'Nhân sự' }),
      required
    ),
    $autoDirty: true
  },
  fromDate: {
    required: helpers.withMessage(
      t('common.validate.required', { item: 'Thời gian nghỉ' }),
      required
    ),
    $autoDirty: true
  },
  toDate: {
    validRange: helpers.withMessage(
      t('common.validate.dateRange'),
      (value: any, siblings: any) => {
        if (formData.value.leaveType !== ActionKey.LEAVE) {
          return true;
        }

        const endDate =
              typeof value === 'string' || typeof value === 'number' || value instanceof Date
                ? new Date(value)
                : null;
        const startDate =
              typeof siblings?.fromDate === 'string'
              || typeof siblings?.fromDate === 'number'
              || siblings?.fromDate instanceof Date
                ? new Date(siblings.fromDate)
                : null;

        if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return true;
        }

        return endDate >= startDate;
      }
    ),
    $autoDirty: true
  },
  attachment: {
    $each: {
      name: { required: helpers.withMessage('Tên giấy tờ không được để trống', required) },
      file: { required: helpers.withMessage('Cần phải upload file', required) }
    }
  }
}));

const v$: Ref<Validation> = useVuelidate(rules, formData);
const actionMenus = ref<MenuItem[]>([]);
const leaveTypeExists = ref<string[]>([]);
const editIndexes = ref<number[]>([]);
const vocationData = ref<EmployeeOtherProfessionData[]>([]);
// eslint-disable-next-line @typescript-eslint/no-empty-function
const refetchData = inject('refetchEmployee', () => {
});
const isInprocess = ref(false);
const isDisabled = computed(() => {
  const currentType = formData.value.leaveType;

  const isEditingWithTypeChanged = props.data.id && currentType !== props.data.type;
  const isDuplicateLeave = leaveTypeExists.value.includes(currentType) && currentType === ActionKey.LEAVE;
  const isRetireLeave = leaveTypeExists.value.includes(currentType) && currentType === ActionKey.RETIRE_LEAVE;

  return isEditingWithTypeChanged || isDuplicateLeave || isRetireLeave;
});

watchEffect(() => {
  if (props.data.id) {
    formData.value = {
      employeeId: props.employeeId,
      description: props.data.description || '',
      leaveType: props.data.type as ActionKey,
      isAutoUpdate: props.data.isAutoUpdate || false,
      fromDate: props.data.fromDate ? new Date(props.data.fromDate) : '',
      toDate: props.data.toDate ? new Date(props.data.toDate) : '',
      attachment: props.data.files.map((item: any) => ({
        name: item.name,
        fileName: item.fileName,
        size: item.size,
        file: item.file ? new File([item.file], item.name, { type: item.file.type }) : null,
        id: item.id
      }))
    };
  }

  if (formData.value.employeeId) {
    const { onResult: getOtherProfessionData } =
        getOtherProfessionByEmployeeId(formData.value.employeeId);

    getOtherProfessionData((res) => {
      vocationData.value = res.data.findVacationByEmployeeId;
      const currentTime = new Date();
      const inprocessData = vocationData.value.filter(item => {
        const fromDate = new Date(item.fromDate);
        const toDate = item.toDate ? new Date(item.toDate) : fromDate;
        return fromDate <= currentTime && toDate >= currentTime;
      });
      if (inprocessData.length > 0) {
        formData.value.isAutoUpdate = true;
        isInprocess.value = true;
      }
    });

    leaveTypeExists.value = vocationData.value.map(item => item.type);
  }
  if (!visible.value) {
    formData.value = {
      leaveType: ActionKey.LEAVE,
      employeeId: '',
      fromDate: '',
      isAutoUpdate: false,
      toDate: '',
      description: '',
      attachment: []
    };
    v$.value.$reset(); // Reset validation state
  }
});
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const fileInputs = ref<(HTMLInputElement | null)[]>([]);

const checking = ref(false);
const checkResult = ref(false);
const profileActionData = reactive(
  [
    {
      icon: 'account_circle_off',
      iconColor: 'red',
      title: 'Nghỉ viêc',
      key: ActionKey.LEAVE,

    },
    {
      icon: 'pregnant_woman',
      iconColor: 'var(--purple-custom)',
      title: 'Nghỉ thai sản',
      key: ActionKey.MATERNITY_LEAVE,

    },
    {
      icon: 'elderly',
      title: 'Nghỉ hưu',
      iconColor: 'var(--orange-custom)',
      key: ActionKey.RETIRE_LEAVE,

    },
    {
      icon: 'pi pi-wallet',
      iconColor: 'var(--blue-custom)',
      title: 'Nghỉ không lương',
      key: ActionKey.LEAVE_WITHOUT_PAY,

    },
    {
      icon: 'school',
      iconColor: 'var(--green-custom)',
      title: 'Nghỉ học tập',
      key: ActionKey.TRAINING_LEAVE,

    },
    {
      icon: 'block',
      iconColor: 'var(--yellow-custom)',
      title: 'Nghỉ khác',
      key: ActionKey.OTHER_LEAVE,

    }
  ]
);
const resetLeaveForm = () => {
  checking.value = false;
  checkResult.value = false;
  const employee = employeeDataByLeaveType.value.find(emp => emp.id === formData.value.employeeId);
  if (employee) {
    formData.value.fromDate = new Date();
    formData.value.toDate = null;
    formData.value.description = '';
    formData.value.attachment = [];
  }
};

watch(
  () => formData.value.employeeId,
  (val) => {
    if (!props.data.id && val) {
      resetLeaveForm();
    }
  },
  { immediate: true }
);

watch(
  () => formData.value.leaveType,
  (val) => {
    if (!props.data.id && val) {
      resetLeaveForm();
    }
  },
  { immediate: true }
);

const addRow = () => {
  formData.value.attachment.push({
    name: '',
    file: null
  });
  editIndexes.value.push(formData.value.attachment.length - 1);
};

const removeRow = (index: number) => {
  formData.value.attachment.splice(index, 1);
};

const handleFileUpload = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const error = validateFilesCommon([file]);
    if (error.length > 0) {
      toastError({ message: `"${file.name}" - ${t('common.invalidFileTypeMessage')}` });
      target.value = ''; // Reset input nếu sai
      return;
    }
    formData.value.attachment[index].file = file;
  }
};

const toggleEdit = (index: number) => {
  const idx = editIndexes.value.indexOf(index);
  if (idx !== -1) {
    editIndexes.value.splice(idx, 1);
  } else {
    editIndexes.value.push(index);
  }
};

const removeEdit = (index: number) => {
  const idx = editIndexes.value.indexOf(index);
  if (idx !== -1) {
    editIndexes.value.splice(idx, 1);
  }
};

const showActionMenus = (event: Event, index: number) => {
  actionMenus.value = [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      visible: !editIndexes.value.includes(index),
      command: () => {
        toggleEdit(index);
      }
    },
    {
      label: t('common.save'),
      icon: 'pi pi-save',
      visible: editIndexes.value.includes(index),
      command: () => {
        removeEdit(index);
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        removeRow(index);
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
};

const handleCheckEmployee = () => {
  checking.value = true;
  setTimeout(() => {
    checking.value = false;
    checkResult.value = true;
  }, 2000);
};

const getFormDataForUpload = (): FormData => {
  const payload = new FormData();
  if (props.data.id) {
    payload.append('id', props.data.id);
  }
  payload.append('type', formData.value.leaveType);
  payload.append('employeeId', formData.value.employeeId);
  payload.append(
    'fromDate',
    moment(formData.value.fromDate).format('YYYY-MM-DD') ?? ''
  );
  if (formData.value.toDate) {
    payload.append(
      'toDate',
      formData.value.toDate ? moment(formData.value.toDate).format('YYYY-MM-DD') : ''
    );
  }

  payload.append('description', formData.value.description);

  payload.append('isAutoUpdate', JSON.stringify(formData.value.isAutoUpdate));
  if (formData.value.attachment.length > 0) {
    formData.value.attachment.forEach((item, index) => {
      payload.append(`vacationFiles[${index}].name`, item.name);
      if (item.file) {
        payload.append(`vacationFiles[${index}].file`, item.file);
        if (props.data.id && item.id) {
          payload.append(`vacationFiles[${index}].id`, item.id || '');
        }
      }
    });
  }

  return payload;
};

const isDateBetween = (target: string, start: string, end: string): boolean =>
  new Date(start).getTime() <= new Date(target).getTime()
    && new Date(target).getTime() <= new Date(end).getTime();

const isOverlapRange = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  new Date(aStart) <= new Date(bEnd) && new Date(bStart) <= new Date(aEnd);

const validateLeavePeriod = (): boolean => {
  const {
    leaveType,
    fromDate,
    toDate,
    employeeId
  } = formData.value;

  if (!fromDate) {
    return false;
  }

  // Lấy thông tin employee hiện tại
  const currentEmployee = employeeData.value.find(emp => emp.id === employeeId);
  const currentEmployeeStatus = currentEmployee?.status;

  // ✅ Nếu employee đang WORKING → không cần kiểm tra gì, cho phép tất cả
  if (currentEmployeeStatus === 'WORKING') {
    return true;
  }

  // ✅ Nếu employee không phải LEAVE và không phải RETIREMENT → vẫn cho phép tạo LEAVE hoặc RETIRE mà không cần kiểm tra thời gian
  if (currentEmployeeStatus !== 'LEAVE' && currentEmployeeStatus !== 'RETIREMENT') {
    return true;
  }

  const isStrictType = [ActionKey.LEAVE, ActionKey.RETIRE_LEAVE].includes(leaveType);
  if (isStrictType && toDate && new Date(fromDate) > new Date(toDate)) {
    return false;
  }

  // Chỉ kiểm tra ràng buộc thời gian khi employee đang ở trạng thái LEAVE hoặc RETIREMENT
  return !vocationData.value.some((item) => {
    const itemFrom = item.fromDate;
    const itemTo = item.toDate ?? item.fromDate;

    // ❌ Nếu thời gian nghỉ mới trùng với bất kỳ kỳ nghỉ nào đã có
    if (
      isStrictType
        ? isDateBetween(itemFrom, fromDate.toString(), toDate?.toString() ?? fromDate.toString())
        : isOverlapRange(fromDate.toString(), toDate?.toString() ?? fromDate.toString(), itemFrom, itemTo)
    ) {
      toastError({ message: 'Thời gian nghỉ trùng hoặc nằm trong kỳ nghỉ khác' });
      return true;
    }

    return false;
  });
};

const submit = async () => {
  const isValid = await v$.value.$validate();
  // Chỉ validate khoảng nghỉ khi đang tạo mới (không có ID)
  if (!props.data.id && !validateLeavePeriod()) {
    return;
  }

  if (!isValid) {
    return;
  }

  const data = getFormDataForUpload(); // hoặc getFormDataForUpload()
  try {
    // Gọi API để gửi dữ liệu
    await createEmployeeVocation(data);
    toastSuccess({ message: 'Dữ liệu đã được gửi thành công' });
  } catch (error) {
    toastError({ message: 'Lỗi khi gửi dữ liệu:' + error });
  } finally {
    visible.value = false; // Đóng dialog sau khi gửi thành công
    formData.value = {
      leaveType: ActionKey.LEAVE,
      employeeId: '',
      fromDate: null,
      isAutoUpdate: false,
      toDate: null,
      description: '',
      attachment: []
    };
    v$.value.$reset(); // Reset validation state
    refetchData();
    callRefetchCountTable();
  }
};

onMounted(() => {
  findAllEmployees('').onResult((result) => {
    const data = result.data?.findAllEmployees || [];
    employeeData.value = data.filter((item: any) => item.organizationId);
  });
});
</script>

<style scoped>
:deep(.custom-dialog) {
  height: 80dvh;
}

.item-group-block {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 10px;
}

@media (max-width: 1440px) {
  .item-group-block {
    grid-template-columns: repeat(3, 1fr);
  }
}

.item-block {
  width: 100%;
}

.item-block-detail {
  height: 90px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  margin: 0 auto;
  border-radius: 4px;
  border: 2px dashed var(--surface-d);
  transition: background-color .2s ease-in-out;

  &:hover {
    background-color: var(--table-body-row-hover-bg);
  }
}

:deep(.selected-item .item-block-detail) {
  border-color: var(--primary-color);
  border-style: dashed;
  background-color: var(--table-body-row-hover-bg);
}

.btn-check {
  height: 38px;
  display: flex;
  justify-content: center;
}

.check-result {
  width: 38px;
  height: 38px;
  background-color: var(--green-100);
  color: var(--green-600);
}

:deep(.p-avatar.p-avatar-image img) {
  border-radius: 4px !important;
}
</style>