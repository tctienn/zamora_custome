<template>
  <div>
    <form
      ref='missionForm'
      class='mb-4'
      @submit.prevent='handleSubmitForm'>
      <div class='formgrid grid mb-6'>
        <div class='col'>
          <div class=''>
            <div class='flex flex-column gap-2 justify-content-end pb-3'>
              <label
                v-required>
                {{ t('mission.mission.properties.name') }}
              </label>
              <InputText
                v-if='!isDetail'
                v-model='mission.name'
                class='p-component p-inputtext'
                maxlength='255'
                name='name'/>
              <span
                v-else
                class='font-bold'>
                {{ mission.name }}
              </span>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
             
            </div>
          </div>
          <div class='flex justify-content-between'>
            <div class='col-6 field pl-0'>
              <label>
                {{ t('mission.mission.properties.type') }}
              </label>
              <div v-if='!isDetail'>
                <Dropdown
                  v-model='mission.missionType'
                  class='p-component w-full'
                  :disabled ='isDisabled'
                  filter
                  name='missionType'
                  option-label='name'
                  option-value='id'
                  :options='typeOptions'
                  show-clear>
                </Dropdown>
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ formatMissionType(mission.missionType) }}</p>
              </div>
              <input
                v-model='mission.missionType'
                hidden
                name='missionType'>

            </div>
            <div class='col-6 field pr-0'>
              <label>
                {{ t('mission.mission.properties.code') }}
              </label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='mission.code'
                  class='p-component p-inputtext w-full'
                  :disabled='!allowEditCode || isDisabled'
                  maxlength='255'/>
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ mission.code }}</p>
              </div>
              <input
                name='code'
                type='hidden'
                :value='mission.code' />
            </div>
          </div>
          <div class='flex gap-5 justify-content-between'>
            <div class='field w-full'>
              <label
                v-required> {{ t('mission.mission.properties.startTime') }}</label>
              <div
                v-if='!isDetail'
                class='w-full'>
                <NamedInputCalendar
                  v-model='mission.startDate'
                  :disabled ='isDisabled'
                  input-format='YYYY-MM-DD'
                  name='startDate'
                  :select-other-months='true'
                  show-icon/>
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ formatDate(mission.startDate, 'DD/MM/YYYY') || '' }}</p>
              </div>
              <ValidateErrorMessage :errors='v$.startDate.$errors'/>
            </div>
            <div class='field w-full'>
              <label
                v-required> {{ t('mission.mission.properties.endTime') }}</label>
              <div
                v-if='!isDetail'
                class='w-full'>
                <NamedInputCalendar
                  v-model='mission.endDate'
                  :disabled ='isDisabled'
                  format='DD/MM/YYYY'
                  input-format='YYYY-MM-DD'
                  name='endDate'
                  :select-other-months='true'
                  show-icon/>
                <ValidateErrorMessage :errors='v$.endDate.$errors'/>
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ formatDate(mission.endDate, 'DD/MM/YYYY') || '' }}</p>
              </div>
            </div>
          </div>
          <div class='flex ustify-content-between'>
            <div class='col-6 field pl-0'>
              <label>
                {{ t('mission.mission.properties.budget') }}
              </label>
              <div
                v-if='!isDetail'>
                <InputText
                  v-model='budgetText'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  @input='formatBudgetInput'
                  @keydown='preventNonNumeric'/>
                <ValidateErrorMessage :errors='v$.budget.$errors'/>
                <input
                  name='budget'
                  type='hidden'
                  :value='mission.budget' />
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ budgetText }}</p>
              </div>
            </div>

            <div class='col-6 field pr-0'>
              <label>
                {{ t('mission.mission.properties.relatedParentMissionId') }}
              </label>
              <div v-if='!isDetail'>
                <TreeSelectWithFilter
                  v-model='selectedParentMission'
                  class='w-full'
                  :disabled ='isDisabled'
                  :options='missionTree'
                  placeholder='Chọn nhiệm vụ cha'
                  selection-mode='single' />
                <input
                  name='relatedParentMissionId'
                  type='hidden'
                  :value='mission.relatedParentMissionId'/>
              </div>
              <div
                v-else
                class='font-bold'>
                <p>{{ mission.relatedParentMissionName }}</p>
              </div>
            </div>
          </div>
          <div class='field'>
            <label
              v-required>
              {{ t('mission.mission.properties.host') }}
            </label>
            <div v-if='!isDetail'>
              <TreeSelectWithFilter
                v-model='selectedOrganization'
                class='w-full'
                :disabled='isOnlyOneDepartment || isDisabled'
                :options='tree'
                :placeholder="t('mission.activity.placeholder.selectHostUnit')"
                selection-mode='single'>
              </TreeSelectWithFilter>
              <ValidateErrorMessage :errors='v$.hostUnit.$errors'/>
              <input
                name='hostUnit'
                type='hidden'
                :value='mission.hostUnit'/>
            </div>
            <div
              v-else
              class='font-bold'>
              <p>{{ hostUnitName }}</p>
            </div>
          </div>

          <div class='field'>
            <label>{{ t('mission.mission.properties.description') }}</label>
            <div v-if='!isDetail'>
              <AppEditor
                v-model='mission.description'
                class='w-full'
                editor-style='height: 15rem;'>
              </AppEditor>
              <input
                v-model='mission.description'
                hidden
                name='description'>
            </div>
            <div
              v-else
              class='font-bold'>
              <p v-sanitize-html='mission.description'></p>
            </div>
          </div>

          <div>
            <div class='align-content-center align-items-center flex justify-content-between mb-2 vertical-align-middle'>
              <label
                class='font-semibold text-xl'
                for='attach'>{{ t('mission.mission.properties.attachFile') }}</label>
              <div class='align-items-center flex gap-1'>
                <ButtonIcon
                  v-if='!isDetail'
                  class='border-round-sm'
                  icon='add'
                  :label="t('mission.mission.properties.addFile')"
                  severity='warning'
                  size='small'
                  @click='handleShowFileModal'/>

                <ButtonIcon
                  v-if='!isDetail'
                  class='border-round-sm'
                  icon='cloud_upload'
                  @click='chooseFromEcmDialogVisible = true'/>
              </div>
            </div>
            <AttachFileMission
              v-model:deleted-attachment='deleteFileIds'
              v-model:receiving-docs='attachedFiles'
              class='mt-2'
              :is-detail = 'isDetail'/>
          </div>
        </div>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          v-if='!isDetail'
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='isSubmitting'
          type='submit'/>
      </div>
    </form>
    <AddFileModal
      v-if='showAddFileDialog'
      v-model:visible-dialog='showAddFileDialog'
      @submit='handleSubmitFile' />

    <ChooseFromEcmDialog
      v-model:visible='chooseFromEcmDialogVisible'
      @choose-files='chooseFileEcm'/>
  </div>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import { deleteMissionFileAttachment, getMissionDetailById } from '@/apps/mission/api/graphql/mission';
