<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      isDetail
        ? t('meeting.mediaDevice.titleForm')
        : t(`meeting.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('meeting.mediaDevice.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'
        @submit.prevent='submitMediaDevice'>
        <div class='formgrid grid mb-4'>
          <div class='col'>
            <div class='field'>
              <label
                v-required
                class='font-bold'>{{
                  t(`meeting.mediaDevice.nameMediaDevice`)
                }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='mediaDevice.name'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='name'/>
                <ValidateErrorMessage :errors='v$.name.$errors'/>
              </div>
              <div v-else>
                {{ mediaDevice.name }}
              </div>
            </div>

            <div class='field'>
              <label class='font-bold'>{{
                t('meeting.mediaDevice.description')
              }}</label>
              <div>
                <Textarea
                  v-if='!isDetail'
                  v-model='mediaDevice.description'
                  class='w-full'
                  maxlength='5000'
                  name='description'
                  rows='5'/>
                <div v-else>
                  {{ mediaDevice.description }}
                </div>
              </div>
            </div>

            <div class='field'>
              <label class='font-bold'>{{
                t('meeting.mediaDevice.mediaOrDevice')
              }}</label>
              <div>
                <NamedDropdown
                  v-if='!isDetail'
                  v-model='mediaDevice.mediaOrDevice'
                  class='w-20rem'
                  name='mediaOrDevice'
                  option-label='label'
                  option-value='value'
                  :options='mediaOrDeviceOp'/>
                <div v-else>
                  {{
                    t(
                      `meeting.mediaDevice.${mediaDevice.mediaOrDevice ? 'media' : 'device'}`,
                    )
                  }}
                </div>
              </div>
            </div>

            <div class='align-items-center flex justify-content-between'>
              <div class='field'>
                <label class='font-bold'>{{
                  t('meeting.mediaDevice.status')
                }}</label>
                <div>
                  <NamedDropdown
                    v-if='!isDetail'
                    v-model='mediaDevice.status'
                    class='w-20rem'
                    name='status'
                    option-label='label'
                    option-value='value'
                    :options='statuses'/>
                  <div v-else>
                    {{
                      t(
                        `common.statuses.${mediaDevice.status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`,
                      )
                    }}
                  </div>
                </div>
              </div>

              <div
                v-if='!isDetail'
                class='field'>
                <label class='font-bold'>{{
                  t(`meeting.mediaDevice.norder`)
                }}</label>
                <div>
                  <InputNumber
                    v-model='mediaDevice.norder'
                    input-id='integeronly'/>
                  <input
                    v-model='mediaDevice.norder'
                    hidden
                    name='norder'/>
                </div>
              </div>
            </div>

            <div class='field'>
              <div class='align-items-center flex flex justify-content-between'>
                <label class='font-bold'>{{
                  t('meeting.mediaDevice.imgMediaDevice')
                }}</label>
                <ButtonIcon
                  v-if='!isDetail'
                  v-tooltip="'Chọn ' + t('meeting.mediaDevice.imgMediaDevice')"
                  icon='add_circle'
                  icon-size='1.5'
                  rounded
                  style='margin-left: auto'
                  text
                  @click='triggerFileInput'/>
                <input
                  ref='fileInput'
                  accept='image/*'
                  hidden
                  multiple
                  name='images'
                  type='file'
                  @change='handleFileChange'/>
              </div>
            </div>
            <input
              v-model='mediaDevice.idFilesDelete'
              hidden
              name='idFilesDelete'/>
            <Galleria
              v-model:active-index='imgIndex'
              :circular='true'
              container-class='w-full'
              :num-visible='5'
              :value='imgsMediaDevice'>
              <template #item='slotProps'>
                <div class='image-container'>
                  <ButtonIcon
                    v-if='!isDetail'
                    v-tooltip.top="t('common.delete')"
                    class='delete-btn'
                    icon='delete'
                    icon-size='1.5'
                    rounded
                    @click='
                      removeImage(imgsMediaDevice.indexOf(slotProps.item))
                    '/>
                  <img
                    :alt="slotProps.item ? slotProps.item.name : ''"
                    class='h-25rem'
                    :src="slotProps.item ? slotProps.item.url : ''"/>
                </div>
              </template>
              <template #thumbnail='slotProps'>
                <img
                  :alt="slotProps.item ? slotProps.item.name : ''"
                  class='h-5rem'
                  :src="slotProps.item ? slotProps.item.url : ''"/>
              </template>
            </Galleria>
          </div>
          <div
            class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
            style='width: 99%'>
            <Button
              class='p-button-plain'
              icon='pi pi-times'
              :label="t('common.close')"
              severity='danger'
              @click="emits('hide-dialog')"/>
            <Button
              v-if='!isDetail'
              :disabled='isDisable'
              icon='pi pi-save'
              :label="t('common.save')"
              type='submit'/>
          </div>
        </div>
      </form>
    </div>
  </component>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createMediaDevice, updateMediaDevice, } from '@/apps/meeting/api/rest/mediaDevice';
import { getMediaDeviceById, maxNOrder, } from '@/apps/meeting/graphql/media-device';
import type { IMediaDevice } from '@/apps/meeting/model/mediaDevice';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import { ACTIVITY_STATUSES, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isSidebar: {
    type: Boolean,
    default: true,
  },
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
const isDisable = ref(false);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const mediaDevice = ref<IMediaDevice>({} as IMediaDevice);
const imgsMediaDevice = ref<any[]>([]);
const imgIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('meeting.mediaDevice.error.requiredName'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, mediaDevice);

if (!props.id) {
  mediaDevice.value.mediaOrDevice = true;
  mediaDevice.value.status = ACTIVITY_STATUSES.ACTIVE;
  const { onResult } = maxNOrder();
  onResult((res) => {
    mediaDevice.value.norder = res.data.maxNOrderMediaDevice;
  });
}

if (props.id) {
  const { onResult: mediaDeviceOnResult } = getMediaDeviceById(props.id);
  mediaDeviceOnResult((res) => {
    mediaDevice.value = { ...res.data.getMediaDeviceById };
    imgsMediaDevice.value = mediaDevice.value.images.map((x) => ({
      id: x.id,
      name: x.name,
      url: generatePreviewFileUrl(x.path),
    }));
  });
}

const statuses = ref([
  {
    value: ACTIVITY_STATUSES.ACTIVE,
    label: t('common.statuses.active'),
  },
  {
    value: ACTIVITY_STATUSES.DEACTIVATE,
    label: t('common.statuses.deactivate'),
  },
]);

const mediaOrDeviceOp = ref([
  {
    value: true,
    label: t('meeting.mediaDevice.media'),
  },
  {
    value: false,
    label: t('meeting.mediaDevice.device'),
  },
]);

function submitMediaDevice() {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid) {
        if (form.value) {
          const formData = new FormData(form.value);
          if (props.id) {
            formData.append('id', props.id);
            updateMediaDevice(formData).then(() => {
              toastSuccess({ message: t('meeting.common.saveSuccess') });
              emits('hide-dialog');
            });
          } else {
            createMediaDevice(formData).then(() => {
              toastSuccess({ message: t('meeting.common.saveSuccess') });
              emits('hide-dialog');
            });
          }
        }
      }
    })
    .then(() => isDisable.value = false);
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgsMediaDevice.value.push({
          name: file.name,
          url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

function removeImage(index: number) {
  if (index === imgsMediaDevice.value.length - 1) {
    imgIndex.value = 0;
  }
  if (imgsMediaDevice.value[index].id) {
    if (!mediaDevice.value.idFilesDelete) {
      mediaDevice.value.idFilesDelete = [];
    }
    mediaDevice.value.idFilesDelete = [
      ...mediaDevice.value.idFilesDelete,
      imgsMediaDevice.value[index].id,
    ];
  }
  imgsMediaDevice.value.splice(index, 1);
}
</script>

<style lang='scss' scoped>
.image-container {
  position: relative;
}

.delete-btn {
  position: absolute;
  right: 0.7rem;
  top: 0.7rem;
  display: none;
  background-color: red;
}

.image-container:hover .delete-btn {
  display: block;
}
</style>
