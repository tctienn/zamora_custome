<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('Duyệt gia hạn thời gian thực hiện nhiệm vụ')"
    :style='{
      width: "60vw",
    }'
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='formRequestDeadline'
        class='mb-6'>
        <div class='formgrid grid mb-4'>
          <div
            class='col-6 field'>
            <label> {{ t('Thời gian bắt đầu nhiệm vụ') }}</label>
            <div
              class='w-full'>
              <NamedInputCalendar
                v-model='deadlineExtension.startDate'
                :disabled='true'
                format='DD/MM/YYYY'
                input-format='YYYY-MM-DD'
                :select-other-months='true'
                show-icon/>
            </div>
          </div>
          <div
            class='col-6 field'>
            <label> {{ t('Thời gian kết thúc nhiệm vụ') }}</label>
            <div
              class='w-full'>
              <NamedInputCalendar
                v-model='deadlineExtension.endDate'
                :disabled='true'
                format='DD/MM/YYYY'
                input-format='YYYY-MM-DD'
                :select-other-months='true'
                show-icon/>
            </div>
          </div>
          <div
            class='col-6 field'>
            <label v-required> {{ t('Thời gian ban đầu bắt đầu nhiệm vụ') }}</label>
            <div
              class='w-full'>
              <NamedInputCalendar
                v-model='deadlineExtension.newStartDeadline'
                :disabled='true'
                format='DD/MM/YYYY'
                input-format='YYYY-MM-DD'
                name='newStartDeadline'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.newStartDeadline.$errors'/>
            </div>
          </div>
          <div
            class='col-6 field'>
            <label v-required> {{ t('Thời gian gia hạn kết thúc nhiệm vụ') }}</label>
            <div
              class='w-full'>
              <NamedInputCalendar
                v-model='deadlineExtension.newEndDeadline'
                :disabled='true'
                format='DD/MM/YYYY'
                input-format='YYYY-MM-DD'
                name='newEndDeadline'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.newEndDeadline.$errors'/>
            </div>
          </div>
          <div
            class='col-12 field'>
            <label v-required>{{ t(`Trình lãnh đạo`) }}</label>
            <div v-if='!isDetail'>
              <NamedSelectUser
                v-model='deadlineExtension.generalLeaderId'
                :button-select-user='false'
                class='w-full'
                :disabled='true'
                name='generalLeaderId'
                :options = 'leadershipUserIds'
                style='height: 40px'/>
              <ValidateErrorMessage :errors='v$.generalLeaderId.$errors'/>
            </div>
            <div
              v-else
              class='font-bold'>
              <AppUser
                avatar-size='2.5'
                info-visible
                :infos="['positionName', 'departments', 'username']"
                name-visible></AppUser>
            </div>
          </div>
          <div class='col-12 field'>
            <label v-required>{{
              t(`Lý do yêu cầu gia hạn`)
            }}</label>
  
            <Textarea
              v-model='deadlineExtension.reasonWhyExtension'
              class='w-full'
              cols='30'
              :disabled='true'
              rows='8'/>
            <ValidateErrorMessage :errors='v$.reasonWhyExtension.$errors'/>
            <input
              v-model='deadlineExtension.reasonWhyExtension'
              hidden
              name='resultContent'>
          </div>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
          style='width: 96%'>
          <Button
            class='p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            severity='secondary'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            icon='pi pi-send'
            :label='t(`Không Đồng ý`)'
            :loading='isSubmitting'
            severity='danger'
            @click='rejectDialogVisible = true'/>
          <Button
            v-if='!isDetail'
            icon='pi pi-send'
            :label='t(`Đồng ý`)'
            :loading='isSubmitting'
            @click='submit(true)'/>
        </div>
      </form>
    </div>
  </Dialog>
  <Dialog
    v-model:visible='rejectDialogVisible'
    header='Nhập lý do từ chối'
    :style="{ width: '40vw' }">
    <div class='p-fluid'>
      <Textarea
        v-model='rejectReason'
        auto-resize
        class='w-full'
        placeholder='Nhập lý do từ chối'
        rows='5'/>
    </div>
    <template #footer>
      <Button
        class='p-button-text'
        label='Hủy'
        @click='rejectDialogVisible = false;rejectReason = ""'/>
      <Button
        :disabled='!rejectReason.trim()'
        label='Xác nhận'
        severity='danger'
        @click='() => { submit(false, rejectReason); rejectDialogVisible = false; rejectReason = ""}'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
