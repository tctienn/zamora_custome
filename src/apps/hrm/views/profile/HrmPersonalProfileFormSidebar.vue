<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:80rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.profile.resume') }}
        </div>
        <div class='flex gap-2'>

          <Button
            icon='pi pi-plus'
            :label='t("common.saveAndContinue")'
            @click='saveDraftAndContinue'/>
          <Button
            icon='pi pi-save'
            :label='t("common.saveAndClose")'
            @click='saveDraftAndClose'/>
          <SplitButton
            v-if='snapshotStatus === "DRAFT"'
            :model='items'
            severity='warning'>
            <span class='align-items-center flex font-bold gap-2'>
              <AppIcon
                name='add_circle_outline'
                size='1.3'/>
              <span>{{ t('hrm.profile.addMoreInfo') }}</span>
            </span>
          </SplitButton>
        </div>
      </div>
    </template>
    <HrmPersonalProfileForm
      ref='formRef'
      v-model='model'
      :is-edit-by-self='true'
      :is-view='profileStatus !== PROFILE_STATUS.DRAFT'
      @update:success='handleUpdateSuccess'/>
  </Sidebar>

  <RelationshipInfoForm
    v-if='relationshipInfoForm'
    :snapshot-id='model.snapshotId'
    :visible-dialog='relationshipInfoForm'
    @hide-dialog='hideRelationshipInfoFormFn'/>
  <WorkProcessForm
    v-if='workProcessForm'
    :employee-id='model.employeeId'
    :snapshot-id='model.snapshotId'
    :visible-dialog='workProcessForm'
    @hide-dialog='hideWorkProcessFormFn'/>
  <TrainingProcessForm
    v-if='trainingProcessForm'
    :employee-id='model.employeeId'
    :snapshot-id='model.snapshotId'
    :visible-dialog='trainingProcessForm'
    @hide-dialog='hideTrainingProcessFormFn'/>
  <CertificateForm
    v-if='certificateForm'
    :employee-id='model.employeeId'
    :snapshot-id='model.snapshotId'
    :visible-dialog='certificateForm'
    @hide-dialog='hideCertificateFormFn'/>
  <ReceivingDocForm
    v-if='receivingDocForm'
    :employee-id='model.employeeId'
    :snapshot-id='model.snapshotId'
    :visible-dialog='receivingDocForm'
    @hide-dialog='hideReceivingDocFormFn'/>
  <HealthForm
    v-if='healthForm'
    :is-create-draft='true'
    :snapshot-id='model.snapshotId'
    :visible-dialog='healthForm'
    @hide-dialog='hideHealthFormFn'/>
  <ProfessionalSkills
    v-if='professionalSkillsForm'
    :snapshot-id='model.snapshotId'
    :visible-dialog='professionalSkillsForm'
    @hide-dialog='hideProfessionalSkillsForm'/>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { inject, nextTick, type PropType, provide, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { sendToApproveEmployeeProfile } from '@/apps/hrm/api/rest/employee';
import { InvalidEmployeeType } from '@/apps/hrm/model/contract';
import type { Employee } from '@/apps/hrm/model/employee';
import HealthForm from '@/apps/hrm/views/profile/form/health/HealthForm.vue';
import ProfessionalSkills from '@/apps/hrm/views/profile/form/professionalSkills/ProfessionalSkills.vue';
import ReceivingDocForm from '@/apps/hrm/views/profile/form/receiving-doc/ReceivingDocForm.vue';
import RelationshipInfoForm from '@/apps/hrm/views/profile/form/relationship/RelationshipInfoForm.vue';
import CertificateForm from '@/apps/hrm/views/profile/form/training-process/CertificateForm.vue';
import TrainingProcessForm from '@/apps/hrm/views/profile/form/training-process/TrainingProcessForm.vue';
import WorkProcessForm from '@/apps/hrm/views/profile/form/work-process/WorkProcessForm.vue';
import HrmPersonalProfileForm from '@/apps/hrm/views/profile/HrmPersonalProfileForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { PROFILE_STATUS } from '@/common/constants/profile';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { scrollToError } from '@/common/helpers/errorHelper';

const props = defineProps({
  oldSnapshotId: {
    type: String,
    default: ''
  },
  snapshotStatus: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['refetch:snapshot', 'update:status']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});

const v$: Ref<Validation> = useVuelidate();
const formRef = ref<InstanceType<typeof HrmPersonalProfileForm>>();
const needRefresh = inject('needRefresh', ref(false));
const resetData = inject('resetData', () => void {});
const relationshipInfoForm = ref(false);
const workProcessForm = ref(false);
const trainingProcessForm = ref(false);
const certificateForm = ref(false);
const receivingDocForm = ref(false);
const healthForm = ref(false);
const professionalSkillsForm = ref(false);
const apiError = ref({
  code: '',
  message: ''
}); // chứa message từ API
const currentProfileStatus = inject('profileStatus', ref<string>(''));

async function saveDraftAndClose() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (isValid) {
    try {
      await formRef.value?.submitForm(); // chỉ gọi 1 lần
      toastSuccess();
      visible.value = false;
      needRefresh.value = true;
      emits('refetch:snapshot', model.value.employeeId);
      resetData();
    } catch (error: any) {
      apiError.value = {
        code: error.message.includes('CCCD') ? InvalidEmployeeType.CCCD : InvalidEmployeeType.EMPLOYEECODE,
        message: error.message
      };
      toastError();
    }
  } else {
    await nextTick(scrollToError);
  }
}

