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
    @show='v$.$reset()'>
    <template #header>
      <div
        class='align-items-center flex justify-content-between w-full'
        style='z-index: 1000'>
        <div class='flex gap-1'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='closeSidePlan'/>

          <div class='align-content-center font-semibold text-xl'>
            {{ isNew ? t('hrm.planning.createTitle') : t('hrm.planning.editTitle') }}
          </div>
        </div>

      </div>
    </template>
    <div
      v-if='loadingSubmit'
      class='loading-overlay'>
      <i
        class='pi pi-spin pi-spinner'
        style='font-size: 3rem; color: var(--primary-color)'></i>
    </div>
    <div
      class='mb-8 mt-2 overflow-y-auto surface-0 w-12'
      style='height: calc(100vh - 11rem)'>
      <LoadingSkeleton v-if='loading'/>
      <form
        v-else
        :key="isNew ? 'create' : 'edit'"
        ref='formRef'
        class='flex flex-wrap'>
        <FormInputText
          v-model='model.code'
          class='col-6 mb-0 p-1'
          :error='v$.code.$dirty && v$.code.$errors[0]?.$message'
          :label="t('hrm.planning.noPlan')"
          name='code'
          required/>
        <FormInputCalendar
          v-model='model.planingDate'
          class='col-6 mb-0 p-1'
          :error='v$.planingDate.$dirty && v$?.$errors?.find((error) => error.$property === "planingDate")?.$message?.toString()'
          label='Ngày lập'
          name='planingDate'
          required/>

        <FormInputCalendar
          v-model='model.effectDate'
          class='col-6 mb-0 p-1'
          :error='v$.effectDate.$dirty && v$?.$errors?.find((error) => error.$property === "effectDate")?.$message?.toString()'
          :label='t("hrm.planning.effectDate")'
          :min-date='model.planingDate'
          name='effectDate'
          required/>
        <FormInputCalendar
          v-model='model.expireDate'
          class='col-6 mb-0 p-1'
          :error='v$.expireDate.$dirty && v$.expireDate.$errors[0]?.$message'
          :label='t("hrm.planning.expireDate")'
          :min-date='model.effectDate'
          name='expireDate'
          required/>

        <FormInputText
          v-model='model.planingName'
          class='col-12 mb-0 p-1'
          label='Tên quy hoạch'
          name='planingName'/>

        <FormInputDropdown
          v-model='model.classification'
          class='col-6 mb-0 p-1'
          label='Phân loại'
          name='classification'
          option-label='label'
          option-value='value'
          :options='classificationOptions'/>
        <FormInputText
          v-model='model.term'
          class='col-6 mb-0 p-1'
          label='Nhiệm kỳ'
          name='term'/>
        <FormInputText
          v-model='model.formNumber'
          class='col-6 mb-0 p-1'
          label='Mẫu số'
          name='formNumber'/>
        <FormInputText
          v-model='getCreatorInfo(model.creator).fullName'
          class='col-6 mb-0 opa-1 p-1'
          disabled
          label='Người tạo'
          name='creator'/>
        <input
          v-model='model.creator'
          hidden='hidden'
          name='creator'/>
        <div class='my-3 overflow-scroll w-full'>
          <CreatePlanningTable
            v-model:table-data='model'>
            <p class='font-semibold mb-0 text-xl'>{{ t('hrm.planning.listPlan') }}</p>

          </CreatePlanningTable>

        </div>
        <div>
          <div class='align-item-center flex justify-content-between'>
            <p class='font-semibold mb-0 text-xl'>{{ t("hrm.planning.attachmentData") }}</p>
            <Button
              class='border-round-sm btn flex gap-2'
              severity='warning'
              @click='showModalAttachment = true'>
              <i class='pi pi-paperclip'></i>
              Thêm
            </Button>
          </div>
          <PlanningAttachment
            :attachment='model.files'
            class='mt-3'
            @show-action-menus='showActionMenus'/>
        </div>

      </form>
    </div>
    <div
      class='border-300 border-top-1 fixed flex gap-2 justify-content-center p-0 p-2 surface-overlay w-full'
      style='bottom: 0; left: 0'>
      <Button
        class='border-round-sm'
        icon='pi pi-times'
        label='Hủy'
        severity='danger'
        @click='closeSidePlan'/>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        label='Đồng ý'
        @click='submit'/>
    </div>

  </Sidebar>
  <AddAttachmentModal
    v-model:visible='showModalAttachment'
    :data='fileEdited'
    @close='showModalAttachment = false'
    @update:file='handleFileUpload'/>
  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, nextTick, PropType, provide, reactive, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { createOrUpdatePlaning } from '@/apps/hrm/api/rest/planing';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import LoadingSkeleton from '@/apps/hrm/components/LoadingSkeleton.vue';
