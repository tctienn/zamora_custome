<template>
  <div>
    <form
      ref='activityForm'
      class='mb-4'
      @submit.prevent='handleSubmitForm'>
      <div class='formgrid grid mb-6'>
        <div class='col-12 field'>
          <label
            v-required>
            {{ t('mission.mission.common.mission') }}
          </label>
          <div v-if='!isDetail'>
            <Dropdown
              v-model='activity.missionId'
              class='p-component w-full'
              :disabled ='isDisabled'
              filter
              name='missionId'
              option-label='name'
              option-value='id'
              :options='missionOptions'>
            </Dropdown>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ activity.missionName }}</p>
          </div>
          <input
            v-model='activity.missionId'
            hidden
            name='missionId'>
          <ValidateErrorMessage :errors='v$.missionId.$errors'/>
        </div>

        <div class='col-12 field'>
          <label
            v-required>
            {{ t('mission.activity.properties.name') }}
          </label>
          <div v-if='!isDetail'>
            <InputText
              v-model='activity.activityName'
              class='p-component p-inputtext w-full'
              maxlength='255'
              name='activityName'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ activity.activityName }}</p>
          </div>
          <ValidateErrorMessage :errors='v$.activityName.$errors'/>
        </div>
        <div class='col-12 field'>
          <label>
            {{ t('mission.activity.properties.relatedParentActivityId') }}
          </label>
          <div v-if='!isDetail'>
            <TreeSelectWithFilter
              v-model='selectedParentAcvitity'
              class='w-full'
              :disabled ='isDisabled'
              :options='activityTree'
              placeholder='Chọn hoạt động cha'
              selection-mode='single'/>
            <input
              name='relatedParentActivityId'
              type='hidden'
              :value='activity.relatedParentActivityId'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ activity.relatedParentActivityName }}</p>
          </div>
        </div>
        <div class='align-items-center col-6 field flex gap-2'>
          <Checkbox
            v-model='leaderSubmit'
            binary
            :disabled = 'isDetail || isDisabled' />
          <span>Trình lãnh đạo chấp thuận</span>
        </div>
        <div
          class='col-6'>
          <div
            class='field'
            :class="{ 'invisible-keep-space': !leaderSubmit}">
            <div v-if='!isDetail'>
              <NamedSelectUser
                v-model='activity.requiredGeneralLeaderIdToSubmit'
                :button-select-user='false'
                class='w-full'
                :disabled ='isDisabled'
                name='requiredGeneralLeaderIdToSubmit'
                :options = 'leadershipUserIds'
                placeholder='Chọn lãnh đạo chấp thuận'
                style='height: 40px'/>
              <ValidateErrorMessage :errors='v$.requiredGeneralLeaderIdToSubmit.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              <AppUser
                v-if='activity.requiredGeneralLeaderIdToSubmit'
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible
                :user-id='activity.requiredGeneralLeaderIdToSubmit'></AppUser>
            </div>
          </div>
        </div>
        <div class='col-6 field'>
          <label v-required> {{ t('mission.activity.activityTableCol.expectedDate') }}</label>
          <div
            v-if='!isDetail'
            class='w-full'>
            <NamedInputCalendar
              v-model='activity.expectedTime'
              :disabled ='isDisabled'
              input-format='YYYY-MM-DD'
              :max-date='maxDate'
              :min-date='minDate?.toISOString()'
              name='expectedTime'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.expectedTime.$errors'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ formatDate(activity.expectedTime, 'DD/MM/YYYY') || '' }}</p>
          </div>
        </div>
        <div class='col-6 field'>
          <label
            v-required> {{ t('mission.activity.activityTableCol.endDate') }}</label>
          <div
            v-if='!isDetail'
            class='w-full'>
            <NamedInputCalendar
              v-model='activity.endTime'
              :disabled ='isDisabled'
              format='DD/MM/YYYY'
              input-format='YYYY-MM-DD'
              :max-date='maxDate'
              :min-date='minDate?.toISOString()'
              name='endTime'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.endTime.$errors'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ formatDate(activity.endTime, 'DD/MM/YYYY') || '' }}</p>
          </div>
        </div>
        <div class='col-6 field'>
          <label>
            {{ t('mission.activity.properties.code') }}
          </label>
          <div
            v-if='!isDetail'>
            <InputText
              v-model='activity.activityCode'
              class='p-component p-inputtext w-full'
              :disabled='!allowEditCode || isDisabled'
              maxlength='255'/>
            <ValidateErrorMessage :errors='v$.activityCode.$errors'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ activity.activityCode }}</p>
          </div>
          <input
            name='activityCode'
            type='hidden'
            :value='activity.activityCode' />
        </div>
        <div class='col-6 field'>
          <div class='field'>
            <label>
              {{ t('mission.mission.properties.budget') }}
            </label>
            <div
              v-if='!isDetail'>
              <InputText
                v-model='budgetText'
                class='p-component p-inputtext w-full'
                input-id='integeronly'
                maxlength='255'
                @input='formatBudgetInput'
                @keydown='preventNonNumeric'/>
              <ValidateErrorMessage :errors='v$.budget.$errors'/>
              <input
                name='budget'
                type='hidden'
                :value='activity.budget' />
            </div>
            <div
              v-else
              class='font-bold'>
              <p>{{ budgetText }}</p>
            </div>
          </div>
        </div>

        <div class='col-12 field'>
          <label
            v-required>
            {{ t('mission.mission.properties.host') }}
          </label>
          <div v-if='!isDetail'> 
            <TreeSelectWithFilter
              v-model='selectedOrganization'
              class='w-full'
              :disabled='isDisabled'
              :options='tree'
              :placeholder="t('mission.activity.placeholder.selectHostUnit')"
              selection-mode='single'/>
            <ValidateErrorMessage :errors='v$.hostUnit.$errors'/>
            <input
              name='hostUnit'
              type='hidden'
              :value='activity.hostUnit'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ hostUnitName }}</p>
          </div>
        </div>

        <div class='col-12 field'>
          <label>
            {{ t('mission.activity.properties.coordinationUnitName') }}
          </label>
          <div v-if='!isDetail'>
            <TreeSelectWithFilter
              v-model='selectedParent'
              class='w-full'
              clearable
              :disabled ='isDisabled'
              :empty-message="t('common.selectEmpty')"
              input-id='organizationParent'
              :options='organizations'
              :placeholder="t('mission.activity.placeholder.selectOrganizations')"
              selection-mode='multiple'>
              <template
                #value='{ value }: { value: TreeNode[]; placeholder: String }'>
                <div
                  v-if='value.length > 0'
                  class='flex flex-wrap gap-2'>
                  <Chip
                    v-for='v of value as Required<TreeNode>[]'
                    :key='v.key'
                    :label='v.label'
                    removable
                    @remove.stop='removeSelectedCoordination(v.key)' />
                </div>
                <div v-else>
                  {{ t('mission.activity.placeholder.selectOrganizations') }}
                </div>
              </template>
            </TreeSelectWithFilter>
            <input
              name='coordinationUnitId'
              type='hidden'
              :value='activity.coordinationUnitId'/>
          </div>
          <div
            v-else
            class='font-bold'>
            <p>{{ activity.coordinationUnitName }}</p>
          </div>
        </div>
        <div class='col-12 field'>
          <label>{{ t('mission.mission.properties.description') }}</label>
          <div v-if='!isDetail'>
            <AppEditor
              v-model='activity.description'
              class='w-full'
              editor-style='height: 15rem;'>
            </AppEditor>
          </div>
          <div
            v-else
            class='font-bold'>
            <p v-sanitize-html='activity.description'></p>
          </div>
          <input
            v-model='activity.description'
            hidden
            name='description'>
        </div>
        <div class='col-12'>
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
const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog']);

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { getDetailActivityById } from '@/apps/mission/api/graphql/activity-api';
import { deleteMissionFileAttachment, findAllMission } from '@/apps/mission/api/graphql/mission';
import { findParameterMsConfig, getActivityCode, increaseActivityStartValue } from '@/apps/mission/api/graphql/parameter-config';
import { getActivityTree, saveActivity } from '@/apps/mission/api/rest/activity';
import { appendFilesToFormData, convertToTreeOptions, findLabelById } from '@/apps/mission/helpers/convert';
import { useCurrencyFormatter } from '@/apps/mission/helpers/currencyFormat';
import { type ActivityInput, type ActivityTreeInterface, defaultActivity } from '@/apps/mission/model/activity/activity';
import { RoleType } from '@/apps/mission/model/job/job';
import type { FileAttachmentInterface, IFileAttachment, MissionInterface, TreeOption } from '@/apps/mission/model/mission/mission';
import AppUser from '@/common/components/app/AppUser.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDate } from '@/common/helpers/utils';
import type { EcmFile } from '@/common/model/ecm';
import { useUserStore } from '@/common/store/user';

