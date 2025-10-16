<template>
  <TabView>
    <TabPanel
      header='Thông tin chung'
      :pt='{
        tab: {
          class:"p-2"
        }
      }'>
      <form
        ref='projectForm'
        @submit.prevent='handleSubmitForm'>
        <div class='formgrid grid mb-4'>
          <div class='col'>
            <div class='flex justify-content-between'>
              <div class='flex flex-column gap-2 justify-content-start pb-3'>
                <label
                  v-required
                  class='font-medium'>
                  {{ t('work.project.code') }}
                </label>
                <InputText
                  v-model='project.code'
                  class='p-component p-inputtext w-30rem'
                  :disabled='!parameterProject?.codeSettings?.allowEdit && parameterProject?.codeSettings?.enabled'
                  maxlength='255'
                  name='code'/>
                <input
                  v-if='parameterProject?.codeSettings?.enabled && !parameterProject?.codeSettings?.allowEdit'
                  v-model='project.code'
                  :disabled='parameterProject?.codeSettings?.allowEdit && parameterProject?.codeSettings?.enabled'
                  hidden
                  name='code'/>

                <input
                  v-model='project.progress'
                  hidden
                  name='progress'>

                <ValidateErrorMessage :errors='v$.code.$errors'/>

              </div>
              <div>
                <AvatarUploadOnly
                  :avatar-upload-size='{
                    height:9,
                    width:9,
                    emptyIconSize:9
                  }'
                  :avatar-url='project.logo'
                  :empty-image-icon='"image"'
                  icon-size='8'
                  input-name='logo'
                  shape='rectangle'
                  :tooltip="t('work.project.uploadLogo')">
                </AvatarUploadOnly>
                <span
                  class='text-sm'
                  style='font-style: italic'>Click tải lên biểu tượng dự án</span>
              </div>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-medium'>
                {{ t('work.project.name') }}
              </label>
              <InputText
                v-model='project.name'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='name'/>
              <ValidateErrorMessage :errors='v$.name.$errors'/>
            </div>

            <div class='field'>
              <label
                class='font-medium'>
                {{ t('work.project.type') }}
              </label>
              <Dropdown
                v-model='project.type'
                class='p-component  w-full'
                option-label='name'
                option-value='id'
                :options='typeOptions'>
                <template #option='slotProp'>
                  {{ slotProp.option.name ? slotProp.option.name.substring(0, 80) + '...' : '' }}
                </template>
              </Dropdown>

              <input
                v-model='project.type'
                hidden
                name='type'>
            </div>
            <div class='field'>
              <label
                class='font-medium'>
                {{ t('work.project.group') }}
              </label>
              <Dropdown
                v-model='project.groupId'
                class='p-component  w-full'
                option-label='name'
                option-value='id'
                :options='groupOptions'>
              </Dropdown>
              <input
                v-model='project.groupId'
                hidden
                name='groupId'>
            </div>
            <div class='field'>
              <label
                class='font-medium'>
                {{ t('work.project.parentProject') }}
              </label>
              <Dropdown
                v-model='project.parentId'
                class='p-component  w-full'
                option-label='name'
                option-value='id'
                :options='projectOptions'>
              </Dropdown>
              <input
                v-model='project.parentId'
                hidden
                name='parentId'>
            </div>
            <div class='flex  justify-content-between'>
              <div class='align-content-center col-6 pl-0'>
                <div class='field'>
                  <label
                    v-required
                    class='font-medium'>{{ t('work.project.startDate') }}</label>
                  <div>
                    <NamedInputCalendar
                      v-model='project.startDate'
                      format='DD/MM/YYYY'
                      input-format='YYYY-MM-DD'
                      name='startDate'
                      :select-other-months='true'
                      show-icon/>
                  </div>
                  <ValidateErrorMessage :errors='v$.startDate.$errors'/>
                </div>
                <div class='field'>
                  <label
                    class='font-medium'>{{ t('work.project.endDate') }}</label>
                  <div>
                    <NamedInputCalendar
                      v-model='project.endDate'
                      format='DD/MM/YYYY'
                      input-format='YYYY-MM-DD'
                      name='endDate'
                      :select-other-months='true'
                      show-icon/>
                    <ValidateErrorMessage :errors='v$.endDate.$errors'/>
                  </div>
                </div>
              </div>

              <div class='align-content-center col-6 px-0'>
                <div class='field'>
                  <label
                    class='font-medium'>Số ngày</label>
                  <div>
                    <InputNumber
                      v-model='project.numberDate'
                      class='w-full'/>
                    <input
                      v-model='project.numberDate'
                      hidden
                      name='numberDate'>
                  </div>
                </div>

                <div class='field'>
                  <label
                    class='font-medium'>Tổng giá trị</label>
                  <div>
                    <InputNumber
                      v-model='project.totalValue'
                      class='w-full'/>
                    <input
                      v-model='project.totalValue'
                      hidden
                      name='totalValue'>
                  </div>
                </div>
              </div>
              <div>
              </div>
            </div>

            <div class='field w-full'>
              <label
                v-required
                class='font-medium'>{{ t('work.project.admins') }}</label>
              <NamedMultiSelectUser
                v-model:list-user='project.admins'
                class='p-component w-full'
                name='admins'
                :placeholder="`${t('common.choose')} ${t('work.project.admins').toLowerCase()}`"
                :select-max='3'/>
              <ValidateErrorMessage :errors='v$.admins.$errors'/>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-medium'>{{ t('work.project.implementers') }}</label>
              <NamedMultiSelectUser
                v-model:list-user='project.implementers'
                class='p-component'
                name='implementers'
                :placeholder="`${t('common.choose')} ${t('work.project.implementers').toLowerCase()}`"
                :select-max='999'/>
              <ValidateErrorMessage :errors='v$.implementers.$errors'/>
            </div>

            <div class='field'>
              <label
                class='font-medium'>{{ t('work.project.followers') }}</label>
              <NamedMultiSelectUser
                v-model:list-user='project.followers'
                class='p-component'
                name='followers'
                :placeholder="`${t('common.choose')} ${t('work.project.followers').toLowerCase()}`"
                :select-max='999'/>
            </div>

            <div class='field'>
              <label
                class='font-medium'>{{ t('work.project.description') }}</label>
              <AppEditor
                v-model='project.description'
                class='w-full'
                editor-style='height: 15rem;'>
              </AppEditor>
              <input
                v-model='project.description'
                hidden
                name='description'>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-medium'>{{ t('work.project.status') }}</label>
              <Dropdown
                v-model='project.status'
                class='p-component  w-full'
                option-label='name'
                option-value='value'
                :options='statusOptions'>
              </Dropdown>
              <ValidateErrorMessage :errors='v$.status.$errors'/>
              <input
                v-model='project.status'
                hidden
                name='status'>
            </div>
            <div class='flex gap-3 justify-content-between'>
              <div class='field'>
                <label
                  class='font-medium'>{{ t('work.project.createdDate') }}</label>
                <div>
                  <NamedInputCalendar
                    v-model='project.createdDate'
                    format='DD/MM/YYYY'
                    name='createdDate'
                    :select-other-months='true'
                    show-icon/>
                </div>
              </div>
              <div class='field'>
                <label
                  class='font-medium'>{{ t('work.project.createdBy') }}</label>
                <AppUser
                  avatar-size='2.5'
                  :is-flex='true'
                  :overlay-visible='true'
                  :user-id='project.createdBy ?? user.id'>
                </AppUser>
              </div>
              <div class='field'>
                <label
                  class='font-medium'>{{ t('work.project.seqNumber') }}</label>
                <div>
                  <InputNumber
                    v-model='project.sequenceNumber'/>
                  <input
                    v-model='project.sequenceNumber'
                    hidden
                    name='sequenceNumber'>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-2 surface-overlay w-full'>
          <Button
            class='border-round-sm p-2 p-button-plain'
            icon='pi pi-times'
            :label="t('common.close')"
            :loading='isSubmitting'
            severity='danger'
            @click="emits('hide-dialog')"/>
          <Button
            class='border-round-sm p-2'
            icon='pi pi-save'
            :label="t('common.save')"
            :loading='isSubmitting'
            type='submit'/>
        </div>
      </form>
    </TabPanel>

    <TabPanel
      header='Thiết lập'>
      <div
        v-if='recipe'
        class='flex flex-column gap-2 pt-3'>
        <label
          v-required
          class='font-semibold'>Cách tính tiến độ dự án</label>
        <input
          v-model='recipe.id'
          hidden/>
        <input
          v-model='recipe.projectId'
          hidden/>
        <Dropdown
          v-model='recipe.type'
          :filter='true'
          option-label='label'
          option-value='value'
          :options='optionsRecipe'
          placeholder='Chọn cách tính'>
          <template #option='slotProps'>
            <div class='flex flex-column w-30rem'>
              <div class='font-semibold'>
                {{ slotProps.option?.label }}
              </div>
              <div
                v-for='subLabel in slotProps.option?.subLabel'
                :key='subLabel'>{{ subLabel }}
              </div>
            </div>
          </template>
        </Dropdown>

        <label
          class='font-semibold'>Cài đặt quyền</label>

        <div>
          <Checkbox
            v-model='recipe.configImplementer'
            binary
            input-id='open'/>
          <label
            class='ml-2'
            for='open'>Không cho phép người thực hiện công việc xem chéo các công việc khác</label>
        </div>

        <div>
          <Checkbox
            v-model='recipe.configFollower'
            binary
            input-id='open'/>
          <label
            class='ml-2'
            for='open'>Không cho phép người theo dõi xem được các công việc con</label>
        </div>
      </div>

      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-2 surface-overlay w-full'>
        <Button
          class='border-round-sm p-2 p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          class='border-round-sm p-2'
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='submitConfig'/>
      </div>
    </TabPanel>
  </TabView>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { camelCase, cloneDeep, get } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  findParameterConfig,
  getProjectCodeGraphql,
  increaseProjectStartValue
} from '@/apps/work/api/graphql/parameter-config';
import { getAllProjects, getProjectById, getSeqNumber } from '@/apps/work/api/graphql/project';
import { getAllActiveProjectGroup } from '@/apps/work/api/graphql/projectGroup';
import { getAllActiveProjectType } from '@/apps/work/api/graphql/projectType';
import { saveRecipe } from '@/apps/work/api/graphql/recipe-api';
import { createProject, updateProject } from '@/apps/work/api/rest/project';
import type { ProjectTypeGroupInterface } from '@/apps/work/model/project';
import type { Recipe } from '@/apps/work/model/recipe';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import { defaultProject, optionsRecipe, type ProjectInterface, StatusProject } from '@/apps/work/views/project/model';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getDateDifference } from '@/common/helpers/time-util';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  isFormCopy: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog']);