import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import CreatePlanningTable from '@/apps/hrm/views/planning/CreatePlanningTable.vue';
import AddAttachmentModal from '@/apps/hrm/views/planning/modal/AddAttachmentModal.vue';
import type { AttachmenFiles, PlanListItem, PlanningInterface } from '@/apps/hrm/views/planning/model';
import PlanningAttachment from '@/apps/hrm/views/planning/table/PlanningAttachment.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
});
const emits = defineEmits(['hide-dialog', 'fetchData']);
const formRef = ref<HTMLFormElement>();
const { user } = storeToRefs(useUserStore());
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const model = defineModel('modelValue', {
  type: Object as PropType<PlanningInterface>,
  default: () => ({
    code: '',
    planingDate: '',
    expireDate: '',
    effectDate: '',
    planingGroups: [{ employees: [{ note: '' }] }]
  })
});
const { moment } = useMoment();
const loading = ref(true);
const { t } = useI18n();
const visibleDialog = ref(false);
const actionMenus = ref();
const showModalAttachment = ref(false);
const fileEdited = ref({} as EmployeeAttachment);
const actionMenusRef = ref();
const currentCreator = ref('');
const loadingSubmit = ref(false);

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

const rules = computed(() => {
  return {
    code: {
      required: helpers.withMessage(t('common.validate.required', { item: t('hrm.planning.noPlan') }), required),
      $autoDirty: true,
    },
    planingDate: {
      required: helpers.withMessage(t('common.validate.required', { item: t('hrm.planning.planDate') }), required),
      $autoDirty: true,
    },
    effectDate: {
      required: helpers.withMessage(t('common.validate.required', { item: t('hrm.planning.effectDate') }), required),
      $autoDirty: true,
    },
    expireDate: {
      required: helpers.withMessage(t('common.validate.required', { item: t('hrm.planning.expireDate') }), required),
      $autoDirty: true,
    },
  };
});

let v$: Ref<Validation> = useVuelidate(rules, model);

