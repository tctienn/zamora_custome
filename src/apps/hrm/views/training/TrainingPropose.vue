<template>
  <Sidebar
    v-model:visible='visibleDialog'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style : {width: "80rem"}}'
    position='right'
    @hide='emits("hide-dialog")'>
    <form
      ref='form'
      @submit.prevent='submit'>
      <div
        class='border-bottom-1 border-gray-500 fixed left-0 px-2 py-1 surface-0 top-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              icon='arrow_back'
              size='small'
              @click='emits("hide-dialog")'/>
            <div class='align-content-center font-semibold text-2xl'>{{ propose?.id ? 'Cập nhật' : 'Thêm mới' }} đề
              xuất đào tạo
            </div>
          </div>
          <div class='flex gap-1'>
            <ButtonIcon
              icon='save'
              :label='t("common.save")'
              size='small'
              @click='submit'/>
          </div>
        </div>
      </div>

      <div class='formgrid grid'>
        <input
          v-model='propose.id'
          hidden
          name='id'/>

        <input
          v-model='propose.createdTime'
          hidden
          name='createdTime'/>

        <input
          v-model='propose.createdBy'
          hidden
          name='createdBy'/>

        <input
          v-model='propose.lastModifiedTime'
          hidden
          name='lastModifiedTime'/>

        <input
          v-model='propose.lastModifiedBy'
          hidden
          name='lastModifiedBy'/>

        <div class='col-6'>
          <FormInputText
            v-model='propose.code'
            label='Mã số'
            name='code'
            required/>
          <ValidateErrorMessage :errors='v$.code.$errors'/>
        </div>

        <FormInputDropdown
          v-model='propose.field'
          class='col-6'
          label='Lĩnh vực đào tạo'
          name='field'
          option-label='name'
          option-value='code'/>

        <div class='col-12'>
          <FormInputText
            v-model='propose.proposeName'
            label='Tên khóa đào tạo'
            name='proposeName'
            required/>

          <ValidateErrorMessage :errors='v$.proposeName.$errors'/>
        </div>

        <div class='col-6'>
          <FormInputText
            v-model='propose.objectTraining'
            label='Đối tượng đào tạo'
            name='objectTraining'
            required/>

          <ValidateErrorMessage :errors='v$.objectTraining.$errors'/>
        </div>

        <div class='col-6 flex flex-column gap-2'>
          <label>Hình thức</label>
          <div class='flex gap-5'>
            <FormInputCheckbox
              v-model='propose.isOnline'
              label='Online'
              name='isOnline'/>

            <FormInputCheckbox
              v-model='propose.isOffline'
              label='Offline'
              name='isOffline'/>
          </div>
        </div>

        <div class='col-6'>
          <FormInputCalendar
            v-model='propose.fromDate'
            label='Ngày bắt đầu'
            name='fromDate'
            required/>

          <ValidateErrorMessage :errors='v$.fromDate.$errors'/>
        </div>

        <FormInputCalendar
          v-model='propose.toDate'
          class='col-6'
          label='Ngày kết thúc'
          name='toDate'/>

        <FormInputNumber
          v-model='propose.duration'
          class='col-6'
          label='Thời lượng'
          name='duration'
          :use-grouping='false'/>

        <FormInputDropdown
          v-model='propose.trainingLevel'
          class='col-6'
          label='Cấp đào tạo'
          name='trainingLevel'
          option-label='name'
          option-value='code'/>

        <div class='col-6 flex flex-column gap-2'>
          <label v-required>Người phụ trách</label>
          <NamedMultiSelectUser
            v-model:list-user='propose.takeCharges'
            class='col-6 mb-3'
            name='takeCharges'
            placeholder='Chọn người phụ trách'
            :select-max='2'
            :show-button-add='false'/>
          <ValidateErrorMessage :errors='v$.takeCharges.$errors'/>
        </div>

        <div class='col-6 flex flex-column gap-2'>
          <label>Người theo dõi</label>
          <NamedMultiSelectUser
            v-model:list-user='propose.followers'
            class='col-6 mb-3'
            name='followers'
            placeholder='Chọn người theo dõi'
            :select-max='2'
            :show-button-add='false'/>
        </div>

        <div class='col-6'>
          <FormInputNumber
            v-model='propose.numbStudent'
            label='Số học viên dự kiến'
            name='numbStudent'
            required
            :use-grouping='false'/>

          <ValidateErrorMessage :errors='v$.numbStudent.$errors'/>
        </div>

        <FormInputNumber
          v-model='propose.expense'
          class='col-6'
          label='Chi phí'
          name='expense'
          :use-grouping='false'/>

        <FormInputText
          v-model='propose.trainingUnit'
          class='col-6'
          label='Đơn vị đào tạo'
          name='trainingUnit'/>

        <FormInputDropdown
          v-model='propose.trainingPlace'
          class='col-6'
          label='Nơi đào tạo'
          name='trainingPlace'
          option-label='name'
          option-value='code'
          :options='trainingInstitutions'/>

        <FormInputText
          v-model='propose.trainingAddress'
          class='col-12'
          label='Địa điểm đào tạo'
          name='trainingAddress'/>

        <div class='col-6'>
          <FormTreeSelect
            v-model='propose.implementingUnit'
            :expanded-level='1'
            label='Đơn vị thực hiện'
            name='implementingUnit'
            option-value='key'
            :options='organizations'
            required/>
          <ValidateErrorMessage :errors='v$.implementingUnit.$errors'/>
        </div>

        <FormInputText
          v-model='propose.departmentProposed'
          class='col-6'
          label='Phòng ban đề xuất'
          name='departmentProposed'/>

        <FormInputText
          v-model='propose.diploma'
          class='col-6'
          label='Văn bằng'
          name='diploma'/>

        <FormInputText
          v-model='propose.target'
          class='col-6'
          label='Mục đích'
          name='target'/>

        <FormInputText
          v-model='propose.note'
          class='col-6'
          label='Ghi chú'
          name='note'/>
      </div>

      <div class='flex justify-content-between'>
        <div class='font-semibold'>Lịch học</div>
        <ButtonIcon
          v-tooltip.top='t("common.create")'
          icon='add_circle'
          rounded
          text
          @click='addSchedule'/>
      </div>

      <DataTable
        edit-mode='cell'
        :pt='{
          column: {
            bodyCell: bodyCellFunc
          }
        }'
        :value='schedules'
        @cell-edit-complete='onCellEditComplete'>

        <Column
          header='STT'>
          <template #body='{index}'>
            {{ index + 1 }}
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='trainingContent'
          header='Nội dung đào tạo'>
          <template #editor='{index}'>
            <InputText
              v-model='schedules[index].trainingContent'
              autofocus
              class='p-inputtext-sm w-full'/>
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='scope'
          header='Phạm vi'>
          <template #editor='{index}'>
            <InputText
              v-model='schedules[index].scope'
              autofocus
              class='p-inputtext-sm w-full'/>
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='teacher'
          header='Giảng viên'>
          <template #editor='{index}'>
            <InputText
              v-model='schedules[index].teacher'
              autofocus
              class='p-inputtext-sm w-full'/>
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='telephoneNumber'
          header='Điện thoại'>
          <template #editor='{index}'>
            <InputText
              v-model='schedules[index].telephoneNumber'
              autofocus
              class='p-inputtext-sm w-full'/>
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='startTime'
          header='Bắt đầu'>
          <template #body='{index}'>
            {{
              schedules[index].startTime ? moment(schedules[index].startTime).format('DD/MM/YYYY HH:mm') : ''
            }}
          </template>
          <template #editor='{index}'>
            <NamedInputCalendar
              v-model='schedules[index].startTime'
              hour-format='24'
              name=''
              :select-other-months='true'
              show-icon
              show-time/>
          </template>
        </Column>

        <Column
          class='w-30rem'
          field='endTime'
          header='Kết thúc'>
          <template #body='{index}'>
            {{ schedules[index].endTime ? moment(schedules[index].endTime).format('DD/MM/YYYY HH:mm') : '' }}
          </template>
          <template #editor='{index}'>
            <NamedInputCalendar
              v-model='schedules[index].endTime'
              hour-format='24'
              name=''
              :select-other-months='true'
              show-icon
              show-time/>
          </template>
        </Column>

        <Column>
          <template #body='{index}'>
            <AppIcon
              class='cursor-pointer'
              name='delete'
              size='1.5'
              @click='deleteSchedule(index)'/>
          </template>
        </Column>
      </DataTable>
      <template
        v-for='(schedule, index) in schedules'
        :key='index'>
        <input
          hidden
          :name='`schedules[${ index }].id`'
          :value='schedule.id'/>

        <input
          hidden
          :name='`schedules[${ index }].trainingContent`'
          :value='schedule.trainingContent'/>

        <input
          hidden
          :name='`schedules[${ index }].scope`'
          :value='schedule.scope'/>

        <input
          hidden
          :name='`schedules[${ index }].teacher`'
          :value='schedule.teacher'/>

        <input
          hidden
          :name='`schedules[${ index }].telephoneNumber`'
          :value='schedule.telephoneNumber'/>

        <input
          hidden
          :name='`schedules[${ index }].startTime`'
          :value='moment(schedule.startTime).format("YYYY-MM-DDTHH:mm:ss")'/>

        <input
          hidden
          :name='`schedules[${ index }].endTime`'
          :value='moment(schedule.endTime).format("YYYY-MM-DDTHH:mm:ss")'/>
      </template>
      <AppUpload
        class='pt-3'
        multiple
        name='files'
        :old-files='propose.files'
        @update:old-files='updateFile'/>
    </form>
  </Sidebar>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone, cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column, { type ColumnState } from 'primevue/column';