import AddFileModal from './AddFileModal.vue';
import AttachFileMission from './AttachFileMission.vue';
import TreeSelectWithFilter from './TreeSelectWithFilter.vue';
const activityForm = ref<HTMLFormElement>();

const tree = ref<TreeNode[]>([]);
const treeRaw = ref<OrganizationInterface[]>([]);
const selectedOrganization = ref<TreeSelectionKeys>();
const { preventNonNumeric, createBudgetInputHandler, formatCurrency } = useCurrencyFormatter();
const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo, allUsers } = storeToRefs(store);
const leadershipUserIds = computed(() => {
  return allUsers.value.filter((info) => info.roles?.includes(RoleType.LANH_DAO));
});

const activity = ref<ActivityInput>({} as ActivityInput);
const budgetText = ref('');
const organizations = ref<TreeNode[]>([]);
const missionOptions = ref<MissionInterface[]>([]);
const missionRange = ref<{ start?: Date; end?: Date }>({});
const isSubmitting = ref<boolean>(false);
const selectedParent = ref();
const activityTree = ref<TreeOption[]>([]);
const selectedParentAcvitity = ref();
const allowEditCode = ref<boolean>(true);
const departmentsUser = ref<string[]>([]);
const minDate = computed(() => missionRange.value.start);
const maxDate = computed(() => missionRange.value.end);
const isDisabled = computed(() => activity.value?.status === 'IN_PROGRESS');
const attachedFiles = ref<IFileAttachment[]>([]);
const leaderSubmit = ref<boolean>(true);
const showAddFileDialog = ref<boolean>(false);
const chooseFromEcmDialogVisible = ref(false);
const deleteFileIds = ref<Set<string>>(new Set());
const { mutate: increaseActivityStartValueMutate } = increaseActivityStartValue();
const { mutate: deleteAttachment } = deleteMissionFileAttachment();