import { findParameterMsConfig, getMissionCode, increaseMissionStartValue } from '@/apps/mission/api/graphql/parameter-config';
import { createMission, updateMission } from '@/apps/mission/api/rest/mission';
import { appendFilesToFormData, convertToOrganizationTreeNodesDepartmentUser, convertToTreeOptions, findLabelById, formatMissionType } from '@/apps/mission/helpers/convert';
import { useCurrencyFormatter } from '@/apps/mission/helpers/currencyFormat';
// eslint-disable-next-line max-len
import { defaultMission, type FileAttachmentInterface, type IFileAttachment, type MissionInterface, type MissionTreeInterface, MissionType, type MissionTypeInterface, type TreeOption } from '@/apps/mission/model/mission/mission';
import AddFileModal from '@/apps/mission/views/mission/component/AddFileModal.vue';
import AttachFileMission from '@/apps/mission/views/mission/component/AttachFileMission.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import type { EcmFile } from '@/common/model/ecm';
import { useUserStore } from '@/common/store/user';

import { getMissionTree } from '../../../api/rest/mission';
import TreeSelectWithFilter from './TreeSelectWithFilter.vue';
const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  isDetail: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);

const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers;

const tree = ref<TreeNode[]>([]);
const selectedOrganization = ref<TreeSelectionKeys>();
const attachedFiles = ref<IFileAttachment[]>([]);