import DataTable, { type DataTableCellEditCompleteEvent } from 'primevue/datatable';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { findByUsersIdGraphql, getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { findProposeById } from '@/apps/hrm/api/graphql/propose';
import { savePropose, updatePropose } from '@/apps/hrm/api/rest/propose';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import type { Propose, Schedule } from '@/apps/hrm/model/propose';
import AppUpload from '@/common/components/app/upload/AppUpload.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: null
  }
});
const emits = defineEmits(['hide-dialog']);
const { moment } = useMoment();
const schedules = ref<Schedule[]>([] as Schedule[]);
const { user } = storeToRefs(useUserStore());
const propose = ref<Propose>({
  expense: 0,
  duration: 0
} as Propose);
const { t } = useI18n();
const visibleDialog = ref(props.visible);
const form = ref();
const users = ref();
const trainingInstitutions = ref<any[]>([]);
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });
const modelReactive = reactive<Schedule[]>(clone(propose.value.schedules) || [] as Schedule[]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { onResult: categoryResult } = getAllCategory(userDeptRole.value, 'TRAINING_INSTITUTION');
const organizations = ref<TreeNode[]>([]);
const organizationsFlat = ref<any[]>([]);

const rules = {
  code: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Mã số' }), required),
    $autoDirty: true,
  },
  proposeName: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Tên khóa đào tạo' }), required),
    $autoDirty: true
  },
  objectTraining: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Đối tượng đào tạo' }), required),
    $autoDirty: true
  },
  fromDate: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Ngày bắt đầu' }), required),
    $autoDirty: true
  },
  takeCharges: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Người phụ trách' }), required),
    $autoDirty: true
  },
  numbStudent: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Số học viên dự kiến' }), required),
    $autoDirty: true
  },
  implementingUnit: {
    required: helpers.withMessage(t('common.validate.required', { item: 'Đơn vị thực hiện' }), required),
    $autoDirty: true
  },
};

