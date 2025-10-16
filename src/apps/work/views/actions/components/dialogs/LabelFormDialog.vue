<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='headerDialog'
    @hide='emits("hide-dialog")'>
    <div
      class='flex-column mt-1 p-fluid'>
      <div class='align-items-center form grid'>
        <div class='col-5 px-3 py-2'>
          <span class='align-items-center flex'>
            <label
              class='w-5'
              for='id'>{{ t('work.taskLabel.labelTitle') }}</label>
            <InputText
              id='labelTitle'
              v-model='labelTitle'
              v-trim
              :placeholder='t("work.taskLabel.labelTitle")'/>
          </span>
          <ValidateErrorMessage :errors='v$.labelTitle.$errors'/>
        </div>

      </div>
      <div class='align-items-center form grid mt-2'>
        <div class='col-12 px-3 py-2'>
          <span class='align-items-center flex'>
            <template
              v-for='colorOption in availableColors'
              :key='colorOption'>
              <input
                :id='colorOption'
                v-model='selectedColor'
                name='colorRadio'
                type='radio'
                :value='colorOption'/>
              <label
                class='custom-radio-color-label'
                :for='colorOption'>
                <span :style='{ background: colorOption }'></span>
              </label>
            </template>

            <span
              class='add-color'
              @click='showColorPicker'>+</span>

          </span>
        </div>

      </div>
    </div>
    <div
      v-if='showAddColor'
      class='align-items-center form grid ml-2 mt-4'>
      <ColorPicker
        v-model:pure-color='color'
        disable-alpha
        is-widget
        picker-type='fk'/>
      <ButtonIcon
        v-tooltip.top='t("common.save")'
        icon='Check'
        rounded
        text
        @click='addColor'></ButtonIcon>
      <ButtonIcon
        v-tooltip.top='t("common.close")'
        icon='Close'
        rounded
        text
        @click='showColorPicker'></ButtonIcon>
    </div>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import 'vue3-colorpicker/style.css';

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { isEmpty, toLower } from 'lodash';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ColorPicker } from 'vue3-colorpicker';

import ValidateErrorMessage from '@/apps/admin/components/custom/ValidateErrorMessage.vue';
import { labelSaveGraphql } from '@/apps/work/api/graphql/label-api';
import type { LabelInput } from '@/apps/work/model/taskLabel';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetailCreate: false,
  idTask: ''
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();

const visible = ref(props.visibleDialog);
const isCreate = isEmpty(props.idTask);
const headerDialog = t('common.createItem', { item: toLower(t('work.taskLabel.objectName')) });
const labelTitle = ref('');
const color = ref('');

const { mutate: saveMutate, onDone: saveOnDone } = labelSaveGraphql();

const validateRules = { labelTitle: { required: helpers.withMessage(t('work.taskLabel.message.labelTitleEmpty'), required) } };

const v$ = useVuelidate(validateRules, { labelTitle });

function saveEvaluateTask() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const task: LabelInput = {
        id: selectedColor.value,
        labelColor: selectedColor.value,
        labelTitle: labelTitle.value
      };
      saveMutate({ labelInput: task });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

const selectedColor = ref('#DB2828');
const availableColors = [
  '#DB2828',
  '#F2711C',
  '#FBBD08',
  '#B5CC18',
  '#21BA45',
  '#00B5AD',
  '#2185D0',
  '#6435C9',
  '#A333C8',
  '#E03997',
];

saveOnDone(() => {
  toastSuccess({
    message: t('common.result.message.created', {
      itemType: t('work.taskLabel.objectName'),
      itemName: ''
    })
  });
  emits('reload');
  emits('hide-dialog');
});

interface ConfigFormProps {
  visibleDialog: boolean,
  idTask: string,
}

const deadlineTaskFormFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    text: false,
    type: 'button',
    command: () => saveEvaluateTask()
  }
};
provide('dialogFooterButtons', deadlineTaskFormFooterButtons);

const showAddColor = ref(false);

function showColorPicker() {
  showAddColor.value = !showAddColor.value;
}

function addColor() {
  if (color.value) {
    let validColor = rgbToHex(color.value);

    if (!validColor.startsWith('#')) {
      validColor = `#${validColor}`;
    }

    if (isValidHexColor(validColor) && !availableColors.includes(validColor)) {
      availableColors.push(validColor);
      color.value = '';
    }
  }

  function isValidHexColor(hex: string) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(hex);
  }
}

function rgbToHex(rgb: string) {
  const parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (!parts) {
    return '';
  }

  const red = parseInt(parts[1]);
  const green = parseInt(parts[2]);
  const blue = parseInt(parts[3]);

  return '#' + (1 << 24 | red << 16 | green << 8 | blue).toString(16).slice(1);
}

</script>

<script lang='ts'>
export default { name: 'LabelDialog' };
</script>

<style>

input[name="colorRadio"] {
  display: none;
}

.custom-radio-color-label {
  display: inline-block;
  width: 25px;
  height: 25px;
  margin-right: 10px;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
}

.custom-radio-color-label:hover span {
  transform: scale(1.25);
}

.custom-radio-color-label span {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-in-out;
  border-radius: 50%;
  position: relative;
}

.custom-radio-color-label span::before {
  content: "✔";
  font-size: 20px;
  line-height: 25px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  opacity: 0;
  pointer-events: none;
}

input[type="radio"]:checked + .custom-radio-color-label span::before {
  opacity: 1;
}

.add-color {
  display: inline-block;
  width: 25px;
  height: 25px;
  cursor: pointer;
  position: relative;
  text-align: center;
  font-size: 20px;
  line-height: 25px;
  background: #ccc;
  border-radius: 50%;
}

.add-color:hover {
  background: #aaa;
}

</style>
