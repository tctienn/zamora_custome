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
          <!--          <Button-->
          <!--            icon='pi pi-plus'-->
          <!--            :label='t("common.saveAndContinue")'-->
          <!--            @click='saveAndContinue'/>-->
          <Button
            icon='pi pi-save'
            :label='t("common.save")'
            @click='saveAndClose'/>
          <SplitButton
            v-if='model.employeeId'
            :model='items'
            severity='warning'>
            <span class='align-items-center flex font-medium gap-2'>
              <AppIcon
                name='add_circle_outline'
                size='1.3'/>
              <span>{{ t('hrm.profile.addMoreInfo') }}</span>
            </span>
          </SplitButton>
        </div>
      </div>
    </template>
    <HrmProfileForm
      ref='formRef'
      v-model='model'/>
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
    :snapshot-id='model.snapshotId'
    :visible-dialog='healthForm'
    @hide-dialog='hideHealthFormFn'/>
  <ProfessionalSkills
    v-if='professionalSkillsForm'
    :snapshot-id='model.snapshotId'
    :visible-dialog='professionalSkillsForm'
    @hide-dialog='hideProfessionalSkillsForm'/>

  <OtherFile
    v-if='visibleOtherFile'
    :employee-id='model.employeeId'
    :visible='visibleOtherFile'
    @hide-sidebar='visibleOtherFile = false'/>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { inject, nextTick, type PropType, provide, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { InvalidEmployeeType } from '@/apps/hrm/model/contract';
import type { Employee } from '@/apps/hrm/model/employee';
import HealthForm from '@/apps/hrm/views/profile/form/health/HealthForm.vue';
import OtherFile from '@/apps/hrm/views/profile/form/OtherFile.vue';
import ProfessionalSkills from '@/apps/hrm/views/profile/form/professionalSkills/ProfessionalSkills.vue';
import ReceivingDocForm from '@/apps/hrm/views/profile/form/receiving-doc/ReceivingDocForm.vue';
import RelationshipInfoForm from '@/apps/hrm/views/profile/form/relationship/RelationshipInfoForm.vue';
import CertificateForm from '@/apps/hrm/views/profile/form/training-process/CertificateForm.vue';
import TrainingProcessForm from '@/apps/hrm/views/profile/form/training-process/TrainingProcessForm.vue';
import WorkProcessForm from '@/apps/hrm/views/profile/form/work-process/WorkProcessForm.vue';
import HrmProfileForm from '@/apps/hrm/views/profile/HrmProfileForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { scrollToError } from '@/common/helpers/errorHelper';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({
  type: Object as PropType<Employee>,
  default: {} as Employee
});

const visibleOtherFile = ref(false);
const v$: Ref<Validation> = useVuelidate();
const formRef = ref<InstanceType<typeof HrmProfileForm>>();
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

async function saveAndClose() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (isValid) {
    formRef.value?.submitForm().then(() => {
      toastSuccess();
      visible.value = false;
      needRefresh.value = true;
      resetData();
    })
      .catch((error: any) => {
        apiError.value = {
          code: error.message?.includes('CCCD') ? InvalidEmployeeType.CCCD : InvalidEmployeeType.EMPLOYEECODE,
          message: error.message
        };
      });
  } else {
    await nextTick(scrollToError);
  }
}

async function saveAndContinue() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (isValid) {
    formRef.value?.submitForm().then(() => {
      toastSuccess();
      needRefresh.value = true;
      resetData();
    })
      .catch((error: any) => {
        apiError.value = {
          code: error.message?.includes('CCCD') ? InvalidEmployeeType.CCCD : InvalidEmployeeType.EMPLOYEECODE,
          message: error.message
        };
      });
  } else {
    await nextTick(scrollToError);
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
  }, {
    label: 'Kỹ năng chuyên môn',
    icon: '',
    command: () => {
      professionalSkillsForm.value = true;
    }
  }, {
    label: 'Sức khỏe',
    icon: '',
    command: () => {
      healthForm.value = true;
    }
  },
  {
    label: 'Giấy tờ tiếp nhận',
    icon: '',
    command: () => {
      receivingDocForm.value = true;
    }
  },
  {
    label: t('hrm.profile.otherFile'),
    icon: '',
    command: () => {
      visibleOtherFile.value = true;
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

provide('refreshFamilyRelationshipInfoTable', refreshFamilyRelationshipInfoTable);
provide('refreshWorkProcessTable', refreshWorkProcessTable);
provide('refreshTrainingProcessTable', refreshTrainingProcessTable);
provide('refreshCertificateTable', refreshCertificateTable);
provide('refreshReceivingDocTable', refreshReceivingDocTable);
provide('refreshHealthFormTab', refreshHealthFormTab);
</script>

<style scoped>
</style>