const budgetText = ref<string>('');
const missionTree = ref<TreeOption[]>([]);
const departmentsUser = ref<string[]>([]);
const isOnlyOneDepartment = computed(() => departmentsUser.value?.length === 1);
const selectedParentMission = ref();
const allowEditCode = ref(true);
const chooseFromEcmDialogVisible = ref(false);
const { mutate: deleteAttachment } = deleteMissionFileAttachment();
const { preventNonNumeric, createBudgetInputHandler, formatCurrency } = useCurrencyFormatter();

const mission = ref<MissionInterface>({} as MissionInterface);
const showAddFileDialog = ref<boolean>(false);
const deleteFileIds = ref<Set<string>>(new Set());
const isDisabled = computed(() => mission.value?.status === 'IN_PROGRESS');

if(user.value.id){
  departmentsUser.value = usersMoreInfo.value[user.value.id]?.departments.map(d => d.id);
}
getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodesDepartmentUser(res.data?.allOrganizationPublic || [], departmentsUser.value);
  if (departmentsUser.value?.length === 1) {
    selectedOrganization.value = { [departmentsUser.value[0]]: true };
    mission.value.hostUnit = departmentsUser.value[0];
  } 
  // else if (tree.value[0]?.key) {
  //   selectedOrganization.value = { [tree.value[0].key]: true };
  //   mission.value.hostUnit = tree.value[0].key;
  // };
});

if (props.id) {
  const { onResult, onError } = getMissionDetailById(props.id);
  onResult(res => {
    const value = get(res, 'data.getMissionDetailById');
    mission.value = {
      ...value,
      relatedParentMissionId: value.parentMission.missionParentId ? value.parentMission.missionParentId : undefined,
      relatedParentMissionName: value.parentMission.missionParentName,
      startDate: value.startDate ? new Date(value.startDate) : undefined,
      endDate: value.endDate ? new Date(value.endDate) : undefined,
    };
    selectedParentMission.value = { [value.parentMission.missionParentId]: true };
    budgetText.value = formatCurrency(value.budget);
    if (mission.value.hostUnit) {
      selectedOrganization.value = { [mission.value.hostUnit]: true };
    }
    if (Array.isArray(value.attachments)) {
      attachedFiles.value = value.attachments.map((att: FileAttachmentInterface) => ({
        quote: att.quote || '',
        attachment: {
          name: att.attachment,
          size: att.size
        }, 
        downloadPath: att.downloadPath,
        id: att.id
      }));
    }
  });
  onError(()=>{
    mission.value.hostUnit = '';
  });
} else {
  mission.value = cloneDeep(defaultMission);
}

const { onResult: findParameterConfigResult } = findParameterMsConfig();
findParameterConfigResult((res) => {
  const settings = res.data.findParameterMsConfig?.value?.mission?.codeSettings;
  allowEditCode.value = !!settings?.allowEdit;
  if (!props.id && settings?.enabled) {
    const { onResult } = getMissionCode();
    onResult((res) => {
      mission.value.code = res.data.getMissionCode;
    });
  }
});

onMounted(async () => {
  const res = await getMissionTree();
  if(res) {
    missionTree.value = convertToTreeOptions<MissionTreeInterface>(
      res,
      item => item.missionId,
      item => item.missionName,
      item => item.children,
      props.id
    );
  }
});

const handleShowFileModal = ()=>{
  showAddFileDialog.value = true;
};

watch(()=> selectedOrganization.value, ()=>{
  mission.value.hostUnit = Object.keys(selectedOrganization.value || {})[0] || '';
});
const hostUnitName = computed(() => mission.value.hostUnit ? findLabelById(tree.value, mission.value.hostUnit) : '');

watch(()=> selectedParentMission.value, ()=>{
  mission.value.relatedParentMissionId = Object.keys(selectedParentMission.value || {})[0] || '';
});

