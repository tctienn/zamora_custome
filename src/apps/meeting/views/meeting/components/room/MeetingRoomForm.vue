<template>
  <component
    :is="isSidebar && !isDetail ? 'Sidebar' : 'Dialog'"
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      isDetail
        ? t('meeting.meetingRoom.titleForm')
        : t(`meeting.common.${id ? 'update' : 'create'}`) +
          ' ' +
          t('meeting.meetingRoom.titleForm')
    "
    :position="isSidebar && !isDetail ? 'right' : undefined"
    @hide="emits('hide-dialog')">
    <div>
      <form
        ref='form'
        @submit.prevent='submitMeetingRoom'>
        <div class='formgrid grid mb-4'>
          <div class='col'>
            <div class='field'>
              <label
                v-required
                class='font-bold'>{{
                  t(`meeting.meetingRoom.nameMeetingRoom`)
                }}</label>
              <div v-if='!isDetail'>
                <InputText
                  v-model='meetingRoom.name'
                  class='p-component p-inputtext w-full'
                  maxlength='255'
                  name='name'/>
                <ValidateErrorMessage :errors='v$.name.$errors'/>
              </div>
              <div v-else>
                {{ meetingRoom.name }}
              </div>
            </div>

            <div class='field'>
              <label class='font-bold'>{{
                t('meeting.meetingRoom.address')
              }}</label>
              <div>
                <Textarea
                  v-if='!isDetail'
                  v-model='meetingRoom.address'
                  class='w-full'
                  maxlength='5000'
                  name='address'
                  rows='5'/>
                <div v-else>
                  {{ meetingRoom.address }}
                </div>
              </div>
            </div>

            <div class='align-items-center flex justify-content-between'>
              <div class='field'>
                <label class='font-bold'>{{
                  t('meeting.meetingRoom.status')
                }}</label>
                <div>
                  <NamedDropdown
                    v-if='!isDetail'
                    v-model='meetingRoom.status'
                    class='w-20rem'
                    :is-show-clear='true'
                    name='status'
                    option-label='label'
                    option-value='value'
                    :options='statuses'/>
                  <div v-else>
                    {{
                      t(
                        `common.statuses.${meetingRoom.status === ACTIVITY_STATUSES.ACTIVE ? 'active' : 'deactivate'}`,
                      )
                    }}
                  </div>
                </div>
              </div>

              <div
                v-if='!isDetail'
                class='field'>
                <label class='font-bold'>{{
                  t(`meeting.meetingRoom.norder`)
                }}</label>
                <div>
                  <InputNumber
                    v-model='meetingRoom.norder'
                    input-id='integeronly'/>
                  <input
                    v-model='meetingRoom.norder'
                    hidden
                    name='norder'/>
                </div>
              </div>
            </div>

            <div class='field'>
              <div class='align-items-center flex flex justify-content-between'>
                <label class='font-bold'>{{
                  t('meeting.meetingRoom.imgMeetingRoom')
                }}</label>
                <ButtonIcon
                  v-if='!isDetail'
                  v-tooltip="'Chọn ' + t('meeting.meetingRoom.imgMeetingRoom')"
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
              v-model='meetingRoom.idFilesDelete'
              hidden
              name='idFilesDelete'/>
            <!--            <Carousel-->
            <!--              :num-scroll='1'-->
            <!--              :num-visible='3'-->
            <!--              :value='imgsMeetingRoom'>-->
            <!--              <template #item='slotProps'>-->
            <!--                <div class='image-container'>-->
            <!--                  <img-->
            <!--                    :alt='slotProps.data.name'-->
            <!--                    class='max-h-25rem p-2 rounded w-full'-->
            <!--                    :src='slotProps.data.url'-->
            <!--                    style='object-fit:cover'/>-->
            <!--                  <ButtonIcon-->
            <!--                    v-tooltip.top='t("common.delete")'-->
            <!--                    class='delete-btn'-->
            <!--                    icon='delete'-->
            <!--                    icon-size='1.5'-->
            <!--                    rounded-->
            <!--                    @click='removeImage(slotProps.index)'/>-->
            <!--                </div>-->
            <!--              </template>-->
            <!--            </Carousel>-->

            <Galleria
              v-model:active-index='imgIndex'
              :circular='true'
              container-class='w-full'
              :num-visible='5'
              :value='imgsMeetingRoom'>
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
                      removeImage(imgsMeetingRoom.indexOf(slotProps.item))
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

import { createMeetingRoom, updateMeetingRoom, } from '@/apps/meeting/api/rest/meetingRoomApi';
import { getMeetingRoomById, maxNOrder, } from '@/apps/meeting/graphql/meeting-room';
import type { IMeetingRoom } from '@/apps/meeting/model/meeting-room';
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
const meetingRoom = ref<IMeetingRoom>({} as IMeetingRoom);
const imgsMeetingRoom = ref<any[]>([]);
const imgIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const validateRules = {
  name: {
    required: helpers.withMessage(
      t('meeting.meetingRoom.error.requiredName'),
      required,
    ),
  },
};

const v$ = useVuelidate(validateRules, meetingRoom);

if (!props.id) {
  meetingRoom.value.status = ACTIVITY_STATUSES.ACTIVE;
  const { onResult } = maxNOrder();
  onResult((res) => {
    meetingRoom.value.norder = res.data.maxNOrderMeetingRoom;
  });
}

if (props.id) {
  const { onResult: meetingRoomOnResult } = getMeetingRoomById(props.id);
  meetingRoomOnResult((res) => {
    meetingRoom.value = { ...res.data.getMeetingRoomById };
    imgsMeetingRoom.value = meetingRoom.value.images.map((x) => ({
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

function submitMeetingRoom() {
  isDisable.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid) {
        if (form.value) {
          const formData = new FormData(form.value);
          if (props.id) {
            formData.append('id', props.id);
            updateMeetingRoom(formData).then(() => {
              toastSuccess({ message: t('meeting.common.saveSuccess') });
              emits('hide-dialog');
            });
          } else {
            createMeetingRoom(formData).then(() => {
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
        imgsMeetingRoom.value.push({
          name: file.name,
          url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

function removeImage(index: number) {
  if (index === imgsMeetingRoom.value.length - 1) {
    imgIndex.value = 0;
  }
  if (imgsMeetingRoom.value[index].id) {
    if (!meetingRoom.value.idFilesDelete) {
      meetingRoom.value.idFilesDelete = [];
    }
    meetingRoom.value.idFilesDelete = [
      ...meetingRoom.value.idFilesDelete,
      imgsMeetingRoom.value[index].id,
    ];
  }
  imgsMeetingRoom.value.splice(index, 1);
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
