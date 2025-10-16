<template>
  <div
    class='formgrid grid mb-6 mx-0'>
    <div class='col'>
      <div class=''>
        <div class='field w-full'>
          <label>
            {{ t('mission.job.properties.jobContent') }}
          </label>
          <div v-if='!isDetail'>
            <Textarea
              v-model='localJobAssign.jobContent'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='jobContent'
              :placeholder="'Nhập ...'"
              rows='5'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ localJobAssign.jobContent }}</p>
          </div>
        </div>
      </div>
      <div class='field'>
        <label
          v-required
          for='unit'>{{
            t('mission.job.properties.employmentContact')
          }}</label>
        <div
          v-if='!isDetail'
          class='field flex gap-5'>
          <div
            v-if='isCreator || !isEditing'
            class='flex'>
            <RadioButton
              v-model='localReceiverType'
              :disabled="jobType === 'OTHER'"
              input-id='unit'
              name='employmentContact'
              value='UNIT'/>
            <label
              class='ml-2'
              for='personal'> {{t('mission.job.properties.UNIT')}} </label>
          </div>
          <div class='flex'>
            <RadioButton
              v-model='localReceiverType'
              input-id='personal'
              name='employmentContact'
              value='PERSONAL'/>
            <label
              class='ml-2'
              for='gender1'> {{ t('mission.job.properties.PERSONAL') }}</label>
          </div>
        </div>
        <div
          v-else
          class='font-bold'>
          <p>{{ t(`mission.job.properties.${localReceiverType}`) }}</p>
        </div>
        <FileUploadViewer
          v-if="localReceiverType === 'UNIT'"
          :existing-file='localJobAssign.handleAttachmentFile'
          :file-name='fileName'
          :is-detail='isDetail'
          :on-delete='handleDeleteFileAssignAttachment'
          :selected-file='fileDocument'
          @file-selected='handleSelectedFile'/>
        <ValidateErrorMessage
          v-if="localReceiverType === 'UNIT' && v$.fileDocument.$errors.length"
          :errors='v$.fileDocument.$errors'/>
        <div class='my-2'>   
          <ValidateErrorMessage
            v-if="localReceiverType === 'UNIT' && v$.selectedUnits.$errors.length" 
            :errors='v$.selectedUnits.$errors'/></div>
        <div class='mt-4'>
          <AssignByUnitTable
            v-show="localReceiverType === 'UNIT'"
            :is-detail='isDetail'
            :level-one-organizations='levelOneOrganizations'
            :selected-units='selectedUnits'
            @selected-unit='handleSelectedUnit'/>
        </div>
        <div class='mb-2 mt-4'>
          <ValidateErrorMessage
            v-if="localReceiverType === 'PERSONAL' && v$.selectedPersonal.$errors.length"
            :errors='v$.selectedPersonal.$errors'/></div>
        <AssignByPersonalTable
          v-show="localReceiverType === 'PERSONAL'"
          :is-detail='isDetail'
          :list-personal='listPersonal'
          :selected-personal='selectedPersonal'
          @selected-personal='handleSelectedPersonal'/>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="$emit('hide-dialog')"/>
        <Button
          v-if='!isDetail'
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='isSubmitting'
          @click='submitJobAssignmentForm'/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { isEqual } from 'lodash';
import Textarea from 'primevue/textarea';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { deleteJobHandleFileAttachment } from '@/apps/mission/api/graphql/job-api';
import { submitJobAssignment } from '@/apps/mission/api/rest/job';
import type { EnhancedOrganization, JobAssignmentInput, JobInput, JobType, PersonalInterface } from '@/apps/mission/model/job/job';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import AssignByPersonalTable from './AssignByPersonalTable.vue';
import AssignByUnitTable from './AssignByUnitTable.vue';
import FileUploadViewer from './FileUploadViewer.vue';

