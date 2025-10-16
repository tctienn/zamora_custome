<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('Gia hạn thời gian thực hiện hoạt động')"
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
            class='col-12 field'>
            <label> {{ t('Thời gian kết thúc hoạt động') }}</label>
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
            class='col-12 field'>
            <label v-required> {{ t('Thời gian gia hạn hoạt động') }}</label>
            <div
              class='w-full'>
              <NamedInputCalendar
                v-model='deadlineExtension.newEndDeadline'
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
              :disabled='isDetail'
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
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            v-if='!isDetail'
            icon='pi pi-send'
            :label='t(`Trình lãnh đạo`)'
            :loading='isSubmitting'
            @click='submit()'/>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { saveActivityDeadlineExtensionRequest } from '@/apps/mission/api/graphql/activity-api';
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
  activity: {
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

const {
  mutate,
  onDone,
  onError,
} = saveActivityDeadlineExtensionRequest();

const validateRules = {
  reasonWhyExtension: { required: helpers.withMessage(t('Lý do yêu cầu gia hạn không được để trống'), required) },
  newEndDeadline: { required: helpers.withMessage(t('Thời gian gia hạn kết thúc hoạt động không được để trống'), required) },
  generalLeaderId: { required: helpers.withMessage(t('Vui lòng chọn lãnh đạo cần trình ký'), required) },
};
const v$ = useVuelidate(validateRules, deadlineExtension);

watch(
  () => props.activity,
  (newVal) => {
    console.log(newVal);
    
    if (newVal) {
      deadlineExtension.value.endDate = new Date(newVal.endTime);
    }
  },
  { immediate: true }
);

const submit = () => {
  v$.value.$validate()
    .then((isValid) => {
      if (isValid && deadlineExtension.value) {
        isSubmitting.value = true;
        const payload = {
          activityId: props.id,
          newEndDeadline: moment(deadlineExtension.value.newEndDeadline).format('YYYY-MM-DD'),
          generalLeaderId: deadlineExtension.value.generalLeaderId,
          reasonWhyExtension: deadlineExtension.value.reasonWhyExtension
        };
        mutate({ activityDeadlineExtensionInput: payload, });
      }
    });
};

onDone(() => {
  toastSuccess({ message: t('Đã gửi yêu cầu gia hạn hoạt động lên cho lãnh đạo') });  
  emits('hide-dialog');
  isSubmitting.value = false;
});

onError((err) => {
  if(err.graphQLErrors[0].extensions.errorCode){
    toastError({ message: 'Thời gian gia hạn không được trước thời gian hiện tại' });
  }else {
    toastError({ message: t('mission.mission.errors.errors') });
  }
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