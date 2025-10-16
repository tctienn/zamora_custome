<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t(`vehicle.common.${props.id ? 'update' : 'create'}`) + ' ' + t('media.survey.quickSurvey')"
    position='right'
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'
        @submit.prevent='submit'>
        <h5 class='text-primary'>Thông tin chung</h5>
        <div class='formgrid grid mb-4'>
          <div class='col-4 field'>
            <label
              v-required
              class='font-bold'>Mã khảo sát</label>
            <div>
              <InputText
                v-model='survey.code'
                v-code
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='code'/>
              <ValidateErrorMessage :errors='v$.code.$errors'/>
            </div>
          </div>
          <div class='col-4 field'>
            <label
              v-required
              class='font-bold'>Ngày lập</label>
            <div>
              <Calendar
                v-model='survey.createdDate'
                class='w-full'
                icon-display='input'
                show-icon/>
              <ValidateErrorMessage :errors='v$.createdDate.$errors'/>
            </div>
          </div>

          <div class='col-12 field'>
            <label
              class='font-bold'>Nội dung câu hỏi</label>
            <div>
              <InputText
                v-model='survey.questionContent'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='questionContent'/>
            </div>
          </div>

          <div class='col-4 field'>
            <label
              class='font-bold'>Hạn trả lời</label>
            <div>
              <Calendar
                v-model='survey.deadlineReply'
                class='w-full'
                hour-format='24'
                icon-display='input'
                show-icon
                show-time/>
            </div>
          </div>

          <div class='align-items-center col-3 field flex'>
            <div class='align-items-center flex gap-2 mt-3'>
              <Checkbox
                v-model='survey.hideRespondent'
                :binary='true'/>
              <div
                class='font-bold'>Ẩn danh người trả lời
              </div>
            </div>
          </div>

          <div class='align-items-center col-2 field flex'>
            <div class='align-items-center flex gap-2 mt-3'>
              <Checkbox
                v-model='survey.highlight'
                :binary='true'/>
              <div
                class='font-bold'>Nổi bật
              </div>
            </div>
          </div>
          <!--          <div class='align-items-center col-3 field flex'>
                      <div class='align-items-center flex gap-2 mt-3'>
                        <Checkbox
                          v-model='survey.isMultiSelect'
                          :binary='true'/>
                        <div
                          class='font-bold'>Được chọn nhiều
                        </div>
                      </div>
                    </div>-->
        </div>

        <div class='align-items-center flex justify-content-between'>
          <h5 class='text-primary'>Danh sách phương án</h5>
          <ButtonIcon
            icon='add_circle'
            icon-size='1.5'
            rounded
            text
            @click='addOption'/>
        </div>
        <div
          v-for='(option, index) in listOption'
          :key='index'
          class='align-items-center flex gap-2 mb-2'>
          <InputText
            v-model='option.numOrder'
            class='text-center w-3rem'/>
          <InputText
            v-model='option.content'
            class='flex-1'/>
          <Button
            v-tooltip="'Xóa phương án'"
            class='p-button-text'
            icon='pi pi-trash'
            @click='removeOption(index)'/>
        </div>

        <div class='align-items-center flex justify-content-between mt-3'>
          <h5 class='mb-0 text-primary'>Thành viên tham gia khảo sát</h5>
          <ButtonIcon
            icon='add_circle'
            icon-size='1.5'
            rounded
            text
            @click='showDialog = true'/>
        </div>
        <div class='max-h-23rem mb-5 mt-2 overflow-auto'>
          <div
            v-for='(option, index) in listUser'
            :key='index'
            class='align-items-center flex justify-content-between'>
            <AppUser
              avatar-size='2.5'
              class='p-2'
              info-visible
              :infos="['positionName', 'departments', 'username']"
              name-visible
              :user-id='option'></AppUser>
            <Button
              v-tooltip="'Xóa'"
              class='p-button-text'
              icon='pi pi-trash'
              @click='removeUser(option)'/>
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
            :disabled='isDisable'
            icon='pi pi-save'
            :label="t('common.save')"
            type='submit'/>
        </div>
      </form>
    </div>
  </Sidebar>

  <SelectParticipantsDialog
    v-model='listUser'
    v-model:visible='showDialog'
    :multiple='true'>
  </SelectParticipantsDialog>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getOptionsQuickSurvey, getQuickSurveyById, saveQuickSurvey } from '@/apps/media/graphql/survey';
import SelectParticipantsDialog from '@/apps/media/views/survey/components/SelectParticipantsDialog.vue';
import { DateTimeFormat, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const isDisable = ref(false);
const survey = ref<any>({} as any);

const validateRules = {
  code: {
    required: helpers.withMessage(
      t('media.survey.error.requiredCode'),
      required,
    ),
  },
  createdDate: {
    required: helpers.withMessage(
      t('media.survey.error.requiredCreatedDate'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, survey);

if (props.id) {
  getQuickSurveyById(props.id).onResult((res: any) => {
    survey.value = cloneDeep(res.data.getQuickSurveyById);
    survey.value.createdDate = new Date(res.data.getQuickSurveyById.createdDate);
    res.data.getQuickSurveyById.deadlineReply && (survey.value.deadlineReply = new Date(res.data.getQuickSurveyById.deadlineReply));
    listUser.value = res.data.getQuickSurveyById.participants;
  });

  getOptionsQuickSurvey(props.id).onResult((res: any) => {
    listOption.value = cloneDeep(res.data.getOptionsQuickSurvey);
  });
} else {
  survey.value.createdDate = new Date();
  survey.value.highlight = false;
  survey.value.hideRespondent = false;
}

const listUser = defineModel<string[]>('listUser', { default: [] });
const showDialog = ref(false);

interface Option {
  id: string | null;
  numOrder: string;
  content: string;
}

const listOption = ref<Option[]>([]);

const addOption = () => {
  listOption.value.push({
    id: null,
    numOrder: (listOption.value.length + 1).toString(),
    content: ''
  });
};
const removeOption = (index: number) => {
  listOption.value.splice(index, 1);
  listOption.value.forEach((opt, i) => opt.numOrder = (i + 1).toString());
};

const removeUser = (id: string) => {
  listUser.value = listUser.value.filter((item: string) => item !== id);
};
const { moment } = useMoment();
const {
  mutate,
  onDone,
  onError
} = saveQuickSurvey();

const submit = () => {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && survey.value) {
        mutate({
          quickSurvey: {
            ...survey.value,
            createdDate: moment(survey.value.createdDate).format(
              DateTimeFormat.ISO_LOCAL_DATE,
            ),
            deadlineReply: survey.value.deadlineReply ? moment(survey.value.deadlineReply).format(
              DateTimeFormat.ISO_LOCAL_DATE_TIME,
            ) : null,
            optionIds: listOption.value,
            participants: listUser.value
          }
        });
      }
    })
    .then(() => isDisable.value = false);
};

onDone(() => {
  toastSuccess({ message: t('media.survey.saveSuccess') });
  emits('hide-dialog');
});

onError((err) => {
  toastError({ message: t(`media.survey.${err.graphQLErrors[0].extensions.errorCode}`) });
});
</script>

<style scoped>

</style>