const v$ = useVuelidate(rules, propose);

if (props.id) {
  findProposeById(props.id).onResult((res) => {
    let data = res.data.findProposeById;
    propose.value = cloneDeep({
      ...data,
      followers: data.follow.map((d: any) => d.userId),
      takeCharges: data.takeCharge.map((d: any) => d.userId),
      files: data.file,
      fromDate: new Date(data.fromDate),
      toDate: new Date(data.toDate)
    });
    schedules.value = cloneDeep(data.schedule);
  });
} else {
  findByUsersIdGraphql(user.value.id ?? '').onResult((res) => {
    propose.value.departmentProposed = res.data?.findByUsersId?.name ?? '';
  });
}

function submit() {
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid) {
        const formData = new FormData(form.value);
        if (props.id) {
          updatePropose(props.id, formData).then((res) => {
            toastSuccess({ message: 'Cập nhật đề xuất thành công.' });
            emits('hide-dialog');
          });
        } else {
          savePropose(formData).then((res) => {
            toastSuccess({ message: 'Thêm mới đề xuất thành công.' });
            emits('hide-dialog');
          });
        }
      }
    });
}

function deleteSchedule(index: number) {
  schedules.value = schedules.value.filter((s, inx) => inx != index);
}

categoryResult((res) => {
  trainingInstitutions.value = res.data.getAllCategory;
});

getAllUserMoreInfoGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfo;
});

function addSchedule() {
  schedules.value.push({
    id: '',
    trainingContent: '',
    scope: '',
    teacher: '',
    telephoneNumber: '',
    startTime: new Date(),
    endTime: new Date()
  });
  schedules.value = [...schedules.value || [], ...([] as Schedule[])];
}

function updateFile(files: EmployeeAttachment[]) {
  propose.value = {
    ...propose.value,
    files
  };
}

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  modelReactive[event.index] = event.newData as Schedule;
}

onMounted(() => {
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
    organizationsFlat.value = res.data?.allOrganizationPublic || [];
    if (!props.id) {
      propose.value.implementingUnit = organizations.value[0]?.key ?? '';
    }
  });
});
</script>

<style scoped>

</style>