const project = ref<ProjectInterface>({} as ProjectInterface);
const recipe = ref<Recipe>({
  projectId: props.id,
  type: 'SIMPLE'
} as Recipe);
if (props.id) {
  getProjectById(props.id).onResult(res => {
    const value = get(res, 'data.getProjectById');
    project.value = {
      ...value,
      startDate: value.startDate ? new Date(value.startDate) : undefined,
      endDate: value.endDate ? new Date(value.endDate) : undefined,
      createdDate: value.createdDate ? new Date(value.createdDate) : undefined
    };
    recipe.value = value.recipe ? cloneDeep(value.recipe) : { projectId: props.id } as Recipe;
  });
} else {
  project.value = cloneDeep(defaultProject);
  getSeqNumber().onResult(res => {
    project.value.sequenceNumber = get(res, 'data.getSeqNumber') + 1;
  });
}

const { t } = useI18n();
const validateRules = {
  code: { required: helpers.withMessage(t('work.project.errors.code'), required) },
  name: { required: helpers.withMessage(t('work.project.errors.name'), required) },
  status: { required: helpers.withMessage(t('work.project.errors.status'), required) },
  admins: { required: helpers.withMessage(t('work.project.errors.admins'), required) },
  implementers: { required: helpers.withMessage(t('work.project.errors.implementers'), required) },
  startDate: { required: helpers.withMessage(t('work.project.errors.startDate'), required) },
  endDate: {
    checkEndTime: helpers.withMessage(t('work.project.errors.startTimeAfterEndTime'), (value: Date | undefined) => {
      return value == undefined || value > project.value.startDate;
    })
  },
};
const v$ = useVuelidate(validateRules, project);
const { user } = useUserStore();
const typeOptions = ref<ProjectTypeGroupInterface[]>([]);
const groupOptions = ref<ProjectTypeGroupInterface[]>([]);
const statusOptions = ref<{
  value: string,
  name: string
}[]>([]);
const projectOptions = ref<ProjectInterface[]>([]);
getAllActiveProjectType().onResult(rs => {
  typeOptions.value = get(rs, 'data.getAllActiveProjectType');
});
getAllActiveProjectGroup().onResult(rs => {
  groupOptions.value = get(rs, 'data.getAllActiveProjectGroup');
});
statusOptions.value = Object.keys(StatusProject).filter(e => e != 'ALL').map((e: string) => {
  return {
    value: e,
    name: t(`work.project.statusProject.${camelCase(e)}`)
  };
});
const {
  onResult: allProjectsOnResult,
  load: allProjectsLoad
} = getAllProjects();
allProjectsOnResult(rs => {
  projectOptions.value = get(rs, 'data.getAllProjects');
});
allProjectsLoad();
const projectForm = ref<HTMLFormElement>();
const isSubmitting = ref<boolean>(false);