const formatBudgetInput = createBudgetInputHandler(budgetText, (raw) => {
  mission.value.budget = raw;
});

const MAX_BUDGET = 2_000_000_000;
const { t } = useI18n();
const validateRules = {
  name: { required: helpers.withMessage(t('mission.mission.errors.name'), required) },
  startDate: { required: helpers.withMessage(t('mission.mission.errors.startDate'), required) },
  hostUnit: { required: helpers.withMessage(t('mission.mission.errors.hostUnit'), required) },
  endDate: {
    required: helpers.withMessage(t('mission.mission.errors.endDate'), required),
    checkEndTime: helpers.withMessage(t('mission.mission.errors.startTimeAfterEndTime'), (value: Date | undefined) => {
      return value == undefined || value > mission.value.startDate;
    })
  },
  budget: {
    maxValue: helpers.withMessage(t('mission.mission.errors.budgetTooHigh'), (value: string | undefined) => {
      if (!value) {
        return true;
      }
      const num = Number(value.toString().replace(/[^0-9.-]/g, ''));
      return !isNaN(num) && num <= MAX_BUDGET;
    }
    ),
  }
};
const v$ = useVuelidate(validateRules, mission);
const typeOptions = ref<MissionTypeInterface[]>([
  {
    id: MissionType.TRONG_TAM,
    name: 'Trọng tâm'
  },
  {
    id: MissionType.THUONG_QUY,
    name: 'Thường quy'
  },
  {
    id: MissionType.PHAT_SINH,
    name: 'Phát sinh'
  }
]);

const missionForm = ref<HTMLFormElement>();
const isSubmitting = ref<boolean>(false);

const handleSubmitFile = (fileData: IFileAttachment) => {
  if (fileData?.attachment) {
    const fileLocal: IFileAttachment = {
      ...fileData,
      type: 'LOCAL'
    };
    attachedFiles.value.push(fileLocal);
  }
  showAddFileDialog.value = false;
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteAttachment({ id });
};

function chooseFileEcm(data: EcmFile[]) {
  const ecmFiles: IFileAttachment[] = data.map((d: EcmFile) => ({
    quote: d.name || '',
    attachment: {
      name: d.name,
      size: d.size
    }, 
    downloadPath: d.treePath,
    id: d.id,
    type: 'CLOUD'
  }));
  const nonCloudFiles = attachedFiles.value.filter(f => f.type !== 'CLOUD');
  attachedFiles.value = [...nonCloudFiles, ...ecmFiles];
}

const { mutate: increaseMissionStartValueMutate } = increaseMissionStartValue();
function handleSubmitForm() {
  const handleSuccess = (message: string) => {
    toastSuccess({ message });
    emits('hide-dialog');
    mission.value = cloneDeep(defaultMission);
    v$.value.$reset();
  };

  const handleValidation = (isValid: boolean) => {
    console.log(deleteFileIds.value);
    
    if (isValid && missionForm.value) {
      isSubmitting.value = true;
      const formData = new FormData(missionForm.value);
      appendFilesToFormData(formData, attachedFiles.value);
      const action = props.id ? updateMission(formData, props.id) : createMission(formData);

      action
        .then(() => {
          for (const fileId of deleteFileIds.value) {
            handleDeleteFileAttachment(fileId);
          }
          deleteFileIds.value = new Set();
          if(!props.id){
            increaseMissionStartValueMutate({});
          }
          const successMessage = props.id ? t('common.result.message.updateSuccess') : t('common.result.message.createSuccess');
          handleSuccess(successMessage);
        })
        .catch((handleError) => {
          if(handleError.code === 'ParentInvalid'){
            toastError({ message: t('mission.mission.errors.can_not_select_the_same_record_as_its_parent') });
          }else{
            toastError({ message: t('mission.mission.errors.errors') });
          }
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }
  };
  v$.value.$validate().then(isValid => {
    handleValidation(isValid);
  });
}

</script>

<style scoped>
::v-deep(.p-calendar) {
  width: 100%;
}

.p-treeselect {
  min-width: 100%;
}

</style>