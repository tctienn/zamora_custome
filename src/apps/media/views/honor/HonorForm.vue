<template>
  <Sidebar
    v-model:visible='visibleForm'
    :header='props.id ? t("Cập nhật sự kiện vinh danh") : t("Thêm mới sự kiện vinh danh")'
    position='right'
    style='width: 50%;height: 100%'
    @hide='emits("hide-dialog")'>
    <form
      ref='honorForm'
      @submit.prevent='handleSubmitForm'>
      <div class='formgrid grid mb-4'>
        <div class='col'>
          <div class='field'>
            <label
              v-required
              class='font-bold'>
              {{ t('Tiêu đề') }}
            </label>
            <InputText
              v-model='honor.title'
              class='p-component p-inputtext w-full'
              maxlength='5000'
              name='title'/>
            <ValidateErrorMessage :errors='v$.title.$errors'/>
          </div>

          <div class='field'>
            <label
              v-required
              class='font-bold'>
              {{ t('Đối tượng vinh danh') }}
            </label>
            <div class='flex justify-content-around py-2 w-6'>
              <div class='align-items-center flex gap-2'>
                <RadioButton
                  v-model='honorType'
                  name='type'
                  value='USER'/>
                <span>Cá nhân</span>
              </div>
              <div class='align-items-center flex gap-2'>
                <RadioButton
                  v-model='honorType'
                  name='type'
                  value='ORGANIZATION'/>
                <span>Phòng ban</span>
              </div>
            </div>
          </div>

          <div class='field'>
            <label
              v-required
              class='font-bold'>
              {{ t('Chọn cá nhân/Phòng ban') }}
            </label>
            <NamedMultiSelectUser
              v-if='honorType==="USER"'
              v-model:list-user='honor.users'
              class='p-component'
              name='users'/>
            <TreeSelect
              v-else
              v-model='selectedParent'
              class='w-full'
              :empty-message='t("common.selectEmpty")'
              :filter='true'
              input-id='organizationParent'
              name='organizations'
              :options='parentOrganizations'
              selection-mode='multiple'>
            </TreeSelect>
          </div>

          <div class='field'>
            <label
              class='font-bold'>
              {{ t('Mô tả') }}
            </label>
            <AppEditor
              v-model='honor.description'
              class='w-full'
              editor-style='height: 15rem;'>
            </AppEditor>
          </div>

          <div class='field'>
            <label class='font-bold'>
              {{ t('Chọn mẫu/Style') }}
            </label>
            <div class='image-gallery'>
              <div
                v-for='template in templates'
                :key='template.name'
                class='align-items-center flex image-container justify-content-center'
                :class="{'selected': selectedTemplate?.name === template.name}"
                @click='selectTemplate(template)'>
                <img
                  :alt='template.name'
                  class='image-item max-h-10rem max-w-10rem min-h-10rem min-w-10rem mx-auto object-fit-cover p-2 rounded w-full'
                  :src='template.url'/>
              </div>
            </div>

            <div class='grid mt-2'>
              <div class='col-4'>
                <div class='field'>
                  <label
                    class='font-bold'>
                    {{ t('Là vinh danh nổi bật') }}
                  </label>
                  <div class='ml-7 my-2'>
                    <InputSwitch
                      v-model='honor.isHighlight'
                      name='isHighlight'/>
                  </div>
                </div>
              </div>
              <div class='col-4'>
                <div class='field'>
                  <label
                    class='font-bold'>
                    {{ t('Cho phép thả biểu cảm') }}
                  </label>
                  <div class='ml-7 my-2'>
                    <InputSwitch
                      v-model='honor.allowsDroppingExpressions'
                      name='allowsDroppingExpressions'/>
                  </div>
                </div>
              </div>
              <div class='col-4'>
                <div class='field'>
                  <label
                    class='font-bold'>
                    {{ t('Cho phép bình luận') }}
                  </label>
                  <div class='ml-7 my-2'>
                    <InputSwitch
                      v-model='honor.allowsComment'
                      name='allowsComment'/>
                  </div>
                </div>
              </div>

              <div class='col-4'>
                <div class='field'>
                  <label
                    v-required
                    class='font-bold'>
                    {{ t('Ngày tạo') }}
                  </label>
                  <NamedInputCalendar
                    v-model='honor.createdDate'
                    format='DD/MM/YYYY'
                    name='createdDate'
                    :select-other-months='true'
                    show-icon/>
                  <ValidateErrorMessage :errors='v$.createdDate.$errors'/>
                </div>
              </div>
              <div class='col-4'>
                <div class='field text-center'>
                  <label
                    class='font-bold'>
                    {{ t('Người tạo') }}
                  </label>
                  <AppUser
                    avatar-size='2.5'
                    :is-flex='true'
                    :label='user?.fullName'
                    :overlay-visible='true'
                    :user-id='user.id'>
                  </AppUser>
                </div>
              </div>
              <div class='col-4'>
                <div class='field'>
                  <label
                    v-required
                    class='font-bold'>
                    {{ t('Số thứ tự') }}
                  </label>
                  <div>
                    <InputNumber
                      v-model='honor.norder'/>
                    <input
                      v-model='honor.norder'
                      hidden
                      name='norder'>
                  </div>
                </div>
              </div>
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
            icon='pi pi-save'
            :label="t('common.save')"
            type='submit'/>
        </div>
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang="ts">

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { get } from 'lodash';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { createHonor, updateHonor } from '@/apps/media/api/rest/honorApi';
import { getHonorById, maxNOrderHonor } from '@/apps/media/graphql/honor';
import type { IHonor } from '@/apps/media/model/honor';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps(
  {
    visibleDialog: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: null
    },
  }
);
const emits = defineEmits(['hide-dialog']);
const honor = ref<IHonor>({} as IHonor);
const honorForm = ref<HTMLFormElement>();
const isDisable = ref(false);
const { t } = useI18n();
const { user } = useUserStore();
const organizations = ref([]);
const selectedParent = ref<{ [key: string]: boolean }>({});
const parentOrganizations = ref([]);
const validateRules = {
  title: {
    required: helpers.withMessage(t('Tiêu đề') + ' '
        + t('work.project.required')
    , required)
  },
  createdDate: { required: helpers.withMessage(t('Ngày tạo') + ' ' + t('work.project.required'), required) },
  norder: { required: helpers.withMessage(t('work.project.norderRequired') + ' ', required) }
};