async function saveDraftAndContinue() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    await nextTick(scrollToError);
    return;
  }

  if (!formRef.value?.submitForm) {
    return;
  }

  try {
    await formRef.value.submitForm();
    toastSuccess();
    visible.value = false;
    needRefresh.value = true;
    emits('refetch:snapshot', model.value.employeeId);
    resetData();
  } catch (error: any) {
    apiError.value = {
      code: error.message?.includes('CCCD') ? InvalidEmployeeType.CCCD : InvalidEmployeeType.EMPLOYEECODE,
      message: error.message || 'Đã có lỗi xảy ra'
    };
    toastError();
  }
}

provide('apiError', apiError);

function hideForm() {
  visible.value = false;
  resetData();
}

const items = [

  {
    label: 'Quan hệ gia đình',
    icon: '',
    command: () => {
      relationshipInfoForm.value = true;
    }
  },
  {
    label: 'Quá trình đào tạo',
    icon: '',
    command: () => {
      trainingProcessForm.value = true;
    }
  },
  {
    label: 'Chứng chỉ',
    icon: '',
    command: () => {
      certificateForm.value = true;
    }
  },
  {
    label: 'Quá trình công tác',
    icon: '',
    command: () => {
      workProcessForm.value = true;
    }
  },
  {
    label: 'Kỹ năng chuyên môn',
    icon: '',
    command: () => {
      professionalSkillsForm.value = true;
    }
  },
  {
    label: 'Sức khỏe',
    icon: '',
    command: () => {
      healthForm.value = true;
    }
  },
];

const refreshFamilyRelationshipInfoTable = ref(false);
const refreshWorkProcessTable = ref(false);
const refreshTrainingProcessTable = ref(false);
const refreshCertificateTable = ref(false);
const refreshReceivingDocTable = ref(false);
const refreshHealthFormTab = ref(false);

function hideRelationshipInfoFormFn() {
  relationshipInfoForm.value = false;
  refreshFamilyRelationshipInfoTable.value = true;
}

function hideWorkProcessFormFn() {
  workProcessForm.value = false;
  refreshWorkProcessTable.value = true;
}

function hideTrainingProcessFormFn() {
  trainingProcessForm.value = false;
  refreshTrainingProcessTable.value = true;
}

function hideCertificateFormFn() {
  certificateForm.value = false;
  refreshCertificateTable.value = true;
}

function hideReceivingDocFormFn() {
  receivingDocForm.value = false;
  refreshReceivingDocTable.value = true;
}

function hideHealthFormFn() {
  healthForm.value = false;
  refreshHealthFormTab.value = true;
}

function hideProfessionalSkillsForm() {
  professionalSkillsForm.value = false;
}

const sendToApprove = async () => {

  if (model.value.employeeId && model.value.snapshotId) {
    const res = await sendToApproveEmployeeProfile(model.value.employeeId, model.value.snapshotId);
    visible.value = false;

    if (res) {
      emits('refetch:snapshot', model.value.employeeId);
      emits('update:status', PROFILE_STATUS.PENDING);
      toastSuccess();
      needRefresh.value = true;
    }
  }
};

// Handle the update success event from the form
function handleUpdateSuccess(updateData: { employeeId: string; snapshotId: string; isDraft: boolean; result: any }) {

  // Trigger profile history refetch to update version info
  emits('refetch:snapshot', updateData.employeeId);

  // Set the refresh flag
  needRefresh.value = true;

  // If it was a draft update, the status should remain DRAFT
  // If it was creating a new draft, the status should be DRAFT
  if (updateData.isDraft) {
    emits('update:status', PROFILE_STATUS.DRAFT);
  } else {
    emits('update:status', PROFILE_STATUS.DRAFT); // New draft created
  }
}

defineExpose({ sendToApprove });

provide('refreshFamilyRelationshipInfoTable', refreshFamilyRelationshipInfoTable);
provide('refreshWorkProcessTable', refreshWorkProcessTable);
provide('refreshTrainingProcessTable', refreshTrainingProcessTable);
provide('refreshCertificateTable', refreshCertificateTable);
provide('refreshReceivingDocTable', refreshReceivingDocTable);
provide('refreshHealthFormTab', refreshHealthFormTab);

const profileStatus = inject('profileStatus', ref<string>(''));
</script>

<style scoped>
</style>