watchEffect(() => {
  visibleDialog.value = props.visible;
  if (props.isNew) {

    currentCreator.value = user.value.id ?? '';
    model.value.creator = currentCreator.value;
    model.value.planingDate = new Date();
    if (props.visible) {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  } else {
    currentCreator.value = model.value.creator;
    if (model.value.id && props.visible) {
      loading.value = false;
    }
  }
});

watch(() => props.isNew, () => {
  v$ = useVuelidate(rules, model); // tạo lại instance
});

const appendPlaningGroupsToFormData = (formData: FormData, planingGroups: PlanListItem[]) => {
  planingGroups.forEach((group, groupIndex) => {
    formData.append(`planingGroups[${groupIndex}].groupName`, group.groupName);

    group.employees.forEach((emp: any, empIndex: number) => {
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].employeeId`, emp.employeeId);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].employeeName`, emp.employeeName);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].gender`, emp.gender ? 'true' : 'false');
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].birthDate`, emp.birthDate);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].position`, emp.positionName);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].nation`, emp.nation);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].jobTitle`, emp.jobTitle ?? '');
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].dateOfJoiningParty`, emp.dateOfJoiningParty ?? '');
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].specialization`, emp.specialization);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].politicalTheoryLevel`, emp.politicalTheoryLevel);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].computerSkill`, emp.computerSkill);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].languageSkill`, emp.languageSkill);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].employeeType`, emp.employeeType);
      formData.append(`planingGroups[${groupIndex}].employees[${empIndex}].organizationName`, emp.organizationName);
    });
  });
};

async function submit() {
  loadingSubmit.value = true; // bật loading
  v$.value.$touch();

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  if (!formRef.value) {
    return Promise.reject();
  }

  try {
    if (props.isNew) {
      const data = new FormData(formRef.value);

      if (Array.isArray(model.value.files)) {
        model.value.files.forEach((item, index) => {
          data.append(`files[${index}].name`, item.name);
          data.append(`files[${index}].file`, item.file as Blob);
        });
      }
      if (Array.isArray(model.value.planingGroups)) {
        appendPlaningGroupsToFormData(data, model.value.planingGroups);
      }

      await createOrUpdatePlaning(data);
      toastSuccess({ message: 'Thêm mới thành công.' });
    } else {
      const dataUpdate = new FormData(formRef.value);
      dataUpdate.append('id', model.value.id ?? '');
      if (model.value.expireDate) {
        const formatted = moment(model.value.expireDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        dataUpdate.set('expireDate', formatted);
      }

      if (model.value.planingGroups && model.value.planingGroups.length > 0) {
        appendPlaningGroupsToFormData(dataUpdate, model.value.planingGroups);
      }

      if (model.value.oldFileIds && Array.isArray(model.value.oldFileIds)) {
        model.value.oldFileIds.forEach((id: any) => {
          dataUpdate.append('oldFileIds[]', id);
        });
      }
      if (model.value.files && Array.isArray(model.value.files)) {
        model.value.files.forEach((item, index) => {
          if (item.file instanceof File) {
            dataUpdate.append(`files[${index}].name`, item.name);
            dataUpdate.append(`files[${index}].file`, item.file);
          } else {
            dataUpdate.append(`files[${index}].id`, item.file.id);
          }

        });
      }
      await createOrUpdatePlaning(dataUpdate); // 🧩 Gọi API cập nhật
      toastSuccess({ message: 'Cập nhật thành công.' });
    }

    emits('hide-dialog');
    emits('fetchData');
  } catch (error) {
    console.error('Lỗi khi submit:', error);
  } finally {
    loadingSubmit.value = false; // tắt loading
  }
}

const showActionMenus = (event: Event, index: number) => {
  const file = model.value.files?.[index];
  actionMenus.value = [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => {
        if (file) {
          fileEdited.value = file;
        }
        // fileEdited.value = {
        //   name: model.value.files?.[index]?.name || '',
        //   file: model.value.files?.[index]?.file || null
        // };
        showModalAttachment.value = true;
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (model.value.files && model.value.files[index]) {
          const file = model.value.files[index]; // 👈 nên khai báo rõ

          model.value.files.splice(index, 1);
          if (!props.isNew && file?.file.id) {
            model.value.oldFileIds = model.value.oldFileIds || [];
            model.value.oldFileIds.push(file?.file.id);
          }
        }

      }
    }
  ];
  actionMenusRef.value?.toggle(event);
};

const handleFileUpload = (data: AttachmenFiles) => {
  if (model.value.files === undefined) {
    model.value.files = [];
  }
  model.value?.files.push(data);
  showModalAttachment.value = false;
};

const getCreatorInfo = (val: string) => {
  const userData = allUsers.value.find((user) => user.id === val);
  const userFromLocal = JSON.parse(localStorage.getItem('user') || '{}');
  if (userData) {
    return {
      ...userData,
      avatar: userData?.avatar,
      fullName: userData?.fullName,

    };
  } else if (userFromLocal.user.id === val) {
    return {
      ...userFromLocal,
      avatar: userFromLocal.user?.avatar,
      fullName: userFromLocal.user?.fullName,

    };
  }
  return {
    avatar: userFromLocal.user?.avatar,
    fullName: userFromLocal.user?.fullName,

  };
};
const organizationId = ref<string>();
provide('organizationId', organizationId);

const defaultModel = {
  id: '',
  code: '',
  planingDate: new Date(),
  effectDate: '',
  expireDate: '',
  planingName: '',
  classification: '',
  term: '',
  formNumber: '',
  creator: currentCreator.value,
  files: [],
  planingGroups: [],
  oldFileIds: []
};

const resetForm = () => {
  model.value = cloneDeep(defaultModel); // đảm bảo object mới hoàn toàn
  nextTick(() => {
    v$.value.$reset();
    v$.value.$touch(); // optional: đánh dấu tất cả là untouched
  });
};

const closeSidePlan = () => {
  resetForm();
  emits('hide-dialog');
  emits('fetchData');
};

defineExpose({ submit });
</script>

<style scoped>
:deep(.p-inputtext) {
  opacity: 1;
}
.loading-overlay {
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>