const props = defineProps({
  jobAssign: {
    type: Object as () => JobAssignmentInput,
    default: () => ({
      jobContent: '',
      handleAttachmentFile: null,
      jobHandleId: '' 
    })
  },
  receiverType: {
    type: String as () => 'UNIT' | 'PERSONAL',
    default: 'UNIT'
  },
  jobType: {
    type: String as PropType<JobType | null>,
    default: null
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  selectedUnits: {
    type: Array as () => EnhancedOrganization[],
    default: () => []
  },
  selectedPersonal: {
    type: Array as () => EnhancedOrganization[],
    default: () => []
  },
  levelOneOrganizations: {
    type: Array as () => OrganizationInterface[],
    default: () => []
  },
  listPersonal: {
    type: Array as () => PersonalInterface[],
    default: () => []
  },
  job: {
    type: Object as () => JobInput,
    default: () => ({ id: '' })
  },
  activeTabIndex: {
    type: Number,
    default: 0
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits([
  'update:jobAssign',
  'update:receiverType',
  'update:selectedUnits',
  'update:selectedPersonal',
  'hide-dialog',
  'file-selected',
  'submit',
]);

const { t } = useI18n();

const localJobAssign = ref<JobAssignmentInput>({ ...props.jobAssign });
const isEditing = computed(() => !!localJobAssign.value.jobHandleId);
const localReceiverType = ref<'UNIT' | 'PERSONAL'>(props.receiverType);
watch([() => props.isCreator, isEditing, () => props.jobType], ([isCreator, isEditingVal, jobType]) => {
  
  if (!isCreator && isEditingVal || jobType === 'OTHER') {
    localReceiverType.value = 'PERSONAL';
  }
}, { immediate: true });

const localSelectedUnits = ref<EnhancedOrganization[]>([]);
const localSelectedPersonal = ref<EnhancedOrganization[]>([]);
const isSubmitting = ref<boolean>(false);
const fileDocument = ref<File>();
const fileName = ref<string>('');
const { mutate: deleteAssignAttachment } = deleteJobHandleFileAttachment();
// const handleSubmitForm = inject('handleSubmitForm') as () => void;

onMounted(() => {
  localSelectedUnits .value = [...props.selectedUnits];
  localSelectedPersonal.value = [...props.selectedPersonal];
});
const validateRules = {
  selectedUnits: {
    requiredIfUnit: helpers.withMessage(
      t('mission.job.errors.atLeastOneUnit'),
      (value: EnhancedOrganization[]) => {
        return props.activeTabIndex !== 1 || localReceiverType.value !== 'UNIT' || value.length > 0;
      }
    )
  },
  selectedPersonal: {
    requiredIfPersonal: helpers.withMessage(
      t('mission.job.errors.atLeastOnePersonal'),
      (value: EnhancedOrganization[]) => {
        return props.activeTabIndex !== 1 || localReceiverType.value !== 'PERSONAL' || value.length > 0;
      }
    ),
    mustHaveMainHandler: helpers.withMessage(
      t('mission.job.errors.mustHaveMainHandler'),
      (value: EnhancedOrganization[]) => {
        if (props.activeTabIndex !== 1 || localReceiverType.value !== 'PERSONAL') {
          return true;
        }
        if (!value || value.length === 0) {
          return false;
        }
        return value.some(p => p.isMainHandle === true);
      }
    ),
  },
  
  fileDocument: {
    requiredIfUnit: helpers.withMessage(
      t('mission.job.errors.fileRequired'),
      (value: File | undefined) => {
        if (props.activeTabIndex !== 1) {
          return true;
        }
        if (localReceiverType.value !== 'UNIT') {
          return true;
        }
        if (value) {
          return true;
        }
        return !!localJobAssign.value.handleAttachmentFile?.fileId;
      }
    ),
    maxSize: helpers.withMessage(
      t('mission.job.errors.maxFileSize'),
      (value: File | undefined) => {
        if (props.activeTabIndex !== 1) {
          return true;
        }
        if (!value) {
          return true;
        }
        return value.size <= 20 * 1024 * 1024;
      }
    )
  }
};

const v$ = useVuelidate(validateRules, {
  selectedUnits: localSelectedUnits,
  selectedPersonal: localSelectedPersonal,
  fileDocument: fileDocument
}, { $lazy: true });
watch(
  () => props.jobAssign,
  (newVal) => {
    localJobAssign.value = { ...newVal };
    if (newVal.handleAttachmentFile && !fileDocument.value) {
      fileName.value = newVal.handleAttachmentFile.fileName;
    }
  },
  { deep: true }
);

watch(() => props.selectedPersonal, (newVal) => {
  if (!isEqual(localSelectedPersonal.value, newVal)) {
    localSelectedPersonal.value = [...newVal];
  }
}, {
  deep: true,
  immediate: true 
});

watch(() => props.receiverType, (newVal) => {
  localReceiverType.value = newVal;
  v$.value.$reset();
});

watch(localJobAssign, (newVal) => {
  if (!isEqual(newVal, props.jobAssign)) {
    emits('update:jobAssign', { ...newVal });
  }
}, { deep: true });

watch(localReceiverType, (newVal) => {
  emits('update:receiverType', newVal);
});

watch(localSelectedUnits, (newVal) => {
  emits('update:selectedUnits', [...newVal]);
}, { deep: true });

watch(localSelectedPersonal, (newVal) => {
  emits('update:selectedPersonal', [...newVal]);
}, { deep: true });

const handleSelectedUnit = (data: EnhancedOrganization[]) => {
  localSelectedUnits .value = data;
};

const handleSelectedPersonal = (data: EnhancedOrganization[]) => {
  localSelectedPersonal.value = data;
};

const handleSelectedFile = (file: File) => {
  fileDocument.value = file;
  fileName.value = file.name;
};

const handleDeleteFileAssignAttachment = async (id: string) => {
  await deleteAssignAttachment({ id });
};

const appendAssignListToFormData = (formData: FormData, assignList: EnhancedOrganization[]): void => {
  assignList.forEach((assign, idx) => {
    const prefix = `assignList[${idx}]`;
    formData.append(`${prefix}.assignId`, assign.assignId);
    formData.append(`${prefix}.isMainHandle`, String(assign.isMainHandle));
    formData.append(`${prefix}.isFollower`, String(assign.isFollower));
  });
};

function buildJobAssignmentFormData(
  job: JobInput,
  jobAssign: JobAssignmentInput,
  receiverType: 'UNIT' | 'PERSONAL',
  assignList: EnhancedOrganization[],
  file?: File
): FormData {
  const formData = new FormData();

  if (jobAssign.jobHandleId) {
    formData.append('jobHandleId', jobAssign.jobHandleId);
  }

  formData.append('jobId', job.id);
  formData.append('jobContent', jobAssign.jobContent ? jobAssign.jobContent : '');
  formData.append('employmentContact', receiverType);
  appendAssignListToFormData(formData, assignList);

  if (file && receiverType === 'UNIT') {
    formData.append('attachment', file);
  }

  return formData;
}
async function submitJobAssignmentForm() {
  if (!await v$.value.$validate()) {
    return;
  }
  isSubmitting.value = true;
  try {
    const assignListToSend = localReceiverType.value === 'UNIT' ? localSelectedUnits .value : localSelectedPersonal.value;
    const formDataAssign = buildJobAssignmentFormData(
      props.job,
      localJobAssign.value,
      localReceiverType.value,
      assignListToSend,
      fileDocument.value
    );
    await submitJobAssignment(formDataAssign);
    // handleSubmitForm();
    toastSuccess({
      message: isEditing.value
        ? t('mission.job.message.updateAssignmentSuccess')
        : t('mission.job.message.createAssignmentSuccess')
    });
    if(isEditing.value) {
      emits('submit');
    }else{
      emits('hide-dialog');
    }
   
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if(error.code == 'NoUserInDepartmentFound' || error.code == 'TruongPhongNotFound'){
        toastError({ message: t('mission.job.errors.noUserInDep') });
      } else if(error.code == 'CannotUpdateAcceptedAssign'){
        toastError({ message: t('mission.job.errors.cannotUpdateAcceptedAssign') });
      }else{
        toastError({ message: t('mission.job.message.submitError') });
      }
    }else{
      toastError({ message: t('mission.job.message.submitError') });
    }
    
  } finally {
    isSubmitting.value = false;
  }
}

defineExpose({ submitJobAssignmentForm });
</script>

<style scoped>
</style>