function submitConfig() {
  saveRecipe().mutate({ recipeDTO: recipe.value }).then((res) => {
    toastSuccess({ message: 'Cấu hình thông số thành công.' });
  });
}

watch(() => [project.value.startDate, project.value.endDate], ([startDate, endDate]) => {
  if (!project.value.id) {
    project.value.numberDate = getDateDifference(startDate, endDate, 'days');
  }
});
const { mutate } = increaseProjectStartValue();

function handleSubmitForm() {
  const handleSuccess = (message: string) => {
    toastSuccess({ message });
    emits('hide-dialog');
    project.value = cloneDeep(defaultProject);
    mutate();
    v$.value.$reset();
  };

  const handleValidation = (isValid: boolean) => {
    if (isValid && projectForm.value) {
      isSubmitting.value = true;
      const formData = new FormData(projectForm.value);
      const action = props.id ? props.isFormCopy ? createProject(formData) : updateProject(formData, props.id) : createProject(formData);

      action
        .then(() => {
          const successMessage = props.id ? props.isFormCopy ? 'Nhân bản dự án thành công'
            : t('common.result.message.updateSuccess')
            : t('common.result.message.createSuccess');
          handleSuccess(successMessage);
        })
        .catch((handleError) => {
          toastError({ message: t('work.project.errors.' + handleError.code) });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }
  };

  v$.value.$validate().then(handleValidation);
}

const parameterProject = ref();

//Auto code
findParameterConfig().onResult(param => {
  const value = param?.data?.findParameterConfig?.value;
  let enableGenCode = value?.project?.codeSettings?.enabled;
  parameterProject.value = value?.project;
  if (!props.id && enableGenCode == true) {
    getProjectCodeGraphql().onResult(res => {
      project.value.code = res.data?.getProjectCode;
    });
  }
});

</script>

<script lang='ts'>
export default { name: 'FormProject' };
</script>

<style scoped>
</style>