// eslint-disable-next-line max-len
import { generalLeaderApproveMissionDeadlineExtensionRequest, getDetailMissionDeadlineExtensionRequest } from '@/apps/mission/api/graphql/mission';
import { RoleType } from '@/apps/mission/model/job/job';
import type { SendDeadlineExtension } from '@/apps/mission/model/mission/mission';
import NamedSelectUser from '@/common/components/custom/NamedSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  mission: {
    type: Object,
    default: undefined,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleForm = ref<boolean>(props.visibleDialog);
const deadlineExtension = ref<SendDeadlineExtension>({} as SendDeadlineExtension);
const isSubmitting = ref<boolean>(false);
const formRequestDeadline = ref<HTMLFormElement>();
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const leadershipUserIds = computed(() => {
  return allUsers.value.filter((info) => info.roles?.includes(RoleType.LANH_DAO));
});
const rejectDialogVisible = ref(false);
const rejectReason = ref('');

const {
  mutate,
  onDone,
  onError,
} = generalLeaderApproveMissionDeadlineExtensionRequest();

const validateRules = {
  newStartDeadline: { required: helpers.withMessage(t('Thời gian ban đầu bắt đầu nhiệm vụ không được để trống'), required) },
  reasonWhyExtension: { required: helpers.withMessage(t('Lý do yêu cầu gia hạn không được để trống'), required) },
  newEndDeadline: {
    required: helpers.withMessage(t('Thời gian gia hạn kết thúc nhiệm vụ không được để trống'), required),
    checkEndTime: helpers.withMessage(t('Thời gian gia hạn kết thúc không được nhỏ hơn thời gian ban đầu'), (value: Date | undefined) => {
      return value == undefined || value > deadlineExtension.value.newStartDeadline;
    })
  },
  generalLeaderId: { required: helpers.withMessage(t('Vui lòng chọn lãnh đạo cần trình ký'), required) },
};
const v$ = useVuelidate(validateRules, deadlineExtension);

watch(
  () => props.mission,
  (newVal) => {
    if (newVal) {
      deadlineExtension.value.startDate = new Date(newVal.startDate);
      deadlineExtension.value.endDate = new Date(newVal.endDate);
    }
  },
  { immediate: true }
);

if (props.id) {
  const { onResult } = getDetailMissionDeadlineExtensionRequest(props.id);
  onResult((res) => {
    const value = get(res, 'data.getDetailMissionDeadlineExtensionRequest');
    console.log(value);
    deadlineExtension.value = {
      ...deadlineExtension.value,
      generalLeaderId: value.generalLeaderId,
      reasonWhyExtension: value.reasonWhyExtension,
      newStartDeadline: new Date(value.newStartDeadline),
      newEndDeadline: new Date(value.newEndDeadline),
    };
  });
}

const submit = (isApproved: boolean, reasonIfReject: string | null = null) => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && deadlineExtension.value) {
        isSubmitting.value = true;
        mutate({
          missionId: props.id,
          isApproved,
          reasonIfReject 
        });
      }
    });
};

onDone(() => {
  toastSuccess({ message: t('Đã gửi yêu cầu gia hạn nhiệm vụ lên cho lãnh đạo') });  
  emits('hide-dialog');
  isSubmitting.value = false;
});

onError(() => {
  toastError({ message: t('mission.mission.errors.errors') });
  isSubmitting.value = false;
});

</script>

<style scoped>

.wrapper-content-result{
    margin-top: 24px;
    border: 1px solid #ced4da; 
    border-radius: 6px;
    padding: 1.5rem 1.2rem;
    min-height: 157px;
}

::v-deep(.p-calendar) {
  width: 100%;
}
</style>