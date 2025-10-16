<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='(props.id ? t("media.common.update") : t("media.common.create"))+ t(`media.common.${lowerCase(props.mediaType)}.nameLowerCase`)'
    :modal='true'
    position='right'
    @hide='emits("hide-dialog")'>

    <div>
      <form
        ref='form'
        @submit.prevent='submitAnnouncement'>
        <div class='formgrid grid mb-4'>
          <div class='col'>
            <div class='field'>
              <label
                v-required
                class='font-bold'>{{ t(`media.common.${lowerCase(props.mediaType)}.titleColumn`) }}</label>
              <InputText
                v-model='announcement.title'
                class='p-component p-inputtext w-full'
                maxlength='255'
                name='title'/>
              <input
                v-model='announcement.id'
                hidden
                name='id'>
              <ValidateErrorMessage :errors='v$.title.$errors'/>
            </div>

            <div class='field'>
              <label
                class='font-bold'>{{ t('media.common.table.type') }}</label>
              <div>
                <NamedDropdown
                  v-model='announcement.groupCode'
                  class='w-full'
                  :filter='true'
                  :is-show-clear='true'
                  name='groupCode'
                  option-label='name'
                  option-value='code'
                  :options='categories'
                  :placeholder='t("media.common.table.chooseGroup")'
                  @change='chooseCategory($event)'/>

                <input
                  v-model='announcement.groupName'
                  hidden
                  name='groupName'/>
              </div>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-bold'>{{ t('media.common.summary') }}</label>
              <div>
                <Textarea
                  v-model='announcement.summary'
                  class='w-full'
                  maxlength='5000'
                  name='summary'
                  rows='5'/>
                <ValidateErrorMessage :errors='v$.summary.$errors'/>
              </div>
            </div>

            <div class='field'>
              <label
                v-required
                class='font-bold'>{{ t('media.common.content') }}</label>
              <AppEditor
                ref='editor'
                v-model='announcement.content'
                editor-style='height: 15rem;'
                :modules='{toolbar: DEFAULT_EDITOR_TOOLBARS}'
                name='content'/>
              <ValidateErrorMessage :errors='v$.content.$errors'/>
            </div>

            <div class='flex justify-content-between'>
              <div class='field'>
                <label
                  class='font-bold'>{{ t('media.common.table.createdTime') }}</label>
                <div>
                  <NamedInputCalendar
                    v-model='announcement.publishDate'
                    format='DD/MM/YYYY HH:mm'
                    input-format='YYYY-MM-DDTHH:mm:ss'
                    name='publishDate'
                    :select-other-months='true'
                    show-icon
                    show-time/>
                </div>
              </div>

              <div class='field'>
                <label
                  class='font-bold'>{{ t('media.common.table.createdBy') }}</label>
                <div>
                  <input
                    v-model='user.id'
                    hidden
                    name='publisher'>
                  <AppUser
                    avatar-size='3'
                    overlay-visible
                    :user-id='user.id'/>
                </div>
              </div>
              <div class='field'>
                <label
                  class='font-bold'>{{ t('media.common.table.nOrder') }}</label>
                <InputNumber
                  v-model='announcement.norder'
                  class='p-component  w-full'
                  :use-grouping='false'/>
                <input
                  v-model='announcement.norder'
                  hidden
                  name='norder'>
              </div>
            </div>

            <div class='flex'>
              <div class='col-8 p-0'>
                <div class='pb-2'>
                  <label
                    class='font-bold pb-2'>{{
                    t(`media.common.${lowerCase(props.mediaType)}.isHighlight`)
                  }}</label>
                </div>
                <div class='pb-2'>
                  <NameInputSwitch
                    v-model='announcement.isHighlight'
                    name='isHighlight'/>
                </div>
                <div class='pb-2'>
                  <label
                    class='font-bold pb-2'>{{ t('media.common.table.allowEmoji') }}</label>
                </div>
                <div class='pb-2'>
                  <NameInputSwitch
                    v-model='announcement.isAllowsEmojis'
                    name='isAllowsEmojis'/>
                </div>
                <div class='pb-2'>
                  <label
                    class='font-bold pb-2'>{{ t('media.common.table.allowComment') }}</label>
                </div>
                <div class='pb-2'>
                  <NameInputSwitch
                    v-model='announcement.isAllowsComment'
                    name='isAllowsComment'/>
                </div>
              </div>
              <div class='col-4 flex justify-content-end p-0 pb-2'>
                <div class='text-center'>
                  <div class='pb-2'>
                    <label
                      class='font-bold'>{{ t(`media.common.${lowerCase(props.mediaType)}.imgAnnouncement`) }}</label>
                  </div>
                  <AvatarUploadOnly
                    ref='avatarUpload'
                    :avatar-url='announcement.thumbnail'
                    :empty-image-icon='"photo_camera"'
                    :input-name="'thumbnail'"
                    :shape='"rectangle"'
                    :tooltip='t("media.common.table.chooseImg")'/>
                </div>

              </div>
            </div>
            <div class='field'>
              <UploadFilesGrid
                v-model:files-deleted='announcement.filesDeleted'
                v-model:list-file='fileArray'>
              </UploadFilesGrid>
            </div>
            <div class='field'>
              <SubMedia
                :id='props.id'
                v-model:sub-media='subMedias'
                v-model:sub-media-from-d-b='announcement.subMedias'
                :media-type='props.mediaType'>
              </SubMedia>
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
            :disabled='isDisable'
            icon='pi pi-save'
            :label="t('common.save')"
            type='submit'/>
        </div>
      </form>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { lowerCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCategoryByGroup } from '@/apps/admin/api/graphql/category-graphql-api';