const selectedTemplate = ref<{ name: string | undefined; url: string }>();

const selectTemplate = (template: { name: string | undefined; url: string }) => {
  selectedTemplate.value = template;
};

const honorType = ref('USER');
const v$ = useVuelidate(validateRules, honor);
const visibleForm = ref(props.visibleDialog);

if (!props.id) {
  honor.value.createdDate = new Date();
  const { onResult } = maxNOrderHonor();
  onResult((res) => {
    honor.value.norder = res.data.maxOrderActiveHonor;
  });
} else {
  const { onResult } = getHonorById(props.id);
  onResult((res) => {
    honor.value = { ...res.data.getHonorById };
    honorType.value = honor.value.type;
    honor.value.organizations.forEach(item => {
      selectedParent.value[item as string] = true;
    });
    selectedTemplate.value = templates.value.find(item => item.name === honor.value.style);
  });
}

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
  parentOrganizations.value = listToTree(organizations.value.map((organization: OrganizationInterface) => ({
    key: organization.code,
    label: organization.name,
    data: organization.code,
    parentId: organization.parentCode,
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });
});

function handleSubmitForm() {
  isDisable.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      if (honorForm.value) {
        const formData = new FormData(honorForm.value);
        if (props.id) {
          appendFormData(formData);
          updateHonor(formData, props.id).then(() => {
            toastSuccess({ message: t('done') });
            emits('hide-dialog');
          });
        } else {
          appendFormData(formData);
          createHonor(formData).then(() => {
            toastSuccess({ message: t('done') });
            emits('hide-dialog');
          });
        }
      }
    }
  }).then(() => isDisable.value = false);
}

function appendFormData(formData: FormData) {
  formData.append('allowsComment', honor.value.allowsComment?.toString() || 'false');
  formData.append('isHighlight', honor.value.isHighlight?.toString() || 'false');
  selectedTemplate.value?.name && formData.append('style', selectedTemplate.value.name);
  formData.append('allowsDroppingExpressions', honor.value.allowsDroppingExpressions?.toString() || 'false');
  honor.value.description && formData.append('description', honor.value.description);
  if (selectedParent.value && typeof selectedParent.value === 'object') {
    const selectedOrganizations = Object.keys(selectedParent.value);
    const organizationsString = selectedOrganizations.join(',');
    formData.append('organizations', organizationsString);
  }
  return formData;
}

const templates = ref<{ name: string | undefined; url: string }[]>([]);

const imageFiles = import.meta.glob('/public/images/honor-template/*.{jpg,png,svg}');

onMounted(() => {
  templates.value = Object.keys(imageFiles).map(file => ({
    name: file.split('/').pop(),
    url: file.replace('/public', '')
  }));
});
</script>

<style scoped>
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
}

.image-container {
  cursor: pointer;
  border-radius: 8px;
  transition: box-shadow 0.3s, border 0.3s;
  overflow: hidden;
  border: 2px solid transparent;
}

.image-item {
  display: block;
  width: 100%;
  height: auto;
}

.selected {
  border: 2px solid var(--primary-color);
}
</style>