if(user.value.id){
  departmentsUser.value = usersMoreInfo.value[user.value.id]?.departments.map(d => d.id);
}

getAllOrganizationPublicGraphql().onResult((res) => {
  const raw = (res.data?.allOrganizationPublic || []).filter(({ id, code }: { id: string, code: string }) => id !== '6882e527f8e78142c4015284' || code !== 'LDTT');
  treeRaw.value = raw;
  const valueDepartmentUnit = convertToOrganizationTreeNodes(raw);
  const value = convertToOrganizationTreeNodes(raw);
  tree.value = valueDepartmentUnit;
  organizations.value = value;
  if (departmentsUser.value?.length === 1) {
    selectedOrganization.value = { [departmentsUser.value[0]]: true };
    activity.value.hostUnit = departmentsUser.value[0];
  }
});

if (props.id) {
  getDetailActivityById(props.id).onResult(res => {
    const value = get(res, 'data.getDetailActivityById');
    activity.value = {
      ...value,
      requiredGeneralLeaderIdToSubmit: value.requiredGeneralLeaderIdToApprove,
      relatedParentActivityName: value.parentActivity.activityParentName,
      relatedParentActivityId: value.parentActivity.activityParentId ? value.parentActivity.activityParentId : undefined,
      expectedTime: value.expectedTime ? new Date(value.expectedTime) : undefined,
      endTime: value.endTime ? new Date(value.endTime) : undefined,
    };
    budgetText.value = formatCurrency(value.budget);
    selectedParentAcvitity.value = value.parentActivity.activityParentId ? { [value.parentActivity.activityParentId]: true } : undefined;
    updateMissionRangeByMissionId(activity.value.missionId);
    const str = value.coordinationUnitId as string;
    const ids = str.replace(/\[|\]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    selectedParent.value = ids.reduce((acc: Record<string, boolean>, id) => {
      acc[id] = true;
      return acc;
    }, {});
    if(!activity.value.requiredGeneralLeaderIdToSubmit){
      leaderSubmit.value = false;
    }
    if (activity.value.hostUnit) {
      selectedOrganization.value = { [activity.value.hostUnit]: true };
    };
    if (Array.isArray(value.activityAttachments)) {
      attachedFiles.value = value.activityAttachments.map((att: FileAttachmentInterface) => ({
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
} else {
  activity.value = cloneDeep(defaultActivity);
}

const { onResult: findParameterConfigResult } = findParameterMsConfig();
findParameterConfigResult((res) => {
  const settings = res.data.findParameterMsConfig?.value?.activity?.codeSettings;
  allowEditCode.value = !!settings?.allowEdit;

  if (!props.id && settings?.enabled) {
    const { onResult } = getActivityCode();
    onResult((res) => {
      activity.value.activityCode = res.data.getActivityCode;
    });
  }
});

function removeSelectedCoordination(key: string) {
  const copy = { ...selectedParent.value };
  delete copy[key];
  selectedParent.value = copy;
}

onMounted(async () => {
  const res = await getActivityTree();
  if(res) {
    activityTree.value = convertToTreeOptions<ActivityTreeInterface>(
      res,
      item => item.activityId,
      item => item.activityName,
      item => item.children,
      props.id
    );
  }
});

function filterTreeWithoutKey(tree: TreeNode[], excludedKey: string): TreeNode[] {
  return tree
    .filter(node => node.key !== excludedKey)
    .map(node => ({
      ...node,
      children: node.children ? filterTreeWithoutKey(node.children, excludedKey) : []
    }));
}

function filterTreeWithoutKeys(tree: TreeNode[], excludedKeys: string[]): TreeNode[] {
  return tree
    .filter(node => !excludedKeys.includes(node.key as string))
    .map(node => ({
      ...node,
      children: node.children ? filterTreeWithoutKeys(node.children, excludedKeys) : []
    }));
}

watch(()=> selectedParentAcvitity.value, ()=>{
  activity.value.relatedParentActivityId = Object.keys(selectedParentAcvitity.value || {})[0] || '';
});

watch(() => activity.value.hostUnit, (hostUnitId) => {
  if (!hostUnitId) {
    return;
  }

  const currentTree = convertToOrganizationTreeNodes(treeRaw.value);
  organizations.value = filterTreeWithoutKey(currentTree, hostUnitId);

  if (selectedParent.value && selectedParent.value[hostUnitId]) {
    const copy = { ...selectedParent.value };
    delete copy[hostUnitId];
    selectedParent.value = copy;
  }
});

watch(()=> selectedOrganization.value, ()=>{
  activity.value.hostUnit = Object.keys(selectedOrganization.value || {})[0] || '';
});

const hostUnitName = computed(() => activity.value.hostUnit ? findLabelById(tree.value, activity.value.hostUnit) : '');

watch(selectedParent, (val) => {
  activity.value.coordinationUnitId = Object.keys(val || {}).toString();
  const selectedIds = Object.keys(val || {});
  const currentTree = convertToOrganizationTreeNodes(treeRaw.value);
  const hostUnit = activity.value.hostUnit;

  if (hostUnit && selectedIds.includes(hostUnit)) {
    const newSelected = { ...val };
    delete newSelected[hostUnit];
    selectedParent.value = newSelected;
  }
  tree.value = filterTreeWithoutKeys(currentTree, selectedIds);
}, { deep: true });

function updateMissionRangeByMissionId(missionId?: string) {
  const mission = missionOptions.value.find(m => m.id === missionId);
  if (mission) {
    missionRange.value.start = mission.startDate ? new Date(mission.startDate) : undefined;
    missionRange.value.end = mission.endDate ? new Date(mission.endDate) : undefined;
  } else {
    missionRange.value = {};
  }
}
watch(() => activity.value.missionId, (missionId) => {
  updateMissionRangeByMissionId(missionId);
});

const formatBudgetInput = createBudgetInputHandler(budgetText, (raw) => {
  activity.value.budget = raw;
});

findAllMission().onResult(res => {
  const missions = get(res, 'data.findAllMission') || [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowTime = now.getTime();
  const filteredMissions = missions.filter((mission: MissionInterface)=> {
    const start = mission.startDate ? new Date(mission.startDate).setHours(0, 0, 0, 0) : null;
    const end = mission.endDate ? new Date(mission.endDate).setHours(0, 0, 0, 0) : null;
    const isActive = start && end && start <= nowTime && end >= nowTime;
    return mission.status !== 'COMPLETED' && isActive;
  });
  missionOptions.value = filteredMissions.map((item: MissionInterface)=> ({
    ...item,
    name: `${item.code} - ${item.name}`
  }));
  if (activity.value.missionId) {
    updateMissionRangeByMissionId(activity.value.missionId);
  }
});

const { t } = useI18n();
const MAX_BUDGET = 2_000_000_000;
const validateRules = computed(() => {
  return {
    missionId: { required: helpers.withMessage(t('mission.activity.errors.mission'), required) },
    activityCode: { required: helpers.withMessage(t('mission.activity.errors.code'), required) },
    hostUnit: { required: helpers.withMessage(t('mission.mission.errors.hostUnit'), required) },
    activityName: { required: helpers.withMessage(t('mission.activity.errors.name'), required) },
    expectedTime: { required: helpers.withMessage(t('mission.activity.errors.expectedTime'), required) },
    endTime: { required: helpers.withMessage(t('mission.activity.errors.endTime'), required) },
    requiredGeneralLeaderIdToSubmit: leaderSubmit.value ? { required: helpers.withMessage(t('mission.activity.errors.requiredGeneralLeaderIdToSubmit'), required) } : {},
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
});
const v$ = useVuelidate(validateRules, activity);

const handleShowFileModal = ()=>{
  showAddFileDialog.value = true;
};

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
function handleSubmitForm() {
  const handleSuccess = (message: string) => {
    toastSuccess({ message });
    emits('hide-dialog');
    activity.value = cloneDeep(defaultActivity);
    v$.value.$reset();
  };
  const handleValidation = (isValid: boolean) => {
    if (isValid && activityForm.value) {
      isSubmitting.value = true;
      const formData = new FormData(activityForm.value);
      if(!leaderSubmit.value){
        formData.delete('requiredGeneralLeaderIdToSubmit');
      }
      appendFilesToFormData(formData, attachedFiles.value);
      if(props.id){
        formData.append('id', props.id);
      }
      saveActivity(formData)
        .then(() => {
          for (const fileId of deleteFileIds.value) {
            handleDeleteFileAttachment(fileId);
          }
          deleteFileIds.value = new Set();
          if(!props.id){
            increaseActivityStartValueMutate({});
          }
          const successMessage = props.id ? t('common.result.message.updateSuccess') : t('common.result.message.createSuccess');
          handleSuccess(successMessage);
        })
        .catch((handleError) => {
          if (handleError.code == 'BudgetInvalid') {
            toastError({ message: t('mission.activity.errors.budgetExceedParent') });
          } else if (handleError.code == 'EndBeforeStart') {
            toastError({ message: t('mission.activity.errors.endBeforeStart') });
          } else if (handleError.code == 'TruongPhongNotFound') {
            toastError({ message: t('mission.activity.errors.chiefNotFound') });
          } else if (handleError.code == 'NoUserInDepartmentFound') {
            toastError({ message: 'Không tìm thấy người dùng nào trong phòng ban được chỉ định' });
          } else {
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

.invisible-keep-space {
  visibility: hidden;
}
</style>