import { createMedia, updateMedia } from '@/apps/media/api/rest/mediaApi';
import { maxNOrder, media } from '@/apps/media/graphql/media';
import type { IAnnouncement } from '@/apps/media/model/announcement';
import { type FileAttachment, MediaType } from '@/apps/media/model/media';
import SubMedia from '@/apps/media/views/media/SubMedia.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import NameInputSwitch from '@/common/components/custom/NameInputSwitch.vue';
import UploadFilesGrid from '@/common/components/custom/UploadFilesGrid.vue';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_EDITOR_TOOLBARS } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
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
    mediaType: {
      type: String as PropType<MediaType>,
      default: null
    }
  }
);
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const announcement = ref<IAnnouncement>({ publishDate: new Date() } as IAnnouncement);
const isDisable = ref(false);
const validateRules = {
  title: { required: helpers.withMessage(t('media.common.error.titleCantEmpty'), required) },
  summary: { required: helpers.withMessage(t('media.common.error.summaryCantEmpty'), required) },
  content: { required: helpers.withMessage(t('media.common.error.contentCantEmpty'), required) },
};
const v$ = useVuelidate(validateRules, announcement);

const {
  onResult,
  refetch
} = getCategoryByGroup(props.mediaType);

const form = ref<HTMLFormElement>();
const subMedias = ref();
const categories = ref();
const fileArray = ref<FileAttachment[]>([] as FileAttachment[]);
const showDialog = ref(false);
const visibleForm = ref(props.visibleDialog);

if (!props.id) {
  const { onResult } = maxNOrder(props.mediaType);
  onResult((res) => {
    announcement.value.norder = res.data.maxNOrder;
  });
}

if (props.id) {
  const { onResult: mediaOnResult } = media(props.mediaType, props.id);
  mediaOnResult((res) => {
    announcement.value = {
      ...res.data.media,
      filesDeleted: [],
      publishDate: new Date(res.data.media.publishDate)
    };

    subMedias.value = res.data.media.childrenMedia;
    fileArray.value = res.data.media.listFileAttachments;
  });
}

getGroup();

function getGroup() {
  onResult((res) => {
    categories.value = res.data.getCategoryByGroup;
  });
}

function chooseCategory(data: DropdownChangeEvent) {
  announcement.value.groupName = categories.value.find((x: any) => x.code === data.value)?.name;
}

function submitAnnouncement() {
  isDisable.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      if (form.value) {
        const formData = new FormData(form.value);
        formData.append('content', announcement.value.content);
        if (props.id) {
          updateMedia(props.mediaType, props.id, formData).then(() => {
            toastSuccess({ message: t('media.common.message.updateSuccess') });
            emits('hide-dialog');
            isDisable.value = false;
          });
        } else {
          createMedia(props.mediaType, formData).then(() => {
            toastSuccess({ message: t('media.common.message.createSuccess') });
            emits('hide-dialog');
            isDisable.value = false;
          });
        }
      }
    }
  });

}
</script>

<script lang='ts'>
export default { name: 'MediaAnnouncement' };
</script>

<style scoped lang='scss'>

:deep(.p-editor-container) {
  .p-editor-toolbar {
    display: none;
  }
}

.media-row {
  &:hover {
    .btnAction {
      display: block;
    }
  }
}

.btnAction {
  display: